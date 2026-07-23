import { projectQueue } from "./queue/queues/projectQueue.js";

async function testQueue() {
    console.log("Adding test job...");

    await projectQueue.add("generate-project", {
        projectId: "test-project-123",
        prompt: "Generate Apple Vision Website"
    });

    console.log("Job added successfully");

    process.exit(0);
}

testQueue();