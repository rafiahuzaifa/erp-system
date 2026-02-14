const Project = require('../models/mongo/Project');
const Questionnaire = require('../models/mongo/Questionnaire');
const GeneratedCode = require('../models/mongo/GeneratedCode');
const archiver = require('archiver');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (req.user) filter.createdBy = req.user.id;
    if (status) filter.status = status;

    const projects = await Project.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-modules.entities.fields');

    const total = await Project.countDocuments(filter);

    res.json({
      projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, description, industry } = req.body;

    const project = await Project.create({
      name,
      description,
      industry,
      createdBy: req.user.id
    });

    // Create associated questionnaire
    await Questionnaire.create({
      projectId: project._id,
      responses: {
        industry: { selected: industry }
      }
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Cleanup associated data
    await Questionnaire.deleteMany({ projectId: project._id });
    await GeneratedCode.deleteMany({ projectId: project._id });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.exportZip = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const generatedCode = await GeneratedCode.findOne({
      projectId: project._id,
      status: 'complete'
    }).sort({ version: -1 });

    if (!generatedCode) {
      return res.status(404).json({ error: 'No generated code found. Generate code first.' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${project.name.replace(/\s+/g, '-')}.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (const file of generatedCode.files) {
      archive.append(file.content, { name: file.path });
    }

    await archive.finalize();
  } catch (error) {
    next(error);
  }
};
