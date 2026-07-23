import { QueueEvents } from "bullmq";
import { connection } from "../config/redis.js";
import { logger } from "../../core/logger.js";
import { projectQueue } from "../queues/projectQueue.js";

const QUEUE_NAME = "project-generation";

export const queueEvents = new QueueEvents(QUEUE_NAME, { connection });

queueEvents.on("waiting", ({ jobId }) => {
  logger.info(`Job waiting: ${jobId}`, { jobId, event: "waiting" });
});

queueEvents.on("active", ({ jobId, prev }) => {
  logger.info(`Job active: ${jobId}`, { jobId, prev, event: "active" });
});

queueEvents.on("completed", ({ jobId, returnvalue }) => {
  logger.info(`Job completed: ${jobId}`, { jobId, returnvalue, event: "completed" });
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
  logger.error(`Job failed: ${jobId}`, new Error(failedReason), { jobId, event: "failed" });
});

queueEvents.on("stalled", ({ jobId }) => {
  logger.warn(`Job stalled: ${jobId}`, { jobId, event: "stalled" });
});

// Periodic Queue Monitoring
setInterval(async () => {
  try {
    const counts = await projectQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
    logger.info("Queue Metrics", { metrics: counts });
  } catch (error) {
    logger.error("Failed to fetch queue metrics", error);
  }
}, 30000); // Log metrics every 30 seconds
