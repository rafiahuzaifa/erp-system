const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('./env');

let geminiClient = null;

const getGeminiClient = () => {
  if (!geminiClient && env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    geminiClient = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }
  return geminiClient;
};

module.exports = { getGeminiClient };
