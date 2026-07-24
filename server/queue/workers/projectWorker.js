import { Worker } from "bullmq";
import { connection } from "../config/redis.js";
import Project from "../../models/Project.js";
import { analyzePrompt } from "../../core/AIArchitect.js";
import { generateBlueprint } from "../../core/BlueprintGenerator.js";
import { runThreeDSceneAgent } from "../../core/AgentWebsiteOrchestrator.js";
import { generateAllCode } from "../../core/CodeGenerator.js";
import { logger } from "../../core/logger.js";
import { ProjectBuilder } from "../../core/ProjectBuilder.js";
import { BuildDiagnostics } from "../../core/BuildDiagnostics.js";

const QUEUE_NAME = "ProjectQueue";

async function generateMeshyAsset(prompt) {
  const MESHY_API_KEY = process.env.MESHY_API_KEY;
  if (!MESHY_API_KEY) {
    throw new Error("MESHY_API_KEY not configured");
  }
  
  const response = await fetch("https://api.meshy.ai/v1/image-to-3d", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MESHY_API_KEY}`,
    },
    body: JSON.stringify({
      image_url: "",
      prompt: prompt,
      negative_prompt: "low quality, blurry, distorted",
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Meshy API returned ${response.status}`);
  }
  const data = await response.json();
  return {
    modelUrl: data.model_urls?.glb || null,
    previewUrl: data.preview_url || null,
    fallback: false,
    status: "success",
  };
}

function getErrorClassification(stage, errorMessage) {
  if (stage === "Asset Generation") return "MeshyError";
  if (errorMessage.includes("API key") || errorMessage.includes("fetch") || stage.includes("Blueprint") || stage.includes("Scene")) {
    return "GeminiError";
  }
  if (errorMessage.includes("ECONNREFUSED") || errorMessage.includes("redis")) return "RedisError";
  if (errorMessage.includes("Mongo") || errorMessage.includes("E11000")) return "MongoError";
  return "ValidationError";
}

