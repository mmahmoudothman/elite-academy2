
import React, { useState, useRef, useEffect } from 'react';
import { getAIResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Course } from '../types';
import { useLanguage } from './LanguageContext';

interface AIAssistantProps {
  courses?: Course[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ courses = [] }) => {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset messages or update greeting when language changes
    const greeting = language === 'ar' 
      ? 'مرحباً! أنا مساعدك في أكاديمية النخبة. كيف يمكنني مساعدتك في اختيار الدورة المناسبة اليوم؟'
      : 'Hello! I am your Elite Academy assistant. How can I help you find the right course today?';
    setMessages([{ role: 'model', text: greeting }]);
  }, [language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const response = await getAIResponse(userMsg, courses, language);
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  return (
    <div className={`fixed bottom-4 sm:bottom-6 ${language === 'ar' ? 'left-3 sm:left-6' : 'right-3 sm:right-6'} z-[100] transition-all`}>
      {isOpen ? (
        <div className="bg-white w-[calc(100vw-1.5rem)] sm:w-[350px] max-w-[350px] h-[60vh] sm:h-[500px] max-h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-5">
          <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold">{t.nav.advisor}</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none rtl:rounded-tr-2xl rtl:rounded-tl-none' 
                    : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none rtl:rounded-tl-2xl rtl:rounded-tr-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex gap-2 rtl:flex-row-reverse">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={language === 'ar' ? 'اسأل عن الدورات...' : "Ask about courses..."}
                className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none rtl:text-right"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <svg className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 group relative"
        >
          <div className={`absolute -top-12 ${language === 'ar' ? 'left-0' : 'right-0'} bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap`}>
            {language === 'ar' ? 'كيف يمكنني مساعدتك؟' : 'How can I help you?'}
          </div>
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default AIAssistant;
