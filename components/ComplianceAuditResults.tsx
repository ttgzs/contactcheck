import React from 'react';
import { ComplianceAudit, RiskLevel } from '../types';

export interface ComplianceAuditResultsProps {
  audit: ComplianceAudit;
}

const getRiskLevelColor = (level: RiskLevel) => {
  switch (level) {
    case RiskLevel.CRITICAL: return 'bg-red-500 text-white';
    case RiskLevel.HIGH: return 'bg-orange-500 text-white';
    case RiskLevel.MEDIUM: return 'bg-yellow-500 text-white';
    case RiskLevel.LOW: return 'bg-green-500 text-white';
    default: return 'bg-slate-500 text-white';
  }
};

const getRiskLevelText = (level: RiskLevel) => {
  switch (level) {
    case RiskLevel.CRITICAL: return '严重';
    case RiskLevel.HIGH: return '高';
    case RiskLevel.MEDIUM: return '中';
    case RiskLevel.LOW: return '低';
    default: return '未知';
  }
};

export const ComplianceAuditResults: React.FC<ComplianceAuditResultsProps> = ({ audit }) => {
  const { results } = audit;
  const { complianceScore, issues, summary, recommendations } = results;

  return (
    <div className="space-y-6">
      {/* Compliance Score */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">合规审计结果</h2>
            <p className="text-sm text-slate-600">基于所选标准的合同合规性评估</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600">{Math.round(complianceScore)}</div>
              <div className="text-sm text-slate-600 mt-1">合规分数</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-slate-800">{issues.length}</div>
              <div className="text-sm text-slate-600 mt-1">问题总数</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">审计摘要</h3>
        <p className="text-sm text-slate-600 whitespace-pre-wrap">{summary}</p>
      </div>

      {/* Compliance Issues */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">合规问题</h3>
          <span className="text-sm font-medium text-slate-500">{issues.length} 个问题</span>
        </div>
        <div className="space-y-4">
          {issues.length === 0 ? (
            <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-lg">
              <i className="fas fa-check-circle text-green-500 text-4xl mb-3"></i>
              <p className="text-sm text-slate-600">未发现合规问题</p>
            </div>
          ) : (
            issues.map(issue => (
              <div key={issue.id} className="border-l-4 pl-4 py-2">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRiskLevelColor(issue.severity)}`}>
                      {getRiskLevelText(issue.severity)}
                    </span>
                    <h4 className="text-sm font-medium text-slate-800">{issue.standardName}</h4>
                  </div>
                  <span className="text-xs text-slate-500">{issue.location}</span>
                </div>
                <p className="text-sm text-slate-600 mb-2">{issue.issueDescription}</p>
                <div className="bg-slate-50 p-3 rounded-lg mb-2">
                  <p className="text-xs text-slate-700 font-mono whitespace-pre-wrap">{issue.clauseText}</p>
                </div>
                <p className="text-sm text-indigo-600">
                  <i className="fas fa-lightbulb mr-1"></i>
                  {issue.recommendation}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">改进建议</h3>
        <div className="space-y-3">
          {recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start gap-3">
              <i className="fas fa-arrow-right text-indigo-500 mt-1 flex-shrink-0"></i>
              <p className="text-sm text-slate-600">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
