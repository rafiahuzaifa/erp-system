const { getGeminiClient } = require('../config/gemini');
const { getOpenAIClient } = require('../config/openai');
const logger = require('../utils/logger');

class AIService {
  get gemini() { return getGeminiClient(); }
  get openai() { return getOpenAIClient(); }

  get isAvailable() { return !!(this.gemini || this.openai); }
  get provider() {
    if (this.gemini) return 'gemini';
    if (this.openai) return 'openai';
    return null;
  }

  // Unified chat method — Gemini first, OpenAI fallback
  async chat(systemPrompt, userPrompt, { json = false } = {}) {
    if (this.gemini) {
      try {
        const prompt = json
          ? `${systemPrompt}\n\nIMPORTANT: Respond ONLY with valid JSON, no markdown, no code blocks.\n\n${userPrompt}`
          : `${systemPrompt}\n\n${userPrompt}`;
        const result = await this.gemini.generateContent(prompt);
        const text = result.response.text().trim();
        if (json) {
          // Strip any accidental markdown fences Gemini sometimes adds
          const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
          return JSON.parse(clean);
        }
        return text;
      } catch (err) {
        logger.warn(`Gemini error (${err.message}), trying OpenAI fallback`);
      }
    }

    if (this.openai) {
      try {
        const res = await this.openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
          temperature: 0.4,
          max_tokens: 2000,
          ...(json ? { response_format: { type: 'json_object' } } : {})
        });
        const text = res.choices[0].message.content.trim();
        return json ? JSON.parse(text) : text;
      } catch (err) {
        logger.warn(`OpenAI error: ${err.message}`);
      }
    }

    return null;
  }

  // ──────────────────────────────────────────────────
  // Code Generation Enhancers
  // ──────────────────────────────────────────────────

  async enhanceController(entityName, fields, moduleName) {
    if (!this.isAvailable) return null;
    try {
      const result = await this.chat(
        `You are a senior Node.js/Express developer. Given a Mongoose entity, return JSON with:
- "additionalValidation": extra validation rules as JS code snippet (string or null)
- "businessLogic": array of short comments describing business rules to add
- "suggestedIndexes": array of field names to index
- "hooks": pre-save hook code snippet (string or null)`,
        `Entity: ${entityName}\nModule: ${moduleName}\nFields: ${JSON.stringify(fields, null, 2)}`,
        { json: true }
      );
      return result;
    } catch (err) {
      logger.warn('AI controller enhancement failed:', err.message);
      return null;
    }
  }

  async generateCustomEndpoint(description, entityName, fields) {
    if (!this.isAvailable) return null;
    try {
      const code = await this.chat(
        `You are a senior Express.js developer. Write a single async Express route handler function for the described endpoint. Use Mongoose. Include proper error handling. Return ONLY the JavaScript function body, no imports, no module.exports.`,
        `Entity: ${entityName}\nFields: ${fields.map(f => f.name + ':' + f.type).join(', ')}\nEndpoint description: ${description}`
      );
      return code ? this.parseCodeResponse(code) : null;
    } catch (err) {
      logger.warn('AI custom endpoint generation failed:', err.message);
      return null;
    }
  }

  // ──────────────────────────────────────────────────
  // Questionnaire AI Suggestions
  // ──────────────────────────────────────────────────

  async enrichModel(entity, industryContext) {
    if (!this.isAvailable) return null;
    try {
      return await this.chat(
        `You are a senior backend developer. Given a data entity for a ${industryContext} app, suggest Mongoose schema enhancements. Return JSON with: validations (object), indexes (array of field names), preSaveHook (string or null), virtuals (array of {name, get}).`,
        JSON.stringify({ entityName: entity.name, fields: entity.fields }),
        { json: true }
      );
    } catch (err) {
      logger.warn('AI model enrichment failed:', err.message);
      return null;
    }
  }

  async generateWorkflowLogic(workflow, entities, moduleName) {
    if (!this.isAvailable) return this.getDefaultWorkflowLogic(workflow);
    try {
      const code = await this.chat(
        `You are a senior backend developer. Generate Express.js controller logic for a business workflow. Return ONLY valid JavaScript code for an async Express route handler. Use Mongoose. Include error handling.`,
        `Module: ${moduleName}\nWorkflow: ${workflow.name}\nDescription: ${workflow.description}\nEntities: ${entities.map(e => e.name).join(', ')}`
      );
      return code ? this.parseCodeResponse(code) : this.getDefaultWorkflowLogic(workflow);
    } catch (err) {
      logger.warn('AI workflow generation failed:', err.message);
      return this.getDefaultWorkflowLogic(workflow);
    }
  }

  async suggestModulesForIndustry(industry, companySize) {
    if (!this.isAvailable) return this.getDefaultModuleSuggestions(industry);
    try {
      return await this.chat(
        `You are a business systems consultant. Suggest ERP modules for a company. Return JSON with "modules" (array of IDs from: inventory, sales, purchasing, hr, accounting, shipping, fleet, routing, procurement, suppliers, demand, warehouse) and "reasoning" (string).`,
        `Industry: ${industry}\nCompany size: ${companySize}`,
        { json: true }
      ) || this.getDefaultModuleSuggestions(industry);
    } catch (err) {
      return this.getDefaultModuleSuggestions(industry);
    }
  }

  async suggestEntityFields(entityName, moduleName, industry) {
    if (!this.isAvailable) return { suggestedFields: [], reasoning: 'AI not configured' };
    try {
      return await this.chat(
        `You are a database design expert. Suggest fields for a data entity. Return JSON with "suggestedFields" (array of {name, type: "String"|"Number"|"Boolean"|"Date"|"Enum", required: boolean, description: string, enumValues?: string[]}) and "reasoning" (string).`,
        `Entity: ${entityName}\nModule: ${moduleName}\nIndustry: ${industry}`,
        { json: true }
      ) || { suggestedFields: [], reasoning: 'AI unavailable' };
    } catch (err) {
      return { suggestedFields: [], reasoning: 'AI suggestion unavailable' };
    }
  }

  // ──────────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────────

  parseCodeResponse(content) {
    return content.replace(/^```(?:javascript|js)?\n?/gm, '').replace(/^```\n?/gm, '').trim();
  }

  getDefaultWorkflowLogic(workflow) {
    return `// ${workflow.name} - ${workflow.description || 'Auto-generated workflow'}
exports.${this.toCamelCase(workflow.name)} = async (req, res) => {
  try {
    const result = { message: '${workflow.name} executed', status: 'success' };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};`;
  }

  getDefaultModuleSuggestions(industry) {
    const map = {
      erp: { modules: ['inventory', 'sales', 'purchasing', 'accounting', 'hr'], reasoning: 'Core ERP modules' },
      logistics: { modules: ['shipping', 'fleet', 'routing', 'inventory'], reasoning: 'Logistics modules' },
      supply_chain: { modules: ['procurement', 'suppliers', 'demand', 'warehouse', 'inventory'], reasoning: 'Supply chain modules' },
      custom: { modules: ['inventory', 'sales'], reasoning: 'Default starter modules' }
    };
    return map[industry] || map.custom;
  }

  toCamelCase(str) {
    return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
  }
}

module.exports = AIService;
