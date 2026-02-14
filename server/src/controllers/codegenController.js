const Project = require('../models/mongo/Project');
const GeneratedCode = require('../models/mongo/GeneratedCode');
const Questionnaire = require('../models/mongo/Questionnaire');
const CodegenService = require('../services/codegenService');
const logger = require('../utils/logger');

const codegenService = new CodegenService();

exports.generate = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const questionnaire = await Questionnaire.findOne({ projectId: project._id });

    // Set up SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    const emitEvent = (event, data) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    // Update project status
    project.status = 'generating';
    await project.save();

    emitEvent('status', { status: 'generating', message: 'Starting code generation...' });

    try {
      const generatedCode = await codegenService.generateProject(project, questionnaire, emitEvent);

      project.status = 'generated';
      project.generatedCodeRef = generatedCode._id;
      await project.save();

      emitEvent('complete', {
        status: 'generated',
        totalFiles: generatedCode.files.length,
        codeId: generatedCode._id
      });
    } catch (genError) {
      logger.error('Code generation failed:', genError);
      project.status = 'failed';
      await project.save();

      emitEvent('error', { message: genError.message });
    }

    res.end();
  } catch (error) {
    next(error);
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .select('status generatedCodeRef');
    if (!project) return res.status(404).json({ error: 'Project not found' });

    let codeStatus = null;
    if (project.generatedCodeRef) {
      codeStatus = await GeneratedCode.findById(project.generatedCodeRef)
        .select('status version generationLog totalTokensUsed');
    }

    res.json({ projectStatus: project.status, codeGeneration: codeStatus });
  } catch (error) {
    next(error);
  }
};

exports.listFiles = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const generatedCode = await GeneratedCode.findOne({
      projectId: project._id,
      status: 'complete'
    }).sort({ version: -1 }).select('files.path files.language files.module files.generatedBy');

    if (!generatedCode) return res.status(404).json({ error: 'No generated code found' });

    // Build tree structure
    const tree = buildFileTree(generatedCode.files);
    res.json({ tree, files: generatedCode.files.map(f => ({
      path: f.path,
      language: f.language,
      module: f.module,
      generatedBy: f.generatedBy
    }))});
  } catch (error) {
    next(error);
  }
};

exports.getFile = async (req, res, next) => {
  try {
    const filePath = req.params[0];
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const generatedCode = await GeneratedCode.findOne({
      projectId: project._id,
      status: 'complete'
    }).sort({ version: -1 });

    if (!generatedCode) return res.status(404).json({ error: 'No generated code found' });

    const file = generatedCode.files.find(f => f.path === filePath);
    if (!file) return res.status(404).json({ error: 'File not found' });

    res.json(file);
  } catch (error) {
    next(error);
  }
};

exports.regenerate = async (req, res, next) => {
  try {
    const { moduleId } = req.body;
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Re-trigger generation (same as generate but increments version)
    const questionnaire = await Questionnaire.findOne({ projectId: project._id });

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const emitEvent = (event, data) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    project.status = 'generating';
    await project.save();

    try {
      const generatedCode = await codegenService.generateProject(project, questionnaire, emitEvent);
      project.status = 'generated';
      project.generatedCodeRef = generatedCode._id;
      await project.save();
      emitEvent('complete', { totalFiles: generatedCode.files.length });
    } catch (genError) {
      project.status = 'failed';
      await project.save();
      emitEvent('error', { message: genError.message });
    }

    res.end();
  } catch (error) {
    next(error);
  }
};

function buildFileTree(files) {
  const tree = { name: 'root', type: 'directory', children: [] };

  for (const file of files) {
    const parts = file.path.split('/');
    let current = tree;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;

      if (isFile) {
        current.children.push({
          name: part,
          type: 'file',
          path: file.path,
          language: file.language
        });
      } else {
        let dir = current.children.find(c => c.name === part && c.type === 'directory');
        if (!dir) {
          dir = { name: part, type: 'directory', children: [] };
          current.children.push(dir);
        }
        current = dir;
      }
    }
  }

  return tree;
}
