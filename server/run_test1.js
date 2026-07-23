import "dotenv/config";
import mongoose from "mongoose";
import { enqueueProjectGeneration } from "./queue/queues/projectQueue.js";
import Project from "./models/Project.js";
import { connection } from "./queue/config/redis.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/3d-builder";

async function runTest1() {
  await mongoose.connect(MONGO_URI);
  
  const newProject = new Project({
    userId: new mongoose.Types.ObjectId(),
    title: "Test 1 Project",
    prompt: "Create a 3D model of a futuristic car",
    status: "PENDING",
    progress: 0
  });

  const savedProject = await newProject.save();
  console.log("Project created:", savedProject._id);

  const job = await enqueueProjectGeneration({
    projectId: savedProject._id,
    userId: savedProject.userId,
    title: savedProject.title,
    prompt: savedProject.prompt
  });
  console.log("Job queued:", job.id);

  setTimeout(async () => {
    connection.quit();
    await mongoose.disconnect();
    process.exit(0);
  }, 1000);
}

runTest1();
