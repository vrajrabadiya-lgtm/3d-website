import { enqueueProjectGeneration, getJobState } from "./queue/queues/projectQueue.js";
// Import worker and events to start them listening
import "./queue/workers/projectWorker.js";
import "./queue/utils/queueEvents.js";
import { connection } from "./queue/config/redis.js";

async function testQueue() {
  console.log("Starting Queue Verification...");
  
  try {
    // 1. Enqueue a mock job
    const job = await enqueueProjectGeneration({ prompt: "Test queue infrastructure" });
    console.log(`Job queued with ID: ${job.id}`);

    // Wait for completion (worker simulates 3 seconds of work)
    console.log("Waiting for worker to process...");
    await new Promise(resolve => setTimeout(resolve, 3500));

    // 2. Verify job state
    const state = await getJobState(job.id);
    console.log(`Final Job State: ${state}`);

  } catch (error) {
    console.error("Queue verification failed:", error);
  } finally {
    // Cleanup Redis connection to exit gracefully
    setTimeout(() => {
      connection.quit();
      process.exit(0);
    }, 500);
  }
}

testQueue();
