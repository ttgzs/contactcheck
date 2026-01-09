import React from 'react';
import { ClauseTemplate } from '../types';

export interface ClauseTemplateCardProps {
  template: ClauseTemplate;
  onSelect: (template: ClauseTemplate) => void;
}

export const ClauseTemplateCard: React.FC<ClauseTemplateCardProps> = ({ template, onSelect }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelect(template)}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-base font-bold text-slate-800">{template.name}</h3>
        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">{template.category}</span>
      </div>
      <p className="text-sm text-slate-600 mb-4 line-clamp-2">{template.description}</p>
      <div className="flex justify-between items-center text-xs text-slate-500">
        <span>使用次数: {template.usageCount}</span>
        <span>更新时间: {new Date(template.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};
