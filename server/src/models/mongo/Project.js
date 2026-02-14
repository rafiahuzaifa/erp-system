const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['String', 'Number', 'Boolean', 'Date', 'ObjectId', 'Array', 'Enum'], required: true },
  required: { type: Boolean, default: false },
  unique: { type: Boolean, default: false },
  ref: String,
  enumValues: [String],
  defaultValue: mongoose.Schema.Types.Mixed
}, { _id: false });

const entitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  fields: [fieldSchema]
}, { _id: true });

const apiSchema = new mongoose.Schema({
  method: { type: String, enum: ['GET', 'POST', 'PUT', 'DELETE'], required: true },
  path: { type: String, required: true },
  description: String,
  isCustom: { type: Boolean, default: false }
}, { _id: false });

const workflowStepSchema = new mongoose.Schema({
  action: String,
  config: mongoose.Schema.Types.Mixed
}, { _id: false });

const workflowSchema = new mongoose.Schema({
  name: { type: String, required: true },
  trigger: String,
  steps: [workflowStepSchema]
}, { _id: false });

const moduleSchema = new mongoose.Schema({
  moduleId: { type: String, required: true },
  name: { type: String, required: true },
  displayName: String,
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  entities: [entitySchema],
  apis: [apiSchema],
  workflows: [workflowSchema]
}, { _id: true });

const relationshipSchema = new mongoose.Schema({
  from: {
    moduleId: String,
    entityName: String
  },
  to: {
    moduleId: String,
    entityName: String
  },
  type: { type: String, enum: ['one-to-one', 'one-to-many', 'many-to-many'] },
  foreignKey: String
}, { _id: true });

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: String,
  industry: {
    type: String,
    enum: ['erp', 'logistics', 'supply_chain', 'custom'],
    required: true
  },
  status: {
    type: String,
    enum: ['questionnaire', 'designing', 'generating', 'generated', 'deploying', 'deployed', 'failed'],
    default: 'questionnaire'
  },
  modules: [moduleSchema],
  relationships: [relationshipSchema],
  settings: {
    database: { type: String, enum: ['mongodb', 'postgresql', 'both'], default: 'mongodb' },
    authentication: { type: Boolean, default: true },
    authMethod: { type: String, enum: ['jwt', 'session'], default: 'jwt' },
    frontend: { type: Boolean, default: true },
    docker: { type: Boolean, default: true }
  },
  generatedCodeRef: { type: mongoose.Schema.Types.ObjectId, ref: 'GeneratedCode' },
  createdBy: String
}, { timestamps: true });

projectSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
