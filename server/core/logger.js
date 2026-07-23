/**
 * Centralized Logger
 * Provides structured logging for jobs, errors, and system events.
 */

export const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({ level: "INFO", timestamp: new Date().toISOString(), message, ...meta }));
  },
  warn: (message, meta = {}) => {
    console.warn(JSON.stringify({ level: "WARN", timestamp: new Date().toISOString(), message, ...meta }));
  },
  error: (message, error = null, meta = {}) => {
    const errorDetails = error ? { 
      error_message: error.message, 
      error_stack: error.stack 
    } : {};
    console.error(JSON.stringify({ level: "ERROR", timestamp: new Date().toISOString(), message, ...errorDetails, ...meta }));
  },
  job: (jobId, projectId, stage, message, durationMs = null, meta = {}) => {
    const log = {
      level: "JOB",
      timestamp: new Date().toISOString(),
      jobId,
      projectId,
      stage,
      message,
      ...meta
    };
    if (durationMs !== null) log.durationMs = durationMs;
    console.log(JSON.stringify(log));
  }
};
