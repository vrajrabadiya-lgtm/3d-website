import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    progress: {
      type: Number,
      default: 0,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    blueprint: {
      type: mongoose.Schema.Types.Mixed,
    },
    plan: {
      type: mongoose.Schema.Types.Mixed,
    },
    scenePlan: {
      type: mongoose.Schema.Types.Mixed,
    },
    assets: {
      type: mongoose.Schema.Types.Mixed,
    },
    generatedCode: {
      type: mongoose.Schema.Types.Mixed,
    },
    failedStage: {
      type: String,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    buildStatus: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
    buildLogs: {
      type: String,
    },
    buildStartedAt: {
      type: Date,
    },
    buildCompletedAt: {
      type: Date,
    },
    buildDiagnostics: {
      type: mongoose.Schema.Types.Mixed,
    },
    artifact: {
      type: mongoose.Schema.Types.Mixed,
    },
    error: {
      message: String,
      errorType: String,
      code: String,
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);
export default Project;
