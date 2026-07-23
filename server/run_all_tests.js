import "dotenv/config";
import mongoose from "mongoose";
import { enqueueProjectGeneration } from "./queue/queues/projectQueue.js";
import Project from "./models/Project.js";
import { connection } from "./queue/config/redis.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/3d-builder";

async function createJob(promptText) {
  const newProject = new Project({
    userId: new mongoose.Types.ObjectId(),
    title: "Phase 4 Test",
    prompt: promptText,
    status: "PENDING",
    progress: 0
  });

  const savedProject = await newProject.save();
  await enqueueProjectGeneration({
    projectId: savedProject._id,
    userId: savedProject.userId,
    title: savedProject.title,
    prompt: savedProject.prompt
  });
  console.log(`Job queued with prompt [${promptText}]: ${savedProject._id}`);
}

async function runTests() {
  await mongoose.connect(MONGO_URI);
  
  await createJob("NORMAL");
  await createJob("TEST_ASSET_FAILURE");
  await createJob("TEST_CODE_FAILURE");
  await createJob("TEST_BOTH_FAILURE");

  // Test 7 - Queue Stability
  for(let i=0; i<5; i++) {
    await createJob("NORMAL_QUEUE_STABILITY_" + i);
  }

  setTimeout(async () => {
    connection.quit();
    await mongoose.disconnect();
    process.exit(0);
  }, 2000);
}

runTests();
