import React from 'react';
import { ComplianceStandard } from '../types';

export interface ComplianceStandardListProps {
  standards: ComplianceStandard[];
  onSelectStandard: (standard: ComplianceStandard) => void;
  selectedStandards: string[];
}

export const ComplianceStandardList: React.FC<ComplianceStandardListProps> = ({
  standards,
  onSelectStandard,
  selectedStandards
}) => {
  const categories = Array.from(new Set(standards.map(standard => standard.category)));

  const toggleStandard = (standard: ComplianceStandard) => {
    onSelectStandard(standard);
  };

  return (
    <div className="space-y-4">
      {categories.map(category => {
        const categoryStandards = standards.filter(standard => standard.category === category);
        return (
          <div key={category} className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3">{category}</h3>
            <div className="space-y-2">
              {categoryStandards.map(standard => {
                const isSelected = selectedStandards.includes(standard.id);
                return (
                  <div
                    key={standard.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/30'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                    onClick={() => toggleStandard(standard)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleStandard(standard)}
                      className="w-4 h-4 rounded text-indigo-600 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium text-slate-800">{standard.name}</h4>
                        <span className="text-xs text-slate-500">v{standard.version}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{standard.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span>{standard.jurisdiction}</span>
                        <span>生效日期: {new Date(standard.effectiveDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
