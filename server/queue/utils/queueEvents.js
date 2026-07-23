import { QueueEvents } from "bullmq";
import { connection } from "../config/redis.js";

const QUEUE_NAME = "project-generation";

export const queueEvents = new QueueEvents(QUEUE_NAME, { connection });

queueEvents.on("waiting", ({ jobId }) => {
  console.log(`[QueueEvent] Job waiting: ${jobId}`);
});

queueEvents.on("active", ({ jobId, prev }) => {
  console.log(`[QueueEvent] Job active: ${jobId} (prev: ${prev})`);
});

queueEvents.on("completed", ({ jobId, returnvalue }) => {
  console.log(`[QueueEvent] Job completed: ${jobId} =>`, returnvalue);
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
  console.error(`[QueueEvent] Job failed: ${jobId} | Reason: ${failedReason}`);
});

queueEvents.on("stalled", ({ jobId }) => {
  console.warn(`[QueueEvent] Job stalled: ${jobId}`);
});
