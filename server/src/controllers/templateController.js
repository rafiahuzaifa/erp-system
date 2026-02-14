const Template = require('../models/mongo/Template');
const Project = require('../models/mongo/Project');
const { User } = require('../models/pg');
const { getPlanLimits } = require('../../../shared');

exports.list = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const templates = await Template.find(filter)
      .sort({ isFeatured: -1, 'stats.downloads': -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-modules -relationships -settings');

    const total = await Template.countDocuments(filter);
    res.json({
      templates,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    next(error);
  }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const template = await Template.findOne({ slug: req.params.slug, isPublished: true });
    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json(template);
  } catch (error) {
    next(error);
  }
};

exports.useTemplate = async (req, res, next) => {
  try {
    const template = await Template.findOne({ slug: req.params.slug });
    if (!template) return res.status(404).json({ error: 'Template not found' });

    const user = await User.findByPk(req.user.id);
    const planHierarchy = { free: 0, pro: 1, enterprise: 2 };
    if (planHierarchy[user.plan] < planHierarchy[template.minimumPlan]) {
      return res.status(403).json({
        error: 'Upgrade required',
        message: `This template requires at least a ${template.minimumPlan} plan.`,
        upgradeRequired: true
      });
    }

    const project = await Project.create({
      name: req.body.name || `${template.name} Project`,
      description: template.description,
      industry: template.industry,
      modules: template.modules,
      relationships: template.relationships || [],
      settings: template.settings || {},
      status: 'designing',
      createdBy: req.user.id
    });

    template.stats.downloads += 1;
    await template.save();

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};
