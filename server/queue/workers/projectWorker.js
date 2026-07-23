import { Worker } from "bullmq";
import { connection } from "../config/redis.js";

const QUEUE_NAME = "project-generation";

// Worker configuration
export const projectWorker = new Worker(
  QUEUE_NAME,
  async (job) => {
    // Phase 2.1: Mock implementation without AI logic
    console.log(`\n[Worker] Job received: ${job.id}`);
    console.log(`[Worker] Job started: Processing project payload...`);
    
    // Simulate some work
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    console.log(`[Worker] Job completed: ${job.id}\n`);
    
    return { success: true, message: "Infrastructure verification complete" };
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
