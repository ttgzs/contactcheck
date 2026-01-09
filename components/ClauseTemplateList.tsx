import React from 'react';
import { ClauseTemplate } from '../types';
import { ClauseTemplateCard } from './ClauseTemplateCard';

export interface ClauseTemplateListProps {
  templates: ClauseTemplate[];
  onSelectTemplate: (template: ClauseTemplate) => void;
  searchQuery?: string;
  selectedCategory?: string;
}

export const ClauseTemplateList: React.FC<ClauseTemplateListProps> = ({
  templates,
  onSelectTemplate,
  searchQuery = '',
  selectedCategory = ''
}) => {
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(templates.map(template => template.category)));

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <h3 className="text-sm font-bold text-slate-800 mb-3">按类别筛选</h3>
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              !selectedCategory
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            onClick={() => {}}
          >
            全部
          </button>
          {categories.map(category => (
            <button
              key={category}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              onClick={() => {}}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Template List */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-file-alt text-slate-400 text-xl"></i>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">没有找到条款模板</h3>
          <p className="text-sm text-slate-600">尝试调整筛选条件或搜索关键词</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map(template => (
            <ClauseTemplateCard
              key={template.id}
              template={template}
              onSelect={onSelectTemplate}
            />
          ))}
        </div>
      )}
    </div>
  );
};
