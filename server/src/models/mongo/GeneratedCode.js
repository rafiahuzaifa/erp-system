const mongoose = require('mongoose');

const generatedFileSchema = new mongoose.Schema({
  path: { type: String, required: true },
  content: { type: String, required: true },
  language: { type: String, default: 'javascript' },
  generatedBy: { type: String, enum: ['template', 'ai', 'hybrid'], default: 'template' },
  module: String
}, { _id: false });

const generationLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  phase: String,
  status: String,
  details: String,
  duration: Number
}, { _id: false });

const generatedCodeSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  version: { type: Number, default: 1 },
  files: [generatedFileSchema],
  structure: {
    directories: [String],
    entryPoint: { type: String, default: 'src/index.js' },
    packageJson: mongoose.Schema.Types.Mixed,
    dockerCompose: String
  },
  generationLog: [generationLogSchema],
  totalTokensUsed: { type: Number, default: 0 },
  status: { type: String, enum: ['generating', 'complete', 'error'], default: 'generating' }
}, { timestamps: true });

generatedCodeSchema.index({ projectId: 1, version: -1 });

module.exports = mongoose.model('GeneratedCode', generatedCodeSchema);
