import Redis from "ioredis";

// Reusable Redis connection supporting both cloud URLs and local configurations
const redisConfig = process.env.REDIS_URL
  ? process.env.REDIS_URL
  : {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null, // Required by BullMQ
    };

const connection = new Redis(redisConfig, {
  maxRetriesPerRequest: null,
});

connection.on("error", (err) => {
  console.error("[Redis] Connection error:", err.message);
});

connection.on("ready", () => {
  console.log("[Redis] Connected successfully to Queue Infrastructure.");
});

export { connection };
