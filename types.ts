
export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface AnalysisItem {
  title: string;
  description: string;
  suggestion: string;
  level: RiskLevel;
}

export interface ContractAnalysis {
  summary: string;
  risks: AnalysisItem[];
  missingClauses: string[];
  complianceScore: number;
  overallRecommendation: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
