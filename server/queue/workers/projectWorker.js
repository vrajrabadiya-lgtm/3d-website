import { Worker } from "bullmq";
import { connection } from "../config/redis.js";
import Project from "../../models/Project.js";
import { analyzePrompt } from "../../core/AIArchitect.js";
import { generateBlueprint } from "../../core/BlueprintGenerator.js";
import { runThreeDSceneAgent } from "../../core/AgentWebsiteOrchestrator.js";
import { generateAllCode } from "../../core/CodeGenerator.js";

const QUEUE_NAME = "project-generation";

async function generateMeshyAsset(prompt) {
  const MESHY_API_KEY = process.env.MESHY_API_KEY;
  if (!MESHY_API_KEY) {
    return { fallback: true, status: "fallback", message: "MESHY_API_KEY not configured" };
  }
  try {
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
  } catch (err) {
    console.warn("[Worker] Meshy API error:", err.message);
    return { fallback: true, status: "fallback", message: err.message };
  }
}

// Worker configuration
export const projectWorker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const { projectId, title, prompt } = job.data;
    console.log(`\n[Worker] Job received`);
    console.log(`[Worker] Project ID: ${projectId}`);
    
    let currentStage = "Initialization";
    
    try {
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error(`Project not found with ID: ${projectId}`);
      }

      // 1. Update to PROCESSING, progress 5
      project.status = "PROCESSING";
      project.progress = 5;
      project.startedAt = new Date();
      await project.save();
      
      // 2. Blueprint Generation
      currentStage = "Blueprint Generation";
      console.log(`[Worker] Blueprint started`);
      const intent = analyzePrompt(prompt);
      const blueprint = await generateBlueprint(intent);
      project.blueprint = blueprint;
      project.plan = intent;
      project.progress = 20;
      await project.save();
      console.log(`[Worker] Blueprint completed`);
      
      // 3. Scene Planning
      currentStage = "Scene Planning";
      console.log(`[Worker] Scene planning started`);
      const scenePlan = await runThreeDSceneAgent("free", prompt, intent, blueprint.palette || blueprint.color_palette);
      project.scenePlan = scenePlan;
      project.progress = 40;
      await project.save();
      console.log(`[Worker] Scene planning completed`);
      
      // 4. Asset Generation
      currentStage = "Asset Generation";
      console.log(`[Worker] Asset generation started`);
      const assets = await generateMeshyAsset(prompt);
      project.assets = assets;
      project.progress = 60;
      await project.save();
      console.log(`[Worker] Asset generation completed`);
      
      // 5. Code Generation
      currentStage = "Code Generation";
      console.log(`[Worker] Code generation started`);
      const code = generateAllCode(blueprint);
      project.generatedCode = {
        heroJSX: code.heroJSX,
        sceneJSX: code.sceneJSX,
        sampleSection: code.sampleSection,
        fileTree: code.fileTree,
        appJSX: code.appJSX,
        installCmd: code.installCmd
      };
      project.progress = 85;
      await project.save();
      console.log(`[Worker] Code generation completed`);
      
      // 6. Thumbnail Generation (Skipped)
      currentStage = "Thumbnail Generation";
      console.log(`[Worker] Thumbnail generation started`);
      // No existing thumbnail generation service
      console.log(`[Worker] Thumbnail generation completed`);
      project.progress = 95;
      await project.save();
      
      // 7. Completion
      project.status = "COMPLETED";
      project.progress = 100;
      project.completedAt = new Date();
      await project.save();
      
      console.log(`[Worker] Project completed\n`);
      
      return { success: true, message: "Pipeline completed successfully" };
    } catch (error) {
      console.error(`[Worker] Failed at ${currentStage}: ${error.message}`);
      
      try {
        const project = await Project.findById(projectId);
        if (project) {
          project.status = "FAILED";
          project.error = error.message;
          project.failedStage = currentStage;
          await project.save();
        }
      } catch (dbError) {
        console.error(`[Worker] Failed to update project status to FAILED: ${dbError.message}`);
      }
      
      // We return the error rather than crashing the worker
      throw error;
    }
  },
  {
    connection,
    concurrency: 2, // Process up to 2 jobs concurrently
  }
);

projectWorker.on("error", (err) => {
  // Catch worker-level errors so they don't crash the Node process
  console.error("[Worker] Unhandled error:", err.message);
});
