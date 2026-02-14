const GeneratedCode = require('../models/mongo/GeneratedCode');
const TemplateEngine = require('./templateEngine');
const AIService = require('./aiService');
const ProjectScaffolder = require('./projectScaffolder');
const { moduleDefinitions } = require('shared/moduleDefinitions');
const logger = require('../utils/logger');

class CodegenService {
  constructor() {
    this.templateEngine = new TemplateEngine();
    this.aiService = new AIService();
    this.scaffolder = new ProjectScaffolder();
  }

  async generateProject(project, questionnaire, emitEvent) {
    const startTime = Date.now();
    const allFiles = [];
    const generationLog = [];

    // Convert Mongoose documents to plain objects to avoid Handlebars prototype access errors
    const projectId = project._id;
    const projectData = JSON.parse(JSON.stringify(project.toObject ? project.toObject() : project));

    // Enrich entities with fields from module definitions if missing
    for (const mod of projectData.modules) {
      const def = moduleDefinitions[mod.moduleId];
      if (!def) continue;
      for (const entity of mod.entities) {
        if (!entity.fields || entity.fields.length === 0) {
          const defEntity = def.defaultEntities.find(e => e.name === entity.name);
          if (defEntity) {
            entity.fields = defEntity.fields.map(f => ({
              name: f.name,
              type: f.type,
              required: f.required || false,
              unique: f.unique || false,
              ref: f.ref || undefined,
              enumValues: f.enumValues ? [...f.enumValues] : undefined,
              defaultValue: f.defaultValue
            }));
          }
        }
      }
    }

    // Check for existing version
    const existingCode = await GeneratedCode.findOne({ projectId })
      .sort({ version: -1 });
    const version = existingCode ? existingCode.version + 1 : 1;

    const generatedCode = new GeneratedCode({
      projectId,
      version,
      status: 'generating'
    });
    await generatedCode.save();

    try {
      // ===== Phase 1: Scaffold =====
      const phase1Start = Date.now();
      emitEvent('phase', { phase: 'scaffold', message: 'Creating project structure...' });

      const scaffoldFiles = this.scaffolder.createScaffoldFiles(projectData);
      allFiles.push(...scaffoldFiles);

      if (projectData.settings.frontend) {
        const frontendScaffold = this.scaffolder.createFrontendScaffold(projectData);
        allFiles.push(...frontendScaffold);
      }

      generationLog.push({
        timestamp: new Date(),
        phase: 'scaffold',
        status: 'complete',
        details: `Created ${scaffoldFiles.length} scaffold files`,
        duration: Date.now() - phase1Start
      });

      emitEvent('progress', { percent: 15, filesGenerated: allFiles.length });

      // ===== Phase 2: Database Models =====
      const phase2Start = Date.now();
      emitEvent('phase', { phase: 'models', message: 'Generating database models...' });

      for (const mod of projectData.modules) {
        for (const entity of mod.entities) {
          try {
            const modelContent = this.templateEngine.renderModel(entity, projectData.settings);
            allFiles.push({
              path: `src/models/${entity.name}.js`,
              content: modelContent,
              language: 'javascript',
              generatedBy: 'template',
              module: mod.moduleId
            });

            emitEvent('file', { path: `src/models/${entity.name}.js`, status: 'generated' });
          } catch (err) {
            logger.warn(`Failed to render model for ${entity.name}:`, err.message);
            // Fallback: generate a basic model
            allFiles.push({
              path: `src/models/${entity.name}.js`,
              content: this.generateFallbackModel(entity),
              language: 'javascript',
              generatedBy: 'template',
              module: mod.moduleId
            });
          }
        }
      }

      generationLog.push({
        timestamp: new Date(),
        phase: 'models',
        status: 'complete',
        details: `Generated models for ${projectData.modules.reduce((sum, m) => sum + m.entities.length, 0)} entities`,
        duration: Date.now() - phase2Start
      });

      // Generate database seed file
      const seedContent = this.generateSeedFile(projectData);
      allFiles.push({
        path: 'src/seed.js',
        content: seedContent,
        language: 'javascript',
        generatedBy: 'template',
        module: 'core'
      });
      emitEvent('file', { path: 'src/seed.js', status: 'generated' });

      emitEvent('progress', { percent: 35, filesGenerated: allFiles.length });

      // ===== Phase 3: API Routes + Controllers =====
      const phase3Start = Date.now();
      emitEvent('phase', { phase: 'api', message: 'Generating API endpoints...' });

      // Generate main server entry
      const serverContent = this.templateEngine.renderServer(projectData);
      allFiles.push({
        path: 'src/index.js',
        content: serverContent,
        language: 'javascript',
        generatedBy: 'template',
        module: 'core'
      });
      emitEvent('file', { path: 'src/index.js', status: 'generated' });

      // Generate routes and controllers for each module
      for (const mod of projectData.modules) {
        // Module-level route aggregator
        const moduleRoutes = this.generateModuleRouteAggregator(mod);
        allFiles.push({
          path: `src/routes/${this.toCamelCase(mod.name)}.js`,
          content: moduleRoutes,
          language: 'javascript',
          generatedBy: 'template',
          module: mod.moduleId
        });
        emitEvent('file', { path: `src/routes/${this.toCamelCase(mod.name)}.js`, status: 'generated' });

        for (const entity of mod.entities) {
          try {
            // Route
            const routeContent = this.templateEngine.renderRoute(entity, mod);
            allFiles.push({
              path: `src/routes/${this.toCamelCase(entity.name)}Routes.js`,
              content: routeContent,
              language: 'javascript',
              generatedBy: 'template',
              module: mod.moduleId
            });

            // Controller
            const controllerContent = this.templateEngine.renderController(entity, mod);
            allFiles.push({
              path: `src/controllers/${this.toCamelCase(entity.name)}Controller.js`,
              content: controllerContent,
              language: 'javascript',
              generatedBy: 'template',
              module: mod.moduleId
            });

            emitEvent('file', { path: `src/controllers/${this.toCamelCase(entity.name)}Controller.js`, status: 'generated' });
          } catch (err) {
            logger.warn(`Failed to render route/controller for ${entity.name}:`, err.message);
            allFiles.push(
              ...this.generateFallbackRouteController(entity, mod)
            );
          }
        }
      }

      generationLog.push({
        timestamp: new Date(),
        phase: 'api',
        status: 'complete',
        details: `Generated routes and controllers`,
        duration: Date.now() - phase3Start
      });

      emitEvent('progress', { percent: 55, filesGenerated: allFiles.length });

      // ===== Phase 4: Frontend =====
      if (projectData.settings.frontend) {
        const phase4Start = Date.now();
        emitEvent('phase', { phase: 'frontend', message: 'Generating React components...' });

        try {
          // App.jsx
          const appContent = this.templateEngine.renderReactApp(projectData);
          allFiles.push({
            path: 'client/src/App.jsx',
            content: appContent,
            language: 'javascript',
            generatedBy: 'template',
            module: 'frontend'
          });
          emitEvent('file', { path: 'client/src/App.jsx', status: 'generated' });
        } catch (err) {
          logger.warn('Failed to render React App:', err.message);
          allFiles.push({
            path: 'client/src/App.jsx',
            content: this.generateFallbackApp(projectData),
            language: 'javascript',
            generatedBy: 'template',
            module: 'frontend'
          });
        }

        // Generate pages for each module
        for (const mod of projectData.modules) {
          try {
            const pageContent = this.templateEngine.renderReactPage(null, mod);
            allFiles.push({
              path: `client/src/pages/${this.toPascalCase(mod.name)}Page.jsx`,
              content: pageContent,
              language: 'javascript',
              generatedBy: 'template',
              module: mod.moduleId
            });
            emitEvent('file', { path: `client/src/pages/${this.toPascalCase(mod.name)}Page.jsx`, status: 'generated' });
          } catch (err) {
            logger.warn(`Failed to render page for ${mod.name}:`, err.message);
            allFiles.push({
              path: `client/src/pages/${this.toPascalCase(mod.name)}Page.jsx`,
              content: this.generateFallbackPage(mod),
              language: 'javascript',
              generatedBy: 'template',
              module: mod.moduleId
            });
          }
        }

        generationLog.push({
          timestamp: new Date(),
          phase: 'frontend',
          status: 'complete',
          details: `Generated React frontend with ${projectData.modules.length} module pages`,
          duration: Date.now() - phase4Start
        });

        emitEvent('progress', { percent: 80, filesGenerated: allFiles.length });
      }

      // ===== Phase 5: Docker =====
      if (projectData.settings.docker) {
        const phase5Start = Date.now();
        emitEvent('phase', { phase: 'docker', message: 'Creating deployment configuration...' });

        try {
          const dockerfileContent = this.templateEngine.renderDockerfile({
            ...projectData,
            settings: { ...projectData.settings, port: 3000 }
          });
          allFiles.push({
            path: 'Dockerfile',
            content: dockerfileContent,
            language: 'dockerfile',
            generatedBy: 'template',
            module: 'docker'
          });
        } catch (err) {
          allFiles.push({
            path: 'Dockerfile',
            content: this.generateFallbackDockerfile(),
            language: 'dockerfile',
            generatedBy: 'template',
            module: 'docker'
          });
        }

        try {
          const composeContent = this.templateEngine.renderDockerCompose(projectData);
          allFiles.push({
            path: 'docker-compose.yml',
            content: composeContent,
            language: 'yaml',
            generatedBy: 'template',
            module: 'docker'
          });
        } catch (err) {
          allFiles.push({
            path: 'docker-compose.yml',
            content: this.generateFallbackDockerCompose(project),
            language: 'yaml',
            generatedBy: 'template',
            module: 'docker'
          });
        }

        // .dockerignore
        allFiles.push({
          path: '.dockerignore',
          content: 'node_modules\n.git\n.env\n*.log\nclient/node_modules\n',
          language: 'text',
          generatedBy: 'template',
          module: 'docker'
        });

        emitEvent('file', { path: 'Dockerfile', status: 'generated' });
        emitEvent('file', { path: 'docker-compose.yml', status: 'generated' });

        generationLog.push({
          timestamp: new Date(),
          phase: 'docker',
          status: 'complete',
          details: 'Generated Docker configuration',
          duration: Date.now() - phase5Start
        });
      }

      emitEvent('progress', { percent: 95, filesGenerated: allFiles.length });

      // ===== Finalize =====
      generatedCode.files = allFiles;
      generatedCode.structure = {
        directories: [...new Set(allFiles.map(f => {
          const parts = f.path.split('/');
          return parts.slice(0, -1).join('/');
        }).filter(Boolean))],
        entryPoint: 'src/index.js',
        packageJson: JSON.parse(allFiles.find(f => f.path === 'package.json')?.content || '{}')
      };
      generatedCode.generationLog = generationLog;
      generatedCode.status = 'complete';
      await generatedCode.save();

      const totalDuration = Date.now() - startTime;
      logger.info(`Code generation complete: ${allFiles.length} files in ${totalDuration}ms`);

      emitEvent('progress', { percent: 100, filesGenerated: allFiles.length });

      return generatedCode;
    } catch (error) {
      generatedCode.status = 'error';
      generatedCode.generationLog = generationLog;
      await generatedCode.save();
      throw error;
    }
  }

