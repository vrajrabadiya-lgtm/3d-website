import { Queue } from "bullmq";
import { connection } from "../config/redis.js";

const QUEUE_NAME = "project-generation";

// Configure production-safe defaults
export const projectQueue = new Queue(QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: true, // Prevent Redis memory bloat
    removeOnFail: false,    // Keep failed jobs for inspection
  },
});

/**
 * Reusable helper: Enqueue a project generation task
 */
export async function enqueueProjectGeneration(jobData, options = {}) {
  try {
    const job = await projectQueue.add("generate-website", jobData, {
      jobId: jobData.projectId.toString(), // Idempotency key must be string
      ...options
    });
    console.log(`[Queue] Job enqueued successfully: ${job.id}`);
    return job;
  } catch (error) {
    console.error("[Queue] Failed to enqueue job:", error.message);
    throw error;
  }
}

/**
 * Reusable helper: Fetch a job by ID
 */
export async function getJob(jobId) {
  return await projectQueue.getJob(jobId);
}

/**
 * Reusable helper: Fetch job state
 */
export async function getJobState(jobId) {
  const job = await getJob(jobId);
  return job ? await job.getState() : "unknown";
}

/**
 * Reusable helper: Remove a job from queue
 */
export async function removeJob(jobId) {
  const job = await getJob(jobId);
  if (job) {
    await job.remove();
    console.log(`[Queue] Job removed successfully: ${jobId}`);
    return true;
  }
  return false;
}
