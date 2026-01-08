
import React, { useState } from 'react';
import { analyzeContract } from './services/gemini';
import { extractTextFromFile } from './services/fileParser';
import { ContractAnalysis } from './types';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { ChatInterface } from './components/ChatInterface';
import { Header } from './components/Header';

interface AnalysisResults {
  pro?: ContractAnalysis;
  flash?: ContractAnalysis;
}

const App: React.FC = () => {
  const [contractText, setContractText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [selectedModels, setSelectedModels] = useState<('pro' | 'flash')[]>(['pro']);
  const [analyses, setAnalyses] = useState<AnalysisResults>({});
  const [error, setError] = useState<string | null>(null);
  
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

  const toggleModel = (model: 'pro' | 'flash') => {
    setSelectedModels(prev => 
      prev.includes(model) 
        ? (prev.length > 1 ? prev.filter(m => m !== model) : prev) 
        : [...prev, model]
    );
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
        const result = await analyzeContract(contractText, m);
        return { type: m, result };
      });

      const results = await Promise.all(promises);
      const newAnalyses: AnalysisResults = {};
      results.forEach(r => {
        newAnalyses[r.type] = r.result;
      });
      setAnalyses(newAnalyses);
    } catch (err) {
      setError("分析出错，请检查配置。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasAnyAnalysis = Object.keys(analyses).length > 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-[1600px]">
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
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-all">
                    <input type="checkbox" checked={selectedModels.includes('pro')} onChange={() => toggleModel('pro')} className="w-4 h-4 rounded text-indigo-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-700">Qwen-Max</p>
                      <p className="text-[10px] text-slate-400">专家级深度审查</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-all">
                    <input type="checkbox" checked={selectedModels.includes('flash')} onChange={() => toggleModel('flash')} className="w-4 h-4 rounded text-indigo-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-700">Qwen-Plus</p>
                      <p className="text-[10px] text-slate-400">标准快速扫描</p>
                    </div>
                  </label>
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
                  {analyses.pro && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-2">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                        <h3 className="text-sm font-bold text-slate-700">Qwen-Max 审查报告</h3>
                      </div>
                      <AnalysisDashboard analysis={analyses.pro} compact />
                    </div>
                  )}
                  {analyses.flash && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        <h3 className="text-sm font-bold text-slate-700">Qwen-Plus 审查报告</h3>
                      </div>
                      <AnalysisDashboard analysis={analyses.flash} compact />
                    </div>
                  )}
                </div>
                <ChatInterface 
                  contractContext={contractText} 
                  initialSummary={analyses.pro?.summary || analyses.flash?.summary || ''} 
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