  generateModuleRouteAggregator(mod) {
    const imports = mod.entities.map(e =>
      `const ${this.toCamelCase(e.name)}Routes = require('./${this.toCamelCase(e.name)}Routes');`
    ).join('\n');

    const uses = mod.entities.map(e =>
      `router.use('/${this.toKebabCase(this.pluralize(e.name))}', ${this.toCamelCase(e.name)}Routes);`
    ).join('\n');

    return `const express = require('express');\nconst router = express.Router();\n\n${imports}\n\n${uses}\n\nmodule.exports = router;\n`;
  }

  generateFallbackModel(entity) {
    const fields = entity.fields.map(f => {
      let type = f.type === 'ObjectId' ? 'mongoose.Schema.Types.ObjectId' : f.type;
      let def = `  ${f.name}: { type: ${type}`;
      if (f.required) def += ', required: true';
      if (f.unique) def += ', unique: true';
      if (f.ref) def += `, ref: '${f.ref}'`;
      if (f.type === 'Enum' && f.enumValues) def += `, enum: ${JSON.stringify(f.enumValues)}`;
      def += ' }';
      return def;
    }).join(',\n');

    return `const mongoose = require('mongoose');\n\nconst ${this.toCamelCase(entity.name)}Schema = new mongoose.Schema({\n${fields}\n}, { timestamps: true });\n\nmodule.exports = mongoose.model('${entity.name}', ${this.toCamelCase(entity.name)}Schema);\n`;
  }

