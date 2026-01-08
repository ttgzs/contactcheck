
import { GoogleGenAI, Type } from "@google/genai";
import { ContractAnalysis, RiskLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

const analysisSchema = {
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

export const analyzeContract = async (text: string, modelType: 'pro' | 'flash' = 'pro'): Promise<ContractAnalysis> => {
  const modelName = modelType === 'pro' ? "gemini-3-pro-preview" : "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `请作为一名资深法律专家，对以下合同进行审查。
    ${modelType === 'pro' ? '请发挥深度逻辑推理能力，穿透条款表象，识别隐蔽的权利义务不对等风险。' : '请快速扫描合同文本，识别明显的违约风险和缺失的基础条款。'}
    
    合同文本：
    ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: analysisSchema,
      temperature: 0.1,
    },
  });

  return JSON.parse(response.text) as ContractAnalysis;
};

export const chatWithLegalAgent = async (history: {role: string, content: string}[], message: string, context: string, modelType: 'pro' | 'flash' = 'pro') => {
  const modelName = modelType === 'pro' ? "gemini-3-pro-preview" : "gemini-3-flash-preview";
  const chat = ai.chats.create({
    model: modelName,
    config: {
      systemInstruction: `你是一名具备顶尖法律素养的AI法务专家。请基于以下合同背景回答用户问题：\n\n${context}`,
    },
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};
