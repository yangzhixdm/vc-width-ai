// utils/geminiClient.js
const googleAi = require("@google/generative-ai");
const config = require('../config');

/**
 * 调用 Google Gemini API 的工具函数
 * @param {string} prompt - 需要发送给模型的提示
 * @param {object} options - 额外配置，如 model、maxOutputTokens
 * @returns {Promise<string>} - 模型返回的文本
 */

class GeminiClient {
  constructor() {
    this.genAI = new googleAi.GoogleGenerativeAI(config.google.apiKey);
  }

  async generateText(prompt, options = {}) {
    
    // 2. 选择模型 (默认用最新的 gemini-1.5-flash)
    const model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    // 3. 生成文本
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: options.maxOutputTokens || 512,
        temperature: options.temperature || 0.7,
      },
    });

    // 4. 提取输出
    return result.response.text();
  }
}

module.exports = new GeminiClient();