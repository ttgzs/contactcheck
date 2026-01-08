
import React from 'react';
import { ContractAnalysis, RiskLevel } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Props {
  analysis: ContractAnalysis;
  compact?: boolean;
}

const COLORS = {
  [RiskLevel.LOW]: '#10b981',
  [RiskLevel.MEDIUM]: '#f59e0b',
  [RiskLevel.HIGH]: '#f97316',
  [RiskLevel.CRITICAL]: '#ef4444',
};

export const AnalysisDashboard: React.FC<Props> = ({ analysis, compact = false }) => {
  const riskCounts = analysis.risks.reduce((acc, risk) => {
    acc[risk.level] = (acc[risk.level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(riskCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">评分</p>
          <p className={`text-2xl font-black ${analysis.complianceScore > 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {analysis.complianceScore}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">风险</p>
          <p className="text-2xl font-black text-slate-800">{analysis.risks.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">缺失</p>
          <p className="text-2xl font-black text-indigo-600">{analysis.missingClauses.length}</p>
        </div>
      </div>

      {/* Summary Area */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm">
        <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-2">
          <i className="fas fa-lightbulb text-amber-400"></i> 核心结论
        </h4>
        <p className="text-xs leading-relaxed text-slate-200">{analysis.overallRecommendation}</p>
      </div>

      {/* Risk List */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 max-h-[400px] overflow-y-auto">
        <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
          <span>风险细节清单</span>
          <span className="text-[10px] text-slate-400 font-normal">点击展开详情</span>
        </h4>
        <div className="space-y-3">
          {analysis.risks.map((risk, i) => (
            <div key={i} className="group p-3 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:border-indigo-100 transition-all">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-800">{risk.title}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase" style={{ backgroundColor: `${COLORS[risk.level]}20`, color: COLORS[risk.level] }}>
                  {risk.level}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 group-hover:line-clamp-none transition-all">{risk.description}</p>
              <div className="mt-2 text-[10px] text-indigo-600 font-medium bg-indigo-50/50 p-2 rounded-lg">
                建议：{risk.suggestion}
              </div>
            </div>
          ))}
        </div>
      </div>

      {!compact && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as RiskLevel]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
