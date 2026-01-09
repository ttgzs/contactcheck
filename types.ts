
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

export interface ClauseTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  content: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceStandard {
  id: string;
  name: string;
  description: string;
  jurisdiction: string;
  category: string;
  version: string;
  effectiveDate: string;
}

export interface ComplianceIssue {
  id: string;
  standardId: string;
  standardName: string;
  clauseText: string;
  issueDescription: string;
  severity: RiskLevel;
  recommendation: string;
  location: string;
}

export interface ComplianceAudit {
  id: string;
  contractText: string;
  standardIds: string[];
  results: {
    complianceScore: number;
    issues: ComplianceIssue[];
    summary: string;
    recommendations: string[];
  };
  createdAt: string;
  updatedAt: string;
}
