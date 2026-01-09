
import { GoogleGenAI, Type } from "@google/genai";
import { ContractAnalysis } from "../types";
import { getApiKey, getModelName } from "./config";

interface AnalysisService {
  analyzeContract(text: string, variant: string): Promise<ContractAnalysis>;
  chatWithLegalAgent(history: {role: string, content: string}[], message: string, context: string, variant: string): Promise<string>;
}

class GeminiService implements AnalysisService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = getApiKey('gemini') || '';
    this.ai = new GoogleGenAI({ apiKey });
  }

  private getAnalysisSchema() {
    return {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING, description: "合同主要内容的简明摘要" },
        complianceScore: { type: Type.NUMBER, description: "合规评分 (0-100)" },
        overallRecommendation: { type: Type.STRING, description: "整体审查结论与建议" },
        risks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "风险点名称" },
              description: { type: Type.STRING, description: "风险详细描述" },
              suggestion: { type: Type.STRING, description: "修改建议" },
              level: { 
                type: Type.STRING, 
                description: "风险等级 (LOW, MEDIUM, HIGH, CRITICAL)" 
              }
            },
            required: ["title", "description", "suggestion", "level"]
          }
        },
        missingClauses: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "缺失的关键法律条款清单"
        }
      },
      required: ["summary", "complianceScore", "risks", "missingClauses", "overallRecommendation"]
    };
  }

  async analyzeContract(text: string, variant: string = 'pro'): Promise<ContractAnalysis> {
    const modelName = getModelName('gemini', variant) || "gemini-3-pro-preview";
    
    const response = await this.ai.models.generateContent({
      model: modelName,
      contents: `请作为一名资深法律专家，对以下合同进行审查。
    ${variant === 'pro' ? '请发挥深度逻辑推理能力，穿透条款表象，识别隐蔽的权利义务不对等风险。' : '请快速扫描合同文本，识别明显的违约风险和缺失的基础条款。'}
    
    合同文本：
    ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: this.getAnalysisSchema(),
        temperature: 0.1,
      },
    });

    return JSON.parse(response.text) as ContractAnalysis;
  }

  async chatWithLegalAgent(history: {role: string, content: string}[], message: string, context: string, variant: string = 'pro'): Promise<string> {
    const modelName = getModelName('gemini', variant) || "gemini-3-pro-preview";
    const chat = this.ai.chats.create({
      model: modelName,
      config: {
        systemInstruction: `你是一名具备顶尖法律素养的AI法务专家。请基于以下合同背景回答用户问题：\n\n${context}`,
      },
    });

    const response = await chat.sendMessage({ message });
    return response.text;
  }
}

class OpenAIService implements AnalysisService {
  private apiKey: string;

  constructor() {
    this.apiKey = getApiKey('openai') || '';
  }

  async analyzeContract(text: string, variant: string = 'chat'): Promise<ContractAnalysis> {
    const modelName = getModelName('openai', variant) || "gpt-3.5-turbo";
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: '请作为一名资深法律专家，对以下合同进行审查，并按照JSON格式输出结果。'
          },
          {
            role: 'user',
            content: `合同文本：${text}\n\n请按照以下JSON格式输出分析结果：\n{\n  "summary": "合同主要内容的简明摘要",\n  "complianceScore": 合规评分 (0-100),\n  "overallRecommendation": "整体审查结论与建议",\n  "risks": [{\n    "title": "风险点名称",\n    "description": "风险详细描述",\n    "suggestion": "修改建议",\n    "level": "风险等级 (LOW, MEDIUM, HIGH, CRITICAL)"\n  }],\n  "missingClauses": ["缺失的关键法律条款清单"]\n}`
          }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    // 提取JSON代码块
    const jsonMatch = content.match(/```json([\s\S]*?)```/);
    const jsonString = jsonMatch ? jsonMatch[1] : content;
    return JSON.parse(jsonString) as ContractAnalysis;
  }

  async chatWithLegalAgent(history: {role: string, content: string}[], message: string, context: string, variant: string = 'chat'): Promise<string> {
    const modelName = getModelName('openai', variant) || "gpt-3.5-turbo";
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: `你是一名具备顶尖法律素养的AI法务专家。请基于以下合同背景回答用户问题：\n\n${context}`
          },
          ...history,
          { role: 'user', content: message }
        ],
        temperature: 0.1,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

class AnthropicService implements AnalysisService {
  private apiKey: string;

  constructor() {
    this.apiKey = getApiKey('anthropic') || '';
  }

  async analyzeContract(text: string, variant: string = 'claude'): Promise<ContractAnalysis> {
    const modelName = getModelName('anthropic', variant) || "claude-3-opus-20240229";
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'user',
            content: `请作为一名资深法律专家，对以下合同进行审查，并按照JSON格式输出结果。\n\n合同文本：${text}\n\n请按照以下JSON格式输出分析结果：\n{\n  "summary": "合同主要内容的简明摘要",\n  "complianceScore": 合规评分 (0-100),\n  "overallRecommendation": "整体审查结论与建议",\n  "risks": [{\n    "title": "风险点名称",\n    "description": "风险详细描述",\n    "suggestion": "修改建议",\n    "level": "风险等级 (LOW, MEDIUM, HIGH, CRITICAL)"\n  }],\n  "missingClauses": ["缺失的关键法律条款清单"]\n}`
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    return JSON.parse(data.content[0].text) as ContractAnalysis;
  }

  async chatWithLegalAgent(history: {role: string, content: string}[], message: string, context: string, variant: string = 'claude'): Promise<string> {
    const modelName = getModelName('anthropic', variant) || "claude-3-opus-20240229";
    
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: modelName,
        system: `你是一名具备顶尖法律素养的AI法务专家。请基于以下合同背景回答用户问题：\n\n${context}`,
        messages: [...formattedHistory, { role: 'user', content: message }],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    return data.content[0].text;
  }
}

class QianwenService implements AnalysisService {
  private apiKey: string;

  constructor() {
    this.apiKey = getApiKey('qianwen') || '';
  }

  async analyzeContract(text: string, variant: string = 'max'): Promise<ContractAnalysis> {
    const modelName = getModelName('qianwen', variant) || "qwen-max";
    
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'user',
            content: `请作为一名资深法律专家，对以下合同进行审查，并按照JSON格式输出结果。\n\n合同文本：${text}\n\n请按照以下JSON格式输出分析结果：\n{\n  "summary": "合同主要内容的简明摘要",\n  "complianceScore": 合规评分 (0-100),\n  "overallRecommendation": "整体审查结论与建议",\n  "risks": [{
    "title": "风险点名称",
    "description": "风险详细描述",
    "suggestion": "修改建议",
    "level": "风险等级 (LOW, MEDIUM, HIGH, CRITICAL)"
  }],\n  "missingClauses": ["缺失的关键法律条款清单"]\n}`
          }
        ],
        temperature: 0.1,
        top_p: 0.9,
        max_tokens: 2000
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    // 提取JSON代码块
    const jsonMatch = content.match(/```json([\s\S]*?)```/);
    const jsonString = jsonMatch ? jsonMatch[1] : content;
    return JSON.parse(jsonString) as ContractAnalysis;
  }

  async chatWithLegalAgent(history: {role: string, content: string}[], message: string, context: string, variant: string = 'max'): Promise<string> {
    const modelName = getModelName('qianwen', variant) || "qwen-max";
    
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: `你是一名具备顶尖法律素养的AI法务专家。请基于以下合同背景回答用户问题：\n\n${context}`
          },
          ...history,
          { role: 'user', content: message }
        ],
        temperature: 0.1,
        top_p: 0.9,
        max_tokens: 1000
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

class HuoshanService implements AnalysisService {
  private apiKey: string;

  constructor() {
    this.apiKey = getApiKey('huoshan') || '';
  }

  async analyzeContract(text: string, variant: string = 'doubao'): Promise<ContractAnalysis> {
    const modelName = getModelName('huoshan', variant) || "doubao-pro-32k";
    
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'user',
            content: `请作为一名资深法律专家，对以下合同进行审查，并按照JSON格式输出结果。\n\n合同文本：${text}\n\n请按照以下JSON格式输出分析结果：\n{\n  "summary": "合同主要内容的简明摘要",\n  "complianceScore": 合规评分 (0-100),\n  "overallRecommendation": "整体审查结论与建议",\n  "risks": [{\n    "title": "风险点名称",\n    "description": "风险详细描述",\n    "suggestion": "修改建议",\n    "level": "风险等级 (LOW, MEDIUM, HIGH, CRITICAL)"\n  }],\n  "missingClauses": ["缺失的关键法律条款清单"]\n}`
          }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content) as ContractAnalysis;
  }

  async chatWithLegalAgent(history: {role: string, content: string}[], message: string, context: string, variant: string = 'doubao'): Promise<string> {
    const modelName = getModelName('huoshan', variant) || "doubao-pro-32k";
    
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: `你是一名具备顶尖法律素养的AI法务专家。请基于以下合同背景回答用户问题：\n\n${context}`
          },
          ...history,
          { role: 'user', content: message }
        ],
        temperature: 0.1,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

export const getAnalysisService = (modelKey: string): AnalysisService => {
  switch (modelKey) {
    case 'gemini':
      return new GeminiService();
    case 'openai':
      return new OpenAIService();
    case 'anthropic':
      return new AnthropicService();
    case 'qianwen':
      return new QianwenService();
    case 'huoshan':
      return new HuoshanService();
    default:
      throw new Error(`不支持的模型服务: ${modelKey}`);
  }
};

export const analyzeContract = async (modelKey: string, text: string, variant: string = 'pro'): Promise<ContractAnalysis> => {
  const service = getAnalysisService(modelKey);
  return service.analyzeContract(text, variant);
};

export const chatWithLegalAgent = async (modelKey: string, history: {role: string, content: string}[], message: string, context: string, variant: string = 'pro'): Promise<string> => {
  const service = getAnalysisService(modelKey);
  return service.chatWithLegalAgent(history, message, context, variant);
};
