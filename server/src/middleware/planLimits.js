const { User } = require('../models/pg');
const { getPlanLimits } = require('../../../shared');
const Project = require('../models/mongo/Project');

const enforceProjectLimit = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    const planConfig = getPlanLimits(user.plan);

    if (planConfig.projectLimit === -1) return next();

    const projectCount = await Project.countDocuments({ createdBy: req.user.id });

    if (projectCount >= planConfig.projectLimit) {
      return res.status(403).json({
        error: 'Plan limit reached',
        message: `Your ${planConfig.name} plan allows ${planConfig.projectLimit} project(s). Upgrade to create more.`,
        currentCount: projectCount,
        limit: planConfig.projectLimit,
        upgradeRequired: true
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

const enforceModuleLimit = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    const planConfig = getPlanLimits(user.plan);

    if (planConfig.moduleLimit === -1) return next();

    const requestedModuleCount = req.body.modules?.length || 0;

    if (requestedModuleCount > planConfig.moduleLimit) {
      return res.status(403).json({
        error: 'Module limit reached',
        message: `Your ${planConfig.name} plan allows ${planConfig.moduleLimit} modules. Upgrade for more.`,
        limit: planConfig.moduleLimit,
        upgradeRequired: true
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

const requireDeployAccess = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    const planConfig = getPlanLimits(user.plan);

    if (!planConfig.canDeploy) {
      return res.status(403).json({
        error: 'Upgrade required',
        message: 'Deployment requires a Pro or Business plan.',
        upgradeRequired: true
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

const requirePlan = (...allowedPlans) => {
  return async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.id);
      const planHierarchy = { free: 0, pro: 1, enterprise: 2 };
      const minRequired = Math.min(...allowedPlans.map(p => planHierarchy[p] ?? 99));
      const userLevel = planHierarchy[user.plan] ?? 0;

      if (userLevel >= minRequired) return next();

      return res.status(403).json({
        error: 'Upgrade required',
        message: `This feature requires at least a ${allowedPlans[0]} plan.`,
        upgradeRequired: true
      });
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { enforceProjectLimit, enforceModuleLimit, requireDeployAccess, requirePlan };
