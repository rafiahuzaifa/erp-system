const Handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

class TemplateEngine {
  constructor() {
    this.templates = {};
    this.registerHelpers();
    this.loadTemplates();
  }

  registerHelpers() {
    Handlebars.registerHelper('camelCase', (str) => {
      if (!str) return '';
      return str.charAt(0).toLowerCase() + str.slice(1).replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
    });

    Handlebars.registerHelper('pascalCase', (str) => {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1).replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
    });

    Handlebars.registerHelper('kebabCase', (str) => {
      if (!str) return '';
      return str.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase();
    });

    Handlebars.registerHelper('lowerCase', (str) => str ? str.toLowerCase() : '');
    Handlebars.registerHelper('upperCase', (str) => str ? str.toUpperCase() : '');

    Handlebars.registerHelper('pluralize', (str) => {
      if (!str) return '';
      if (str.endsWith('s')) return str + 'es';
      if (str.endsWith('y')) return str.slice(0, -1) + 'ies';
      return str + 's';
    });

    Handlebars.registerHelper('ifEq', function(a, b, options) {
      return a === b ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('ifNotEq', function(a, b, options) {
      return a !== b ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('ifIncludes', function(arr, val, options) {
      if (Array.isArray(arr) && arr.includes(val)) return options.fn(this);
      return options.inverse(this);
    });

    Handlebars.registerHelper('mongooseType', (type) => {
      const map = {
        'String': 'String',
        'Number': 'Number',
        'Boolean': 'Boolean',
        'Date': 'Date',
        'ObjectId': 'mongoose.Schema.Types.ObjectId',
        'Array': '[mongoose.Schema.Types.Mixed]',
        'Enum': 'String'
      };
      return map[type] || 'String';
    });

    Handlebars.registerHelper('sequelizeType', (type) => {
      const map = {
        'String': 'DataTypes.STRING',
        'Number': 'DataTypes.FLOAT',
        'Boolean': 'DataTypes.BOOLEAN',
        'Date': 'DataTypes.DATE',
        'ObjectId': 'DataTypes.UUID',
        'Array': 'DataTypes.JSONB',
        'Enum': 'DataTypes.STRING'
      };
      return map[type] || 'DataTypes.STRING';
    });

    Handlebars.registerHelper('json', (obj) => JSON.stringify(obj, null, 2));

    Handlebars.registerHelper('join', (arr, sep) => {
      if (Array.isArray(arr)) return arr.join(typeof sep === 'string' ? sep : ', ');
      return '';
    });

    Handlebars.registerHelper('times', function(n, options) {
      let result = '';
      for (let i = 0; i < n; i++) result += options.fn({ index: i });
      return result;
    });
  }

  loadTemplates() {
    const templateDir = path.resolve(__dirname, '../templates');
    this.loadDir(templateDir, '');
    logger.info(`Loaded ${Object.keys(this.templates).length} code generation templates`);
  }

  loadDir(dir, prefix) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        this.loadDir(fullPath, prefix + entry.name + '/');
      } else if (entry.name.endsWith('.hbs')) {
        const key = prefix + entry.name.replace('.hbs', '');
        const source = fs.readFileSync(fullPath, 'utf-8');
        this.templates[key] = Handlebars.compile(source, { noEscape: true });
      }
    }
  }

  render(templateName, context) {
    const template = this.templates[templateName];
    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }
    return template(context);
  }

  renderModel(entity, settings) {
    const templateName = settings.database === 'postgresql'
      ? 'database/sequelize-model'
      : 'database/mongoose-model';
    return this.render(templateName, { entity, settings });
  }

  renderRoute(entity, module) {
    return this.render('express-api/route', { entity, module });
  }

  renderController(entity, module) {
    return this.render('express-api/controller', { entity, module });
  }

  renderServer(project) {
    return this.render('express-api/server', { project, modules: project.modules });
  }

  renderDockerfile(project) {
    return this.render('docker/Dockerfile', { project });
  }

  renderDockerCompose(project) {
    return this.render('docker/docker-compose', { project });
  }

  renderReactApp(project) {
    return this.render('react-frontend/App', { project, modules: project.modules });
  }

  renderReactPage(entity, module) {
    return this.render('react-frontend/page', { entity, module });
  }

  renderReactComponent(entity, module) {
    return this.render('react-frontend/component', { entity, module });
  }
}

module.exports = TemplateEngine;
