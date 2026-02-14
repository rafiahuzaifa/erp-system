const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User } = require('../models/pg');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, plan: user.plan },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

exports.getUsage = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['passwordHash'] } });
    const Project = require('../models/mongo/Project');
    const projectCount = await Project.countDocuments({ createdBy: req.user.id });
    const { getPlanLimits } = require('../../../shared');
    const planConfig = getPlanLimits(user.plan);

    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, plan: user.plan },
      usage: {
        projects: { used: projectCount, limit: planConfig.projectLimit },
        modules: { limit: planConfig.moduleLimit },
        canDeploy: planConfig.canDeploy,
        canExport: planConfig.canExport
      },
      plan: planConfig
    });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash, name });

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, plan: user.plan }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await user.update({ lastLoginAt: new Date() });
    const token = generateToken(user);

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, plan: user.plan }
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['passwordHash'] }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { name } = req.body;
    if (name) user.name = name;
    await user.save();

    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (error) {
    next(error);
  }
};
