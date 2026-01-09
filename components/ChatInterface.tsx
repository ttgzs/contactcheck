
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { chatWithLegalAgent } from '../services/gemini';

interface Props {
  contractContext: string;
  initialSummary: string;
  modelKey?: string;
  variant?: string;
}

export const ChatInterface: React.FC<Props> = ({ 
  contractContext, 
  initialSummary, 
  modelKey = 'gemini',
  variant = 'pro'
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: `你好！我是你的 AI 法律助理。我已经完成了对这份合同的初步审查。有什么具体的细节或者条款你想深入了解吗？例如：“违约责任是如何界定的？”或者“如何修改目前的终止条款？”` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithLegalAgent(modelKey, messages, input, contractContext, variant);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "抱歉，咨询过程中遇到了问题，请稍后再试。" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
            <i className="fas fa-robot text-sm"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">法律咨询 Agent</h3>
            <p className="text-[10px] text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> 在线就绪
            </p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600">
          <i className="fas fa-history text-sm"></i>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                : 'bg-white text-slate-700 border border-slate-100 shadow-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-3 text-sm text-slate-400 border border-slate-100 animate-pulse flex items-center gap-2">
              <i className="fas fa-spinner fa-spin"></i> 正在思考法律对策...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-200">
        <div className="relative">
          <input
            type="text"
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm"
            placeholder="询问关于合同的任何问题..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1.5 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:bg-slate-300"
          >
            <i className="fas fa-paper-plane text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
};
