const { getOpenAIClient } = require('../config/openai');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.model = 'gpt-4o';
  }

  get client() {
    return getOpenAIClient();
  }

  get isAvailable() {
    return !!this.client;
  }

  async enrichModel(entity, industryContext) {
    if (!this.isAvailable) return null;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are a senior backend developer. Given a data entity definition for a ${industryContext} application, suggest additional Mongoose schema enhancements. Return ONLY valid JavaScript code with:
1. Additional validation logic
2. Useful indexes
3. Pre-save hooks if appropriate
4. Virtual fields if useful

Format: Return a JavaScript object with keys: validations (object), indexes (array), preSaveHook (string or null), virtuals (array of {name, get}). Return valid JSON only.`
          },
          {
            role: 'user',
            content: JSON.stringify({
              entityName: entity.name,
              fields: entity.fields
            })
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result;
    } catch (error) {
      logger.warn('AI model enrichment failed:', error.message);
      return null;
    }
  }

  async generateWorkflowLogic(workflow, entities, moduleName) {
    if (!this.isAvailable) return this.getDefaultWorkflowLogic(workflow);

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are a senior backend developer. Generate Express.js controller logic for a business workflow. Return ONLY valid JavaScript code for an async Express route handler function. Use Mongoose for database operations. Include error handling.`
          },
          {
            role: 'user',
            content: `Module: ${moduleName}\nWorkflow: ${workflow.name}\nDescription: ${workflow.description}\nAvailable entities: ${entities.map(e => e.name).join(', ')}\nAutomation level: ${workflow.automationLevel || 'semi-auto'}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      return this.parseCodeResponse(response.choices[0].message.content);
    } catch (error) {
      logger.warn('AI workflow generation failed:', error.message);
      return this.getDefaultWorkflowLogic(workflow);
    }
  }

  async suggestModulesForIndustry(industry, companySize) {
    if (!this.isAvailable) {
      return this.getDefaultModuleSuggestions(industry);
    }

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a business systems consultant. Suggest which modules a company should implement for their ERP/business system. Return JSON with "modules" (array of module IDs) and "reasoning" (string). Available modules: inventory, sales, purchasing, hr, accounting, shipping, fleet, routing, procurement, suppliers, demand, warehouse.'
          },
          {
            role: 'user',
            content: `Industry: ${industry}\nCompany size: ${companySize}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logger.warn('AI module suggestion failed:', error.message);
      return this.getDefaultModuleSuggestions(industry);
    }
  }

  async suggestEntityFields(entityName, moduleName, industry) {
    if (!this.isAvailable) return { suggestedFields: [], reasoning: 'AI not configured' };

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a database design expert. Suggest additional fields for a data entity. Return JSON with "suggestedFields" (array of {name: string, type: "String"|"Number"|"Boolean"|"Date"|"Enum", required: boolean, description: string, enumValues?: string[]}) and "reasoning" (string).'
          },
          {
            role: 'user',
            content: `Entity: ${entityName}\nModule: ${moduleName}\nIndustry: ${industry}`
          }
        ],
        temperature: 0.5,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logger.warn('AI field suggestion failed:', error.message);
      return { suggestedFields: [], reasoning: 'AI suggestion unavailable' };
    }
  }

  parseCodeResponse(content) {
    return content.replace(/```(?:javascript|js)?\n?/g, '').replace(/```/g, '').trim();
  }

  getDefaultWorkflowLogic(workflow) {
    return `
// ${workflow.name} - ${workflow.description || 'Auto-generated workflow'}
exports.${this.toCamelCase(workflow.name)} = async (req, res) => {
  try {
    // TODO: Implement ${workflow.name} logic
    const result = { message: '${workflow.name} executed', status: 'success' };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};`.trim();
  }

  getDefaultModuleSuggestions(industry) {
    const map = {
      erp: { modules: ['inventory', 'sales', 'purchasing', 'accounting', 'hr'], reasoning: 'Core ERP modules for general business operations' },
      logistics: { modules: ['shipping', 'fleet', 'routing', 'inventory'], reasoning: 'Essential logistics and distribution modules' },
      supply_chain: { modules: ['procurement', 'suppliers', 'demand', 'warehouse', 'inventory'], reasoning: 'Key supply chain management modules' },
      custom: { modules: ['inventory', 'sales'], reasoning: 'Starting modules for custom application' }
    };
    return map[industry] || map.custom;
  }

  toCamelCase(str) {
    return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
  }
}

module.exports = AIService;
