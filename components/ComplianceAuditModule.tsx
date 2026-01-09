import React, { useState } from 'react';
import { extractTextFromFile } from '../services/fileParser';
import { ComplianceStandard, ComplianceAudit, RiskLevel } from '../types';
import { ComplianceStandardList } from './ComplianceStandardList';
import { ComplianceAuditResults } from './ComplianceAuditResults';

export const ComplianceAuditModule: React.FC = () => {
  const [contractText, setContractText] = useState('');
  const [selectedStandards, setSelectedStandards] = useState<string[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResults, setAuditResults] = useState<ComplianceAudit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Mock data for compliance standards
  const mockStandards: ComplianceStandard[] = [
    {
      id: '1',
      name: 'GDPR 数据保护条例',
      description: '欧盟通用数据保护条例',
      jurisdiction: '欧盟',
      category: '数据保护',
      version: '2018',
      effectiveDate: '2018-05-25T00:00:00Z'
    },
    {
      id: '2',
      name: 'CCPA 消费者隐私法',
      description: '加州消费者隐私法案',
      jurisdiction: '美国加州',
      category: '数据保护',
      version: '2020',
      effectiveDate: '2020-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'ISO 27001 信息安全',
      description: '信息安全管理体系标准',
      jurisdiction: '国际',
      category: '信息安全',
      version: '2022',
      effectiveDate: '2022-10-25T00:00:00Z'
    },
    {
      id: '4',
      name: '网络安全法',
      description: '中华人民共和国网络安全法',
      jurisdiction: '中国',
      category: '网络安全',
      version: '2017',
      effectiveDate: '2017-06-01T00:00:00Z'
    },
    {
      id: '5',
      name: '反垄断法',
      description: '中华人民共和国反垄断法',
      jurisdiction: '中国',
      category: '竞争法',
      version: '2022',
      effectiveDate: '2022-08-01T00:00:00Z'
    },
    {
      id: '6',
      name: '劳动合同法',
      description: '中华人民共和国劳动合同法',
      jurisdiction: '中国',
      category: '劳动法',
      version: '2013',
      effectiveDate: '2013-07-01T00:00:00Z'
    }
  ];

  const handleSelectStandard = (standard: ComplianceStandard) => {
    setSelectedStandards(prev => {
      if (prev.includes(standard.id)) {
        return prev.filter(id => id !== standard.id);
      } else {
        return [...prev, standard.id];
      }
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploadedFile(file);
    try {
      const text = await extractTextFromFile(file);
      setContractText(text);
      setAuditResults(null);
    } catch (err) {
      console.error('文件解析错误:', err);
      const errorMsg = err instanceof Error ? err.message : '读取文件失败，请确保文件格式正确。';
      setError(errorMsg);
    }
  };

  const handleStartAudit = async () => {
    if (!contractText) {
      setError('请先上传合同文件。');
      return;
    }
    if (selectedStandards.length === 0) {
      setError('请至少选择一个合规标准。');
      return;
    }

    setIsAuditing(true);
    setError(null);

    // Simulate API call with mock data
    setTimeout(() => {
      const mockAuditResults: ComplianceAudit = {
        id: 'audit-1',
        contractText: contractText,
        standardIds: selectedStandards,
        results: {
          complianceScore: 78.5,
          issues: [
            {
              id: 'issue-1',
              standardId: '1',
              standardName: 'GDPR 数据保护条例',
              clauseText: '本公司有权收集和使用用户的个人信息，无需另行通知。',
              issueDescription: '未明确告知用户个人信息收集的目的、方式和范围，违反GDPR第13条规定。',
              severity: RiskLevel.HIGH,
              recommendation: '修改条款，明确说明个人信息收集的目的、方式、范围以及用户的权利。',
              location: '第2条第3款'
            },
            {
              id: 'issue-2',
              standardId: '4',
              standardName: '网络安全法',
              clauseText: '对于用户数据泄露事件，公司将在72小时内通知相关部门。',
              issueDescription: '数据泄露通知时间过长，违反网络安全法第42条规定。',
              severity: RiskLevel.MEDIUM,
              recommendation: '将数据泄露通知时间缩短至24小时内。',
              location: '第5条第2款'
            }
          ],
          summary: '合同在数据保护方面存在2个主要问题，需要进一步修改以符合所选标准的要求。',
          recommendations: [
            '完善个人信息保护条款，确保符合GDPR和网络安全法的要求。',
            '建立数据泄露应急响应机制，确保及时通知相关部门。',
            '定期进行合规性审查，确保合同条款符合最新法规要求。'
          ]
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setAuditResults(mockAuditResults);
      setIsAuditing(false);
    }, 2000);
  };

  const handleReset = () => {
    setContractText('');
    setSelectedStandards([]);
    setAuditResults(null);
    setError(null);
    setUploadedFile(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-[1600px]">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">合规审计</h1>
            <p className="text-sm text-slate-600">评估合同的合规性，确保符合相关法律法规和标准</p>
          </div>

          {!auditResults ? (
            // Audit Setup View
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contract Upload */}
              <div className="lg:col-span-2 space-y-4">
                {/* File Upload */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">上传合同文件</h3>
                  <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    contractText ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-200'
                  }`}>
                    <input type="file" id="contractFile" className="hidden" accept=".txt,.md,.doc,.docx,.pdf" onChange={handleFileUpload} />
                    <label htmlFor="contractFile" className="cursor-pointer">
                      <i className="fas fa-file-alt text-indigo-500 text-4xl mb-4"></i>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-700">拖放文件到此处或点击上传</p>
                        <p className="text-xs text-slate-500">支持 .txt, .md, .doc, .docx, .pdf 格式</p>
                      </div>
                    </label>
                    {contractText && (
                      <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-600 flex items-center justify-between">
                          <span>已上传合同文本</span>
                          <button className="text-indigo-600 hover:text-indigo-700 font-medium" onClick={() => setContractText('')}>
                            更换文件
                          </button>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contract Preview */}
                {contractText && (
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">合同预览</h3>
                    <div className="bg-slate-50 rounded-lg max-h-96 overflow-y-auto">
                      {uploadedFile && uploadedFile.name.toLowerCase().endsWith('.pdf') ? (
                        <div className="p-4">
                          <iframe 
                            src={URL.createObjectURL(uploadedFile)} 
                            className="w-full h-full min-h-[70vh] border-0"
                            title={`${uploadedFile.name} Preview`}
                          />
                        </div>
                      ) : (
                        <pre className="p-4 text-xs text-slate-700 whitespace-pre-wrap">{contractText}</pre>
                      )}
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    {error}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 flex justify-end gap-3">
                  <button
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-6 py-2 rounded-lg font-medium transition-colors"
                    onClick={handleReset}
                  >
                    重置
                  </button>
                  <button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleStartAudit}
                    disabled={isAuditing || !contractText || selectedStandards.length === 0}
                  >
                    {isAuditing ? (
                      <div className="flex items-center gap-2">
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>审计中...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <i className="fas fa-check-circle"></i>
                        <span>开始审计</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Compliance Standards */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">选择合规标准</h3>
                  <p className="text-sm text-slate-600 mb-4">选择要评估的合规标准</p>
                  <ComplianceStandardList
                    standards={mockStandards}
                    onSelectStandard={handleSelectStandard}
                    selectedStandards={selectedStandards}
                  />
                </div>
              </div>
            </div>
          ) : (
            // Audit Results View
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-4 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">审计结果</h3>
                <div className="flex gap-3">
                  <button
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg font-medium transition-colors"
                    onClick={handleReset}
                  >
                    重新审计
                  </button>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    导出报告
                  </button>
                </div>
              </div>
              <ComplianceAuditResults audit={auditResults} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
