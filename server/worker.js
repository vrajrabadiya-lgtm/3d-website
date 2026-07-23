import "dotenv/config";
import "./queue/workers/projectWorker.js";
import "./queue/utils/queueEvents.js";
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/3d-builder";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Worker connected to MongoDB successfully.");
  })
  .catch((err) => {
    console.error("Worker MongoDB connection error:", err.message);
  });

console.log("Worker process started...");
