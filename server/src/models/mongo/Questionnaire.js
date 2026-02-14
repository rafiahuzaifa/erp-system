const mongoose = require('mongoose');

const questionnaireSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
  currentStep: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  responses: {
    industry: {
      selected: String,
      subCategory: String,
      companySize: String
    },
    modules: {
      selected: [String],
      priorities: { type: mongoose.Schema.Types.Mixed, default: {} }
    },
    entities: { type: mongoose.Schema.Types.Mixed, default: {} },
    workflows: [{
      moduleName: String,
      workflowName: String,
      description: String,
      automationLevel: { type: String, enum: ['manual', 'semi-auto', 'full-auto'], default: 'manual' }
    }],
    settings: {
      database: { type: String, default: 'mongodb' },
      authentication: { type: Boolean, default: true },
      authMethod: { type: String, default: 'jwt' },
      frontend: { type: Boolean, default: true },
      docker: { type: Boolean, default: true }
    }
  },
  aiSuggestions: [{
    step: Number,
    suggestions: [String],
    reasoning: String,
    accepted: { type: Boolean, default: false }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Questionnaire', questionnaireSchema);