// Worker configuration
export const projectWorker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const { projectId, title, prompt } = job.data;
    const jobId = job.id;
    logger.job(jobId, projectId, "Init", "Job received");
    
    let currentStage = "Initialization";
    let stageStartTime = Date.now();
    
    const totalStartTime = Date.now();
    const updateProgress = async (project, progress, stageName) => {
      // Idempotent assignment
      project.progress = progress;
      await project.save();
      const duration = Date.now() - stageStartTime;
      logger.job(jobId, projectId, stageName, `${stageName} completed`, duration);
      currentStage = stageName; // Move to next stage
      stageStartTime = Date.now(); // Reset timer for next stage
    };

    try {
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error("Project not found in database");
      }

      // 1. Initial Status Update
      project.status = "PROCESSING";
      await updateProgress(project, 5, "Initialization");
      
      // 2. Blueprint Generation
      currentStage = "Blueprint Generation";
      logger.job(jobId, projectId, currentStage, "Started Blueprint Generation");
      const intent = analyzePrompt(prompt);
      const blueprint = await generateBlueprint(intent);
      project.blueprint = blueprint;
      project.plan = intent;
      await updateProgress(project, 20, "Blueprint Generation");
      
      // 3. Scene Planning
      currentStage = "Scene Planning";
      logger.job(jobId, projectId, currentStage, "Started Scene Planning");
      const scenePlan = await runThreeDSceneAgent("free", prompt, intent, blueprint.palette || blueprint.color_palette);
      project.scenePlan = scenePlan;
      await updateProgress(project, 40, "Scene Planning");
      
      // 4. Parallel Asset & Code Generation
      currentStage = "Parallel Asset & Code Generation";
      logger.job(jobId, projectId, currentStage, "Started parallel Asset & Code Generation");

      let parallelProgress = 40;
      const bumpProgress = async (stageName) => {
        parallelProgress = parallelProgress === 40 ? 65 : 85;
        await Project.updateOne({ _id: project._id }, { $set: { progress: parallelProgress } });
        project.progress = parallelProgress;
        
        const duration = Date.now() - stageStartTime;
        logger.job(jobId, projectId, stageName, `${stageName} completed`, duration);
      };

      const assetPromise = (async () => {
        try {
          const assets = await generateMeshyAsset(prompt);
          project.assets = assets;
        } catch (assetErr) {
          logger.warn(`Asset generation failed: ${assetErr.message}. Proceeding with fallback.`);
          project.assets = { fallback: true, status: "fallback", message: assetErr.message };
        }
        await bumpProgress("Asset Generation");
      })();

      const codePromise = (async () => {
        // Run code generation (synchronous but wrapped in promise)
        const code = generateAllCode(blueprint);
        project.generatedCode = {
          heroJSX: code.heroJSX,
          sceneJSX: code.sceneJSX,
          sampleSection: code.sampleSection,
          fileTree: code.fileTree,
          appJSX: code.appJSX,
          installCmd: code.installCmd
        };
        await bumpProgress("Code Generation");
      })();

      const [assetResult, codeResult] = await Promise.allSettled([assetPromise, codePromise]);

      // Persist the partial/complete generated components
      await project.save();

      if (codeResult.status === "rejected") {
        currentStage = "Code Generation";
        throw codeResult.reason;
      }
      if (assetResult.status === "rejected") {
        currentStage = "Asset Generation";
        throw assetResult.reason;
      }
      
      // 6. Thumbnail Generation (Skipped)
      currentStage = "Thumbnail Generation";
      logger.job(jobId, projectId, currentStage, "Thumbnail skipped");
      await updateProgress(project, 90, "Thumbnail Generation");
      
      // Initialize Builder
      const builder = new ProjectBuilder(projectId);

      try {
        // 7. Project Builder
        currentStage = "Project Builder";
        logger.job(jobId, projectId, currentStage, "Project Builder Started");
        await builder.setupProject(project);
        await updateProgress(project, 94, "Project Builder");

        // 8. Build Verification
        currentStage = "Build Verification";
        logger.job(jobId, projectId, currentStage, "Build Started");
        const buildResults = await builder.verifyBuild();
        project.buildStatus = buildResults.status;
        project.buildLogs = buildResults.logs;
        project.buildStartedAt = buildResults.startedAt;
        project.buildCompletedAt = buildResults.completedAt;
        if (buildResults.error || buildResults.status === "FAILED") {
          logger.warn(`Build verification failed but continuing: ${buildResults.error || 'Build script failed'}`);
          
          logger.job(jobId, projectId, "Build Diagnostics Started", "Analyzing build failure logs");
          const diagnostics = BuildDiagnostics.analyzeLogs(buildResults.logs);
          project.buildDiagnostics = diagnostics;
          logger.job(jobId, projectId, "Detected Category", diagnostics.category);
          logger.job(jobId, projectId, "Detected Summary", diagnostics.summary);
          logger.job(jobId, projectId, "Diagnostics Stored", "Structured diagnostics saved to MongoDB");
        } else {
          logger.job(jobId, projectId, currentStage, "Build Completed");
        }
        await project.save();
        await updateProgress(project, 97, "Build Verification");

        // 9. ZIP Generation
        currentStage = "ZIP Generation";
        logger.job(jobId, projectId, currentStage, "ZIP Started");
        const zipMetadata = await builder.generateZip();
        project.artifact = zipMetadata;
        logger.job(jobId, projectId, currentStage, "ZIP Completed");
        logger.job(jobId, projectId, "Artifact Storage", "Artifact Stored");
        await project.save();
        await updateProgress(project, 99, "ZIP Generation");
        
        // 10. Cleanup
        await builder.cleanup();

      } catch (builderError) {
        logger.error(`Builder failed at ${currentStage}`, builderError, { jobId, projectId });
        
        // If zip failed, try cleanup anyway
        await builder.cleanup();
        
        // Let it throw so it gets caught by the main catch block and sets project to FAILED
        throw builderError;
      }
      
      // 11. Completion
      currentStage = "Completion";
      project.status = "COMPLETED";
      project.progress = 100;
      project.completedAt = new Date();
      await project.save();
      
      const totalDuration = Date.now() - totalStartTime;
      logger.job(jobId, projectId, currentStage, `Project completed successfully in ${totalDuration}ms`, totalDuration);
      return { success: true, message: "Pipeline completed successfully", duration: totalDuration };
      
    } catch (error) {
      logger.error(`Job failed at ${currentStage}`, error, { jobId, projectId });
      
      try {
        const project = await Project.findById(projectId);
        if (project) {
          project.status = "FAILED";
          project.failedStage = currentStage;
          project.error = {
            message: error.message,
            errorType: getErrorClassification(currentStage, error.message),
            code: "INTERNAL_ERROR"
          };
          await project.save();
        }
      } catch (dbError) {
        logger.error("Failed to update project status to FAILED", dbError, { jobId, projectId });
      }
      
      throw error;
    }
  },
  {
    connection,
    concurrency: 2, 
  }
);

projectWorker.on("error", (err) => {
  logger.error("Worker unhandled error", err);
});
