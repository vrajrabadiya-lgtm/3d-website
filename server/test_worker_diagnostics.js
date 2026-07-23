import "dotenv/config";
import mongoose from "mongoose";
import Project from "./models/Project.js";
import { enqueueProjectGeneration } from "./queue/queues/projectQueue.js";

async function runTest() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  // Enqueue normal project, but we will temporarily modify the code in the worker.
  const project = new Project({
    userId: new mongoose.Types.ObjectId(), // Fake User ID
    title: "Phase 5.1 Diagnostics Test",
    prompt: "A 3D website that fails to build.",
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
