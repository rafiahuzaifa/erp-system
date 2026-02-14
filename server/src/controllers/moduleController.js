const Project = require('../models/mongo/Project');
const { moduleDefinitions, MODULE_CATEGORIES } = require('shared/moduleDefinitions');
const { getOpenAIClient } = require('../config/openai');

exports.getCatalog = async (req, res) => {
  const catalog = Object.values(moduleDefinitions).map(m => ({
    id: m.id,
    name: m.name,
    icon: m.icon,
    category: m.category,
    description: m.description,
    entityCount: m.defaultEntities.length,
    entities: m.defaultEntities.map(e => e.name)
  }));
  res.json({ modules: catalog, categories: MODULE_CATEGORIES });
};

exports.getProjectModules = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .select('modules relationships');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ modules: project.modules, relationships: project.relationships });
  } catch (error) {
    next(error);
  }
};

exports.updateModules = async (req, res, next) => {
  try {
    const { modules, relationships } = req.body;
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (modules) project.modules = modules;
    if (relationships) project.relationships = relationships;
    await project.save();

    res.json({ modules: project.modules, relationships: project.relationships });
  } catch (error) {
    next(error);
  }
};

exports.addEntity = async (req, res, next) => {
  try {
    const { moduleId, entity } = req.body;
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const mod = project.modules.find(m => m.moduleId === moduleId);
    if (!mod) return res.status(404).json({ error: 'Module not found' });

    mod.entities.push(entity);
    await project.save();

    res.status(201).json(mod);
  } catch (error) {
    next(error);
  }
};

exports.updateEntity = async (req, res, next) => {
  try {
    const { entityId } = req.params;
    const { fields, name } = req.body;
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    let found = false;
    for (const mod of project.modules) {
      const entity = mod.entities.id(entityId);
      if (entity) {
        if (name) entity.name = name;
        if (fields) entity.fields = fields;
        found = true;
        break;
      }
    }

    if (!found) return res.status(404).json({ error: 'Entity not found' });
    await project.save();

    res.json(project.modules);
  } catch (error) {
    next(error);
  }
};

exports.removeEntity = async (req, res, next) => {
  try {
    const { entityId } = req.params;
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    for (const mod of project.modules) {
      const entity = mod.entities.id(entityId);
      if (entity) {
        entity.deleteOne();
        break;
      }
    }

    await project.save();
    res.json(project.modules);
  } catch (error) {
    next(error);
  }
};

exports.addRelationship = async (req, res, next) => {
  try {
    const { from, to, type, foreignKey } = req.body;
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    project.relationships.push({ from, to, type, foreignKey });
    await project.save();

    res.status(201).json(project.relationships);
  } catch (error) {
    next(error);
  }
};

exports.removeRelationship = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    project.relationships.pull({ _id: req.params.relId });
    await project.save();

    res.json(project.relationships);
  } catch (error) {
    next(error);
  }
};

exports.aiEnhance = async (req, res, next) => {
  try {
    const { moduleId, entityName } = req.body;
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const mod = project.modules.find(m => m.moduleId === moduleId);
    if (!mod) return res.status(404).json({ error: 'Module not found' });

    const openai = getOpenAIClient();
    if (!openai) {
      return res.json({
        suggestions: getPresetFieldSuggestions(entityName),
        reasoning: 'AI not configured, using preset suggestions'
      });
    }

    const entity = entityName
      ? mod.entities.find(e => e.name === entityName)
      : null;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a database design expert. Suggest additional fields, validations, or relationships for a data entity. Return JSON with "suggestedFields" (array of {name, type, required, description}) and "reasoning" (string).'
        },
        {
          role: 'user',
          content: `Module: ${mod.displayName}\nEntity: ${entity?.name || 'general'}\nExisting fields: ${JSON.stringify(entity?.fields?.map(f => f.name))}\nIndustry: ${project.industry}`
        }
      ],
      temperature: 0.5,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    const aiResult = JSON.parse(response.choices[0].message.content);
    res.json(aiResult);
  } catch (error) {
    next(error);
  }
};

function getPresetFieldSuggestions(entityName) {
  const common = [
    { name: 'notes', type: 'String', required: false, description: 'Additional notes or comments' },
    { name: 'tags', type: 'Array', required: false, description: 'Tags for categorization' },
    { name: 'isActive', type: 'Boolean', required: false, description: 'Active/inactive status flag' }
  ];
  return common;
}
