
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Minimize2, Maximize2, Send, Bot, User, Sparkles } from 'lucide-react';
import { MathText } from './MathText';

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: "Hello! I'm your Examply Tutor. How can I help you study today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInputValue('');
    setIsLoading(true);

    try {
      // For now, we simulate a response since we don't have a backend/direct API call here
      // In a real app, this would call the Gemini service
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'bot',
          text: `I'm here to help with your studies! To get the best help with ${userMessage.substring(0, 20)}..., try checking our practice packs for detailed explanations.`
        }]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting right now." }]);
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 md:bottom-8 right-6 w-16 h-16 bg-primary-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 border-4 border-white"
      >
        <MessageCircle className="w-8 h-8" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-24 md:bottom-8 right-6 w-[90vw] md:w-[400px] bg-white rounded-[32px] shadow-2xl z-50 flex flex-col transition-all overflow-hidden border border-gray-100 ${isMinimized ? 'h-20' : 'h-[500px]'}`}>
      {/* Header */}
      <div className="p-5 bg-primary-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="font-black text-sm uppercase tracking-widest">Examply AI</div>
            <div className="text-[10px] font-bold text-white/60">ONLINE TUTOR</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 sidebar-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary-100 text-primary-600' : 'bg-white border border-gray-100 text-gray-400 shadow-sm'}`}>
                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed ${msg.role === 'user' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/10 rounded-tr-none' : 'bg-white border border-gray-100 text-gray-700 shadow-sm rounded-tl-none'}`}>
                    <MathText text={msg.text} />
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                 <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-2">
                    <div className="w-2 h-2 bg-gray-200 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-200 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-200 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Ask me anything..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="w-full pl-5 pr-14 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50 disabled:bg-gray-300"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-center gap-1 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                <Sparkles className="w-3 h-3" /> Powered by Gemini AI
            </div>
          </div>
        </>
      )}
    </div>
  );
};
