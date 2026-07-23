import "dotenv/config";
import mongoose from "mongoose";
import Project from "./models/Project.js";
import { enqueueProjectGeneration } from "./queue/queues/projectQueue.js";

async function runTest() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  // Test 1: Normal Run
  const project = new Project({
    userId: new mongoose.Types.ObjectId(), // Fake User ID
    title: "Phase 5 Normal Test",
    prompt: "Create a modern landing page for a coffee shop with 3D elements",
    status: "PENDING"
  });

  await project.save();
  console.log(`Created Project: ${project._id}`);

  await enqueueProjectGeneration({
    projectId: project._id,
    title: project.title,
    prompt: project.prompt
  });

  console.log("Job Enqueued. Watch the worker logs.");
  process.exit(0);
}

runTest();
