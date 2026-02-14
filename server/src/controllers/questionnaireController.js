const Questionnaire = require('../models/mongo/Questionnaire');
const Project = require('../models/mongo/Project');
const { getOpenAIClient } = require('../config/openai');
const { moduleDefinitions } = require('shared/moduleDefinitions');

exports.get = async (req, res, next) => {
  try {
    const questionnaire = await Questionnaire.findOne({ projectId: req.params.projectId });
    if (!questionnaire) return res.status(404).json({ error: 'Questionnaire not found' });
    res.json(questionnaire);
  } catch (error) {
    next(error);
  }
};

exports.saveStep = async (req, res, next) => {
  try {
    const { projectId, stepNum } = req.params;
    const { responses } = req.body;
    const step = parseInt(stepNum);

    // Map step number to response key
    const stepKeys = ['industry', 'modules', 'entities', 'workflows', 'settings'];
    const key = stepKeys[step];

    if (!key) return res.status(400).json({ error: 'Invalid step number' });

    // Use findOneAndUpdate to avoid Mongoose Map/Mixed type validation issues
    const questionnaire = await Questionnaire.findOneAndUpdate(
      { projectId },
      {
        $set: { [`responses.${key}`]: JSON.parse(JSON.stringify(responses)) },
        $max: { currentStep: step + 1 }
      },
      { new: true }
    );
    if (!questionnaire) return res.status(404).json({ error: 'Questionnaire not found' });

    res.json(questionnaire);
  } catch (error) {
    next(error);
  }
};

exports.aiSuggest = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { step, context } = req.body;

    const questionnaire = await Questionnaire.findOne({ projectId });
    if (!questionnaire) return res.status(404).json({ error: 'Questionnaire not found' });

    const openai = getOpenAIClient();
    if (!openai) {
      // Return preset suggestions if no API key
      return res.json(getPresetSuggestions(step, questionnaire.responses));
    }

    const prompt = buildSuggestionPrompt(step, questionnaire.responses, context);
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an ERP/business systems consultant. Provide brief, actionable suggestions for building a custom business application. Return JSON format with "suggestions" (array of strings) and "reasoning" (string).'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    const aiResult = JSON.parse(response.choices[0].message.content);

    // Store suggestion
    questionnaire.aiSuggestions.push({
      step,
      suggestions: aiResult.suggestions,
      reasoning: aiResult.reasoning
    });
    await questionnaire.save();

    res.json(aiResult);
  } catch (error) {
    next(error);
  }
};

exports.complete = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const questionnaire = await Questionnaire.findOne({ projectId });
    if (!questionnaire) return res.status(404).json({ error: 'Questionnaire not found' });

    const existingProject = await Project.findById(projectId);
    if (!existingProject) return res.status(404).json({ error: 'Project not found' });

    // Build modules from questionnaire responses
    const selectedModules = questionnaire.responses.modules?.selected || [];
    const modules = selectedModules.map(moduleId => {
      const def = moduleDefinitions[moduleId];
      if (!def) return null;

      return {
        moduleId: def.id,
        name: def.id,
        displayName: def.name,
        position: { x: 0, y: 0 },
        entities: def.defaultEntities.map(entity => ({
          name: entity.name,
          fields: entity.fields.map(f => {
            const field = { name: f.name, type: f.type };
            if (f.required) field.required = f.required;
            if (f.unique) field.unique = f.unique;
            if (f.ref) field.ref = f.ref;
            if (f.enumValues) field.enumValues = [...f.enumValues];
            if (f.defaultValue !== undefined) field.defaultValue = f.defaultValue;
            return field;
          })
        })),
        apis: generateDefaultApis(def),
        workflows: []
      };
    }).filter(Boolean);

    // Auto-position modules in a grid
    modules.forEach((mod, i) => {
      mod.position = {
        x: (i % 3) * 320 + 50,
        y: Math.floor(i / 3) * 280 + 50
      };
    });

    // Apply settings - use findByIdAndUpdate to avoid Mongoose nested subdocument validation bug
    const settings = questionnaire.responses.settings || {};
    const project = await Project.findByIdAndUpdate(
      projectId,
      {
        $set: {
          modules: JSON.parse(JSON.stringify(modules)),
          settings: {
            database: settings.database || 'mongodb',
            authentication: settings.authentication !== false,
            authMethod: settings.authMethod || 'jwt',
            frontend: settings.frontend !== false,
            docker: settings.docker !== false
          },
          status: 'designing'
        }
      },
      { new: true }
    );

    questionnaire.completed = true;
    await questionnaire.save();

    res.json({ project, questionnaire });
  } catch (error) {
    next(error);
  }
};

function generateDefaultApis(moduleDef) {
  const apis = [];
  for (const entity of moduleDef.defaultEntities) {
    const basePath = `/${entity.name.toLowerCase()}s`;
    apis.push(
      { method: 'GET', path: basePath, description: `List all ${entity.name}s` },
      { method: 'POST', path: basePath, description: `Create a ${entity.name}` },
      { method: 'GET', path: `${basePath}/:id`, description: `Get ${entity.name} by ID` },
      { method: 'PUT', path: `${basePath}/:id`, description: `Update a ${entity.name}` },
      { method: 'DELETE', path: `${basePath}/:id`, description: `Delete a ${entity.name}` }
    );
  }
  return apis;
}

function getPresetSuggestions(step, responses) {
  const industry = responses?.industry?.selected;
  const suggestions = {
    0: {
      suggestions: ['Consider starting with core modules and expanding later', 'Match your company size to the right feature set'],
      reasoning: 'Based on common patterns for new implementations'
    },
    1: {
      suggestions: getModuleSuggestions(industry),
      reasoning: `Recommended modules for ${industry || 'your'} industry`
    },
    2: {
      suggestions: ['Add custom fields specific to your business needs', 'Consider what reports you will need when designing fields'],
      reasoning: 'Entity customization best practices'
    },
    3: {
      suggestions: ['Start with manual workflows and automate gradually', 'Focus on high-volume repetitive tasks for automation'],
      reasoning: 'Workflow automation strategy'
    },
    4: {
      suggestions: ['MongoDB is great for flexible schemas', 'JWT authentication works well for API-first applications'],
      reasoning: 'Technical configuration recommendations'
    }
  };
  return suggestions[step] || { suggestions: [], reasoning: '' };
}

function getModuleSuggestions(industry) {
  const map = {
    erp: ['inventory', 'sales', 'purchasing', 'accounting'],
    logistics: ['shipping', 'fleet', 'routing'],
    supply_chain: ['procurement', 'suppliers', 'demand', 'warehouse']
  };
  return (map[industry] || ['inventory', 'sales']).map(m =>
    `Consider adding the ${moduleDefinitions[m]?.name || m} module`
  );
}

function buildSuggestionPrompt(step, responses, context) {
  return `
I'm building a ${responses.industry?.selected || 'business'} application.
Company size: ${responses.industry?.companySize || 'unknown'}
Sub-category: ${responses.industry?.subCategory || 'general'}
Currently selected modules: ${(responses.modules?.selected || []).join(', ')}

Current step: ${step}
Additional context: ${context || 'none'}

What do you suggest for this step of the configuration?
  `.trim();
}