  generateFallbackRouteController(entity, mod) {
    const name = this.toCamelCase(entity.name);
    const Name = this.toPascalCase(entity.name);

    const route = `const express = require('express');\nconst router = express.Router();\nconst controller = require('../controllers/${name}Controller');\n\nrouter.get('/', controller.getAll);\nrouter.get('/:id', controller.getById);\nrouter.post('/', controller.create);\nrouter.put('/:id', controller.update);\nrouter.delete('/:id', controller.remove);\n\nmodule.exports = router;\n`;

    const controller = `const ${Name} = require('../models/${Name}');\n\nexports.getAll = async (req, res) => {\n  try {\n    const items = await ${Name}.find().sort('-createdAt');\n    res.json({ data: items });\n  } catch (err) {\n    res.status(500).json({ error: err.message });\n  }\n};\n\nexports.getById = async (req, res) => {\n  try {\n    const item = await ${Name}.findById(req.params.id);\n    if (!item) return res.status(404).json({ error: 'Not found' });\n    res.json(item);\n  } catch (err) {\n    res.status(500).json({ error: err.message });\n  }\n};\n\nexports.create = async (req, res) => {\n  try {\n    const item = await ${Name}.create(req.body);\n    res.status(201).json(item);\n  } catch (err) {\n    res.status(400).json({ error: err.message });\n  }\n};\n\nexports.update = async (req, res) => {\n  try {\n    const item = await ${Name}.findByIdAndUpdate(req.params.id, req.body, { new: true });\n    if (!item) return res.status(404).json({ error: 'Not found' });\n    res.json(item);\n  } catch (err) {\n    res.status(400).json({ error: err.message });\n  }\n};\n\nexports.remove = async (req, res) => {\n  try {\n    await ${Name}.findByIdAndDelete(req.params.id);\n    res.json({ message: 'Deleted' });\n  } catch (err) {\n    res.status(500).json({ error: err.message });\n  }\n};\n`;

    return [
      { path: `src/routes/${name}Routes.js`, content: route, language: 'javascript', generatedBy: 'template', module: mod.moduleId },
      { path: `src/controllers/${name}Controller.js`, content: controller, language: 'javascript', generatedBy: 'template', module: mod.moduleId }
    ];
  }

