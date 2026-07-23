import "dotenv/config";
import { logger } from "./logger.js";

/**
 * Validates that all required environment variables are present on startup.
 * Fails fast by throwing an error if configuration is invalid.
 */
export function validateConfig() {
  const requiredVars = [
    "MONGO_URI",
    "DATABASE_NAME",
    "JWT_SECRET",
    "GOOGLE_PROJECT_ID",
    "GOOGLE_LOCATION",
  ];

  const missing = [];

  for (const v of requiredVars) {
    if (!process.env[v]) {
      missing.push(v);
    }
  }

  if (!process.env.REDIS_HOST && !process.env.REDIS_URL) {
    missing.push("REDIS_HOST or REDIS_URL");
  }

  // AI Provider check
  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    missing.push("GEMINI_API_KEY or GOOGLE_APPLICATION_CREDENTIALS");
  }

  if (missing.length > 0) {
    const errorMsg = `FATAL ERROR: Missing required environment configuration: ${missing.join(", ")}`;
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  logger.info("Configuration validated successfully.");
}
