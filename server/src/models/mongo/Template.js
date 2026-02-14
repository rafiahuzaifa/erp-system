const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  longDescription: String,
  category: {
    type: String,
    enum: ['erp', 'logistics', 'supply_chain', 'hr', 'finance', 'inventory', 'crm', 'custom'],
    required: true
  },
  industry: {
    type: String,
    enum: ['erp', 'logistics', 'supply_chain', 'custom'],
    required: true
  },
  thumbnail: String,
  screenshots: [String],
  pricing: {
    isFree: { type: Boolean, default: false },
    INR: { type: Number, default: 0 },
    USD: { type: Number, default: 0 }
  },
  displayPricing: {
    INR: String,
    USD: String
  },
  minimumPlan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free'
  },
  modules: [{
    moduleId: String,
    name: String,
    displayName: String,
    position: { x: Number, y: Number },
    entities: [mongoose.Schema.Types.Mixed],
    apis: [mongoose.Schema.Types.Mixed],
    workflows: [mongoose.Schema.Types.Mixed]
  }],
  relationships: [mongoose.Schema.Types.Mixed],
  settings: mongoose.Schema.Types.Mixed,
  stats: {
    downloads: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
  },
  author: {
    name: String,
    userId: String
  },
  tags: [String],
  isPublished: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

templateSchema.index({ category: 1, isPublished: 1 });
templateSchema.index({ slug: 1 });
templateSchema.index({ tags: 1 });

module.exports = mongoose.model('Template', templateSchema);
