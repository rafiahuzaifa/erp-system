const OpenAI = require('openai');
const env = require('./env');

let openaiClient = null;

const getOpenAIClient = () => {
  if (!openaiClient && env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return openaiClient;
};

module.exports = { getOpenAIClient };