  generateSeedFile(project) {
    const imports = [];
    const seedBlocks = [];

    for (const mod of project.modules) {
      for (const entity of mod.entities) {
        const Name = this.toPascalCase(entity.name);
        imports.push(`const ${Name} = require('./models/${Name}');`);

        // Generate sample seed data based on fields
        const sampleData = {};
        for (const field of entity.fields) {
          if (field.type === 'ObjectId') continue;
          if (field.type === 'String') sampleData[this.toCamelCase(field.name)] = `Sample ${field.name}`;
          else if (field.type === 'Number') sampleData[this.toCamelCase(field.name)] = 0;
          else if (field.type === 'Boolean') sampleData[this.toCamelCase(field.name)] = true;
          else if (field.type === 'Date') sampleData[this.toCamelCase(field.name)] = 'new Date()';
          else if (field.type === 'Enum' && field.enumValues && field.enumValues.length) sampleData[this.toCamelCase(field.name)] = field.enumValues[0];
        }

        const dataStr = Object.entries(sampleData).map(([k, v]) => {
          if (v === 'new Date()') return `    ${k}: new Date()`;
          return `    ${k}: ${JSON.stringify(v)}`;
        }).join(',\n');

        seedBlocks.push(`  // Seed ${Name}\n  const ${this.toCamelCase(entity.name)}Count = await ${Name}.countDocuments();\n  if (${this.toCamelCase(entity.name)}Count === 0) {\n    await ${Name}.create([\n      {\n${dataStr}\n      }\n    ]);\n    console.log('Seeded ${Name}');\n  } else {\n    console.log('${Name} already has data, skipping seed');\n  }`);
      }
    }

    return `const mongoose = require('mongoose');\nrequire('dotenv').config();\n\n${imports.join('\n')}\n\nconst MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/${this.toKebabCase(project.name)}';\n\nasync function seed() {\n  try {\n    await mongoose.connect(MONGODB_URI);\n    console.log('Connected to MongoDB for seeding...');\n\n${seedBlocks.join('\n\n')}\n\n    console.log('Seeding complete!');\n    process.exit(0);\n  } catch (err) {\n    console.error('Seeding failed:', err);\n    process.exit(1);\n  }\n}\n\nseed();\n`;
  }

