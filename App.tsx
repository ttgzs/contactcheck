
import React, { useState } from 'react';
import { analyzeContract } from './services/gemini';
import { extractTextFromFile } from './services/fileParser';
import { ContractAnalysis } from './types';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { ChatInterface } from './components/ChatInterface';
import { Header } from './components/Header';
import { ClauseTemplateModule } from './components/ClauseTemplateModule';
import { ComplianceAuditModule } from './components/ComplianceAuditModule';
import { getConfig } from './services/config';

interface ModelOption {
  key: string;
  name: string;
  description: string;
}

interface AnalysisResult {
  modelKey: string;
  variant: string;
  result: ContractAnalysis;
}

interface AnalysisResults {
  [key: string]: {
    [variant: string]: ContractAnalysis;
  };
}

type ModuleType = 'contract-review' | 'clause-templates' | 'compliance-audit';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>('contract-review');
  const [contractText, setContractText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [selectedModels, setSelectedModels] = useState<{key: string, variant: string}[]>([{key: 'qianwen', variant: 'flash'}]);
  const [analyses, setAnalyses] = useState<AnalysisResults>({});
  const [error, setError] = useState<string | null>(null);

  const modelOptions: ModelOption[] = [
    // { key: 'qianwen', name: '阿里千问(Max)', description: '高级法律合同审查' },
    { key: 'qianwen', name: '阿里千问(Flash)', description: '快速法律分析' },
    // { key: 'huoshan', name: '豆包专业版', description: '火山方舟 豆包专业版深度审查' },
    // { key: 'huoshan', name: '火山方舟', description: '火山方舟 高效合同分析' }
    // { key: 'gemini', name: 'Gemini Pro', description: 'Google Gemini 专家级深度审查' },
    // { key: 'gemini', name: 'Gemini Flash', description: 'Google Gemini 快速扫描' },
    // { key: 'openai', name: 'GPT-3.5 Turbo', description: 'OpenAI GPT-3.5 Turbo 标准审查' },
    // { key: 'openai', name: 'GPT-4', description: 'OpenAI GPT-4 高级智能审查' },
    // { key: 'anthropic', name: 'Claude Opus', description: 'Anthropic Claude 顶级法律分析' },
    // { key: 'anthropic', name: 'Claude Sonnet', description: 'Anthropic Claude 高效法律分析' }
 
  ];

  const getModelVariant = (modelKey: string, name: string): string => {
    const config = getConfig();
    const modelConfig = config.models[modelKey];
    if (!modelConfig) return 'flash';
    
    for (const [variant, modelName] of Object.entries(modelConfig.models)) {
      if (name.includes(modelName.split('-')[0])) {
        return variant;
      }
    }
    return Object.keys(modelConfig.models)[0];
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setIsReadingFile(true);
    try {
      const text = await extractTextFromFile(file);
      setContractText(text);
    } catch (err: any) {
      setError(err.message || "读取文件失败。");
    } finally {
      setIsReadingFile(false);
    }
  };

  const toggleModel = (modelKey: string, name: string) => {
    const variant = getModelVariant(modelKey, name);
    const modelIdentifier = { key: modelKey, variant };
    
    setSelectedModels(prev => {
      const isSelected = prev.some(m => m.key === modelKey && m.variant === variant);
      if (isSelected) {
        return prev.length > 1 ? prev.filter(m => !(m.key === modelKey && m.variant === variant)) : prev;
      } else {
        return [...prev, modelIdentifier];
      }
    });
  };

  const handleStartAnalysis = async () => {
    if (!contractText) {
      setError("请先载入合同。");
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    setAnalyses({});

    try {
      const promises = selectedModels.map(async (m) => {
        const result = await analyzeContract(m.key, contractText, m.variant);
        return { modelKey: m.key, variant: m.variant, result };
      });

      const results = await Promise.all(promises);
      const newAnalyses: AnalysisResults = {};
      
      results.forEach(r => {
        if (!newAnalyses[r.modelKey]) {
          newAnalyses[r.modelKey] = {};
        }
        newAnalyses[r.modelKey][r.variant] = r.result;
      });
      
      setAnalyses(newAnalyses);
    } catch (err: any) {
      setError(`分析出错: ${err.message || '请检查配置'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasAnyAnalysis = Object.keys(analyses).length > 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Modified Header with module navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <i className="fas fa-gavel text-white"></i>
            </div>
            <div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                LegalGuard AI
              </span>
              <span className="ml-2 px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase">Beta</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => setActiveModule('contract-review')}
              className={`text-sm font-medium transition-colors ${
                activeModule === 'contract-review' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              合同审查
            </button>
            <button 
              onClick={() => setActiveModule('clause-templates')}
              className={`text-sm font-medium transition-colors ${
                activeModule === 'clause-templates' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              条款模板
            </button>
            <button 
              onClick={() => setActiveModule('compliance-audit')}
              className={`text-sm font-medium transition-colors ${
                activeModule === 'compliance-audit' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              合规审计
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <i className="far fa-bell"></i>
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
              <img src="https://picsum.photos/32/32?random=1" alt="Avatar" />
            </div>
          </div>
        </div>
      </div>

      {/* Module Content */}
      <main className="flex-1">
        {activeModule === 'contract-review' ? (
          // Contract Review Module (Original Content)
          <div className="container mx-auto px-4 py-8 max-w-[1600px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Sidebar */}
              <div className="lg:col-span-3 space-y-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <h2 className="text-base font-bold mb-4 flex items-center gap-2 text-indigo-900">
                    <i className="fas fa-cog"></i> 审查配置
                  </h2>
                  
                  <div className="space-y-4">
                    {/* File Upload */}
                    <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                      isReadingFile ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-200'
                    }`}>
                      <input type="file" id="fileInput" className="hidden" accept=".txt,.md,.doc,.docx,.pdf" onChange={handleFileUpload} />
                      <label htmlFor="fileInput" className="cursor-pointer">
                        <i className={`fas ${isReadingFile ? 'fa-spinner fa-spin' : 'fa-upload'} text-indigo-500 mb-2`}></i>
                        <p className="text-xs font-bold text-slate-600">载入合同文件</p>
                      </label>
                    </div>

                    {/* Model Selection */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">选择对比引擎</p>
                      {modelOptions.map((model, index) => {
                        const variant = getModelVariant(model.key, model.name);
                        const isSelected = selectedModels.some(m => m.key === model.key && m.variant === variant);
                        
                        return (
                          <label 
                            key={index} 
                            className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-all"
                          >
                            <input 
                              type="checkbox" 
                              checked={isSelected} 
                              onChange={() => toggleModel(model.key, model.name)} 
                              className="w-4 h-4 rounded text-indigo-600" 
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-700">{model.name}</p>
                              <p className="text-[10px] text-slate-400">{model.description}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    <textarea
                      className="w-full h-40 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                      placeholder="粘贴文本..."
                      value={contractText}
                      onChange={(e) => setContractText(e.target.value)}
                    />

                    <button
                      onClick={handleStartAnalysis}
                      disabled={isAnalyzing || !contractText}
                      className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 disabled:opacity-50"
                    >
                      {isAnalyzing ? '正在对比分析...' : '开始比对审查'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Area */}
              <div className="lg:col-span-9 space-y-6">
                {!hasAnyAnalysis && !isAnalyzing ? (
                  <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white border border-slate-200 rounded-3xl p-12 text-center">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                      <i className="fas fa-balance-scale text-2xl text-indigo-300"></i>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">欢迎进入比对审查模式</h2>
                    <p className="text-sm text-slate-500 max-w-sm mt-2">您可以勾选多个模型，实时观察不同法律大模型对同一合同的理解差异。</p>
                  </div>
                ) : isAnalyzing ? (
                  <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white border border-slate-200 rounded-3xl">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                    <p className="text-slate-500 font-medium">多核并行审查中，请稍后...</p>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    <div className={`grid grid-cols-1 ${selectedModels.length > 1 ? 'xl:grid-cols-2' : ''} gap-6`}>
                      {Object.entries(analyses).map(([modelKey, variants]) => 
                        Object.entries(variants).map(([variant, analysis]) => {
                          const modelOption = modelOptions.find(m => {
                            const optVariant = getModelVariant(m.key, m.name);
                            return m.key === modelKey && optVariant === variant;
                          });
                          
                          return (
                            <div key={`${modelKey}-${variant}`} className="space-y-4">
                              <div className="flex items-center gap-2 px-2">
                                <span className={`w-2 h-2 rounded-full ${modelKey === 'gemini' ? 'bg-indigo-600' : modelKey === 'openai' ? 'bg-green-500' : 'bg-purple-500'}`}></span>
                                <h3 className="text-sm font-bold text-slate-700">{modelOption?.name || `${modelKey}-${variant}`} 审查报告</h3>
                              </div>
                              <AnalysisDashboard analysis={analysis} compact />
                            </div>
                          );
                        })
                      )}
                    </div>
                    <ChatInterface 
                      contractContext={contractText} 
                      initialSummary={
                        selectedModels.length > 0 
                          ? analyses[selectedModels[0].key]?.[selectedModels[0].variant]?.summary || '' 
                          : ''
                      } 
                      modelKey={selectedModels.length > 0 ? selectedModels[0].key : 'gemini'}
                      variant={selectedModels.length > 0 ? selectedModels[0].variant : 'pro'}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeModule === 'clause-templates' ? (
          // Clause Templates Module
          <ClauseTemplateModule />
        ) : (
          // Compliance Audit Module
          <ComplianceAuditModule />
        )}
      </main>
    </div>
  );
};

export default App;
