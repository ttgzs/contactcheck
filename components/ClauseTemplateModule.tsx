import React, { useState } from 'react';
import { ClauseTemplate } from '../types';
import { ClauseTemplateList } from './ClauseTemplateList';

export const ClauseTemplateModule: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<ClauseTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Mock data for clause templates
  const mockTemplates: ClauseTemplate[] = [
    {
      id: '1',
      name: '保密条款',
      category: '通用条款',
      description: '用于保护商业机密和敏感信息的标准条款',
      content: '双方同意对在本合同履行过程中知悉的对方商业秘密和敏感信息保密，未经书面同意不得向第三方披露。',
      usageCount: 125,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-02-15T00:00:00Z'
    },
    {
      id: '2',
      name: '违约责任',
      category: '通用条款',
      description: '明确双方违反合同约定时应承担的责任和赔偿方式',
      content: '若一方违反本合同约定，应向对方支付违约金，并赔偿因此造成的全部损失。',
      usageCount: 98,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-03-01T00:00:00Z'
    },
    {
      id: '3',
      name: '知识产权归属',
      category: '知识产权',
      description: '明确合同履行过程中产生的知识产权的归属问题',
      content: '本合同履行过程中产生的所有知识产权归委托方所有，受托方仅享有合理使用的权利。',
      usageCount: 76,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z'
    },
    {
      id: '4',
      name: '争议解决',
      category: '通用条款',
      description: '约定合同争议的解决方式和管辖法院',
      content: '本合同引起的所有争议，双方应首先通过友好协商解决；协商不成的，任何一方均有权向合同签订地有管辖权的人民法院提起诉讼。',
      usageCount: 112,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-02-10T00:00:00Z'
    },
    {
      id: '5',
      name: '数据保护',
      category: '隐私保护',
      description: '符合GDPR和其他数据保护法规的条款',
      content: '双方应严格遵守适用的数据保护法规，确保个人数据的安全和隐私。',
      usageCount: 65,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-03-15T00:00:00Z'
    },
    {
      id: '6',
      name: '服务终止',
      category: '服务条款',
      description: '明确服务终止的条件和程序',
      content: '任何一方均可提前30天书面通知对方终止本服务合同。',
      usageCount: 89,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-02-20T00:00:00Z'
    }
  ];

  const handleSelectTemplate = (template: ClauseTemplate) => {
    setSelectedTemplate(template);
  };

  const handleBackToList = () => {
    setSelectedTemplate(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-[1600px]">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">条款模板库</h1>
            <p className="text-sm text-slate-600">选择和自定义标准化的法律条款，提高合同起草效率</p>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="搜索条款模板..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <i className="fas fa-plus"></i>
                <span className="font-medium">新建模板</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          {selectedTemplate ? (
            // Template Details View
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Template List Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-4">
                  <button
                    className="flex items-center gap-2 text-indigo-600 font-medium mb-4"
                    onClick={handleBackToList}
                  >
                    <i className="fas fa-arrow-left"></i>
                    <span>返回模板列表</span>
                  </button>
                  <ClauseTemplateList
                    templates={mockTemplates}
                    onSelectTemplate={handleSelectTemplate}
                    searchQuery={searchQuery}
                    selectedCategory={selectedCategory}
                  />
                </div>
              </div>

              {/* Template Details */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{selectedTemplate.name}</h2>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                          {selectedTemplate.category}
                        </span>
                        <span className="text-xs text-slate-500">使用次数: {selectedTemplate.usageCount}</span>
                        <span className="text-xs text-slate-500">
                          更新时间: {new Date(selectedTemplate.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        <i className="fas fa-edit mr-1"></i>
                        编辑
                      </button>
                      <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        <i className="fas fa-copy mr-1"></i>
                        复制
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 mb-2">描述</h3>
                      <p className="text-sm text-slate-600">{selectedTemplate.description}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-800 mb-2">条款内容</h3>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <pre className="text-sm text-slate-800 whitespace-pre-wrap font-mono">{selectedTemplate.content}</pre>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-6">
                      <h3 className="text-sm font-bold text-slate-800 mb-4">使用建议</h3>
                      <ul className="space-y-2 text-sm text-slate-600">
                        <li className="flex items-start gap-2">
                          <i className="fas fa-check-circle text-indigo-500 mt-0.5 flex-shrink-0"></i>
                          <span>根据具体合同类型调整条款内容</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <i className="fas fa-check-circle text-indigo-500 mt-0.5 flex-shrink-0"></i>
                          <span>确保条款符合适用法律和法规</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <i className="fas fa-check-circle text-indigo-500 mt-0.5 flex-shrink-0"></i>
                          <span>与其他合同条款保持一致性</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Template List View
            <ClauseTemplateList
              templates={mockTemplates}
              onSelectTemplate={handleSelectTemplate}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
            />
          )}
        </div>
      </div>
    </div>
  );
};