  generateFallbackApp(project) {
    return `import React from 'react';\nimport { BrowserRouter, Routes, Route, Link } from 'react-router-dom';\n\nfunction App() {\n  return (\n    <BrowserRouter>\n      <div className="min-h-screen bg-gray-50">\n        <nav className="bg-white shadow p-4">\n          <h1 className="text-xl font-bold">${project.name}</h1>\n        </nav>\n        <main className="max-w-7xl mx-auto py-6 px-4">\n          <h2 className="text-2xl">Welcome to ${project.name}</h2>\n        </main>\n      </div>\n    </BrowserRouter>\n  );\n}\n\nexport default App;\n`;
  }

  generateFallbackPage(mod) {
    return `import React from 'react';\n\nexport default function ${this.toPascalCase(mod.name)}Page() {\n  return (\n    <div>\n      <h1 className="text-3xl font-bold">${mod.displayName || mod.name}</h1>\n      <p className="text-gray-600 mt-2">Module page for ${mod.displayName || mod.name}</p>\n    </div>\n  );\n}\n`;
  }

  generateFallbackDockerfile() {
    return 'FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install --production\nCOPY . .\nEXPOSE 3000\nCMD ["node", "src/index.js"]\n';
  }

  generateFallbackDockerCompose(project) {
    const name = this.toKebabCase(project.name);
    return `version: '3.8'\nservices:\n  app:\n    build: .\n    ports:\n      - "3000:3000"\n    environment:\n      - MONGODB_URI=mongodb://mongodb:27017/${name}\n    depends_on:\n      - mongodb\n  mongodb:\n    image: mongo:7\n    volumes:\n      - mongo_data:/data/db\nvolumes:\n  mongo_data:\n`;
  }

  toCamelCase(str) {
    if (!str) return '';
    return str.charAt(0).toLowerCase() + str.slice(1).replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
  }

  toPascalCase(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
  }

  toKebabCase(str) {
    if (!str) return '';
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase();
  }

  pluralize(str) {
    if (!str) return '';
    if (str.endsWith('s')) return str + 'es';
    if (str.endsWith('y')) return str.slice(0, -1) + 'ies';
    return str + 's';
  }
}

module.exports = CodegenService;
