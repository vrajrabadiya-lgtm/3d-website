import { Worker } from "bullmq";
import { connection } from "../config/redis.js";
import Project from "../../models/Project.js";
import { analyzePrompt } from "../../core/AIArchitect.js";
import { generateBlueprint } from "../../core/BlueprintGenerator.js";
import { runThreeDSceneAgent } from "../../core/AgentWebsiteOrchestrator.js";
import { generateAllCode } from "../../core/CodeGenerator.js";
import { logger } from "../../core/logger.js";

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
      await updateProgress(project, 95, "Thumbnail Generation");
      
      // 7. Completion
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
