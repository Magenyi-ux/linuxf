
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2, RotateCcw, Image as ImageIcon, Search } from 'lucide-react';
import { createTutorChatSession } from '../services/aiService';
import { trackEvent } from '../services/analytics';
import { MathText } from './MathText';
import { KnowledgeReport } from './KnowledgeReport';
import { initKnowledgeDB, parseCommand, addTopic, addUnit, saveKnowledgeDB } from '../services/knowledgeService';

interface ChatBotProps {
  showChatBot: boolean;
  savedPosition?: { x: number; y: number } | null;
  onPositionChange: (pos: { x: number; y: number }) => void;
  onHide: () => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({
  showChatBot,
  savedPosition,
  onPositionChange,
  onHide
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(savedPosition || { x: -1, y: -1 });
  const [isOverHideZone, setIsOverHideZone] = useState(false);
  const dragRef = useRef<{ startX: number, startY: number, initialX: number, initialY: number } | null>(null);
  const [messages, setMessages] = useState<{
    role: 'user' | 'model';
    content: string;
    report?: any;
    isSearch?: boolean;
    searchResults?: string[];
    canSave?: boolean;
    topicName?: string;
  }[]>([
    { role: 'model', content: "Hello! I'm **Professor**, your AI study tutor. How can I help you prepare for your exams today? \n\n*Tip: Try power commands like `/explain optics` or `/formula gravity`.*" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const chatSessionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleDiveDeep = (e: any) => {
        const { context } = e.detail;
        setIsOpen(true);
        setIsMinimized(false);
        setMessages([
            { role: 'model', content: "Initializing deep research mode... analyzing your question context." }
        ]);
        chatSessionRef.current = createTutorChatSession(context);
        setIsLoading(true);

        // Mocking the initial response from the new session
        setTimeout(() => {
            setMessages(prev => [
                ...prev,
                { role: 'model', content: "I've analyzed the question and explanation. I'm ready to **'Dive Deep'** and help you master this topic. I can provide diagrams, prove concepts, or explain specific steps. What would you like to explore first?" }
            ]);
            setIsLoading(false);
        }, 1500);
    };

    window.addEventListener('dive-deep', handleDiveDeep);
    return () => window.removeEventListener('dive-deep', handleDiveDeep);
  }, []);

  useEffect(() => {
    if (isOpen) {
      trackEvent('feature_used', { name: 'chatbot_open' });
      initKnowledgeDB().catch(console.error);
      if (!chatSessionRef.current) {
        chatSessionRef.current = createTutorChatSession();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (savedPosition) {
        setPosition(savedPosition);
    } else if (savedPosition === null) {
        setPosition({ x: -1, y: -1 });
    }
  }, [savedPosition]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isOpen) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    dragRef.current = {
        startX: clientX,
        startY: clientY,
        initialX: position.x === -1 ? rect.left : position.x,
        initialY: position.y === -1 ? rect.top : position.y
    };

    setIsDragging(true);
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
        if (!isDragging || !dragRef.current) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const dx = clientX - dragRef.current.startX;
        const dy = clientY - dragRef.current.startY;

        const newX = dragRef.current.initialX + dx;
        const newY = dragRef.current.initialY + dy;

        setPosition({ x: newX, y: newY });

        // Check if over hide zone (bottom middle)
        const hideZone = document.getElementById('chat-hide-zone');
        if (hideZone) {
            const rect = hideZone.getBoundingClientRect();
            const isOver = clientX > rect.left && clientX < rect.right && clientY > rect.top && clientY < rect.bottom;
            setIsOverHideZone(isOver);
        }
    };

    const handleEnd = () => {
        if (!isDragging) return;

        if (isOverHideZone) {
            onHide();
        } else {
            onPositionChange(position);
        }

        setIsDragging(false);
        setIsOverHideZone(false);
        dragRef.current = null;
    };

    if (isDragging) {
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleEnd);
    }

    return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, position, isOverHideZone, onHide, onPositionChange]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSaveToDB = async (msgIndex: number) => {
    const msg = messages[msgIndex];
    if (!msg.topicName) return;

    try {
        addTopic({
            name: msg.topicName.toLowerCase().replace(/\s+/g, '_'),
            subject: 'General',
            coverage: 100
        });
        addUnit({
            topic: msg.topicName.toLowerCase().replace(/\s+/g, '_'),
            type: 'definition',
            content: msg.content
        });
        await saveKnowledgeDB();

        setMessages(prev => prev.map((m, i) => i === msgIndex ? { ...m, canSave: false } : m));
        alert("Knowledge saved to Core!");
    } catch (e) {
        console.error("Save failed", e);
    }
  };

  const handleSend = async (overrideMessage?: string) => {
    const messageToProcess = overrideMessage || input;
    if ((!messageToProcess.trim() && !selectedImage) || isLoading) return;

    const userMessage = messageToProcess.trim();
    const imageToUpload = selectedImage ? selectedImage.split(',')[1] : undefined;

    setInput('');
    setSelectedImage(null);
    setMessages(prev => [
        ...prev,
        {
            role: 'user',
            content: selectedImage ? `[Image Uploaded] ${userMessage}` : userMessage
        }
    ]);

    // Handle Knowledge OS Commands
    if (userMessage.startsWith('/')) {
        const result = parseCommand(userMessage);
        if (result) {
            if (result.error) {
                setMessages(prev => [...prev, {
                    role: 'model',
                    content: `⚠️ ${result.error}\n\nFalling back to AI research...`
                }]);
                // Continue to AI fallback
            } else if (result.type === 'search') {
                setMessages(prev => [...prev, {
                    role: 'model',
                    content: `Search results for "${result.topic}":`,
                    isSearch: true,
                    searchResults: result.results
                }]);
                return;
            } else {
                setMessages(prev => [...prev, {
                    role: 'model',
                    content: `Knowledge Core match found for **${result.topic}**.`,
                    report: result
                }]);
                trackEvent('feature_used', { name: 'knowledge_command', command: result.command });
                return;
            }
        }
    }

    setIsLoading(true);

    try {
      trackEvent('question_asked', {
        hasImage: !!selectedImage,
        textLength: userMessage.length
      });

      if (!chatSessionRef.current) {
        chatSessionRef.current = createTutorChatSession();
      }

      const result = await chatSessionRef.current.sendMessage(userMessage || "Please analyze this image.", imageToUpload);
      const responseText = result.response.text();

      // Check if this looks like a definition or explanation for a topic
      const topicMatch = userMessage.match(/what is ([\w\s]+)/i) || userMessage.match(/explain ([\w\s]+)/i);
      const topicName = topicMatch ? topicMatch[1] : undefined;

      setMessages(prev => [...prev, {
        role: 'model',
        content: responseText,
        canSave: !!topicName,
        topicName: topicName
      }]);
    } catch (error) {
      console.error("Chat failed:", error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting right now. Please check your internet or try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    if (confirm("Reset conversation?")) {
      chatSessionRef.current = createTutorChatSession();
      setMessages([
        { role: 'model', content: "Hello! I'm **Professor**, your AI study tutor. How can I help you prepare for your exams today?" }
      ]);
    }
  };

  if (!showChatBot) return null;

  if (!isOpen) {
    const style: React.CSSProperties = position.x !== -1 ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
        bottom: 'auto',
        right: 'auto',
        position: 'fixed'
    } : {};

    return (
      <>
        <button
            onClick={() => !isDragging && setIsOpen(true)}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            style={style}
            className={`fixed bottom-24 right-6 md:bottom-8 md:right-8 w-16 h-16 bg-primary-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group cursor-move ${isDragging ? 'scale-125 rotate-12 shadow-primary-500/50' : ''}`}
        >
            <MessageCircle className="w-8 h-8" />
            {!isDragging && (
                <span className="absolute right-full mr-4 bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Ask Professor
                </span>
            )}
        </button>

        {/* Hide Zone */}
        {isDragging && (
            <div
                id="chat-hide-zone"
                className={`fixed bottom-12 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-4 border-dashed flex items-center justify-center transition-all z-[60] ${isOverHideZone ? 'bg-red-500 border-red-200 scale-125' : 'bg-gray-900/20 border-white/50'}`}
            >
                <X className={`w-8 h-8 ${isOverHideZone ? 'text-white' : 'text-white/70'}`} />
            </div>
        )}
      </>
    );
  }

  const containerStyle: React.CSSProperties = position.x !== -1 ? {
      left: window.innerWidth > 768 ? `${position.x - 320}px` : '5vw',
      top: window.innerWidth > 768 ? `${position.y - 500}px` : '10vh',
      bottom: 'auto',
      right: 'auto',
      position: 'fixed'
  } : {};

  return (
    <div
      style={window.innerWidth > 768 ? containerStyle : {}}
      className={`fixed bottom-24 right-6 md:bottom-8 md:right-8 w-[90vw] md:w-96 bg-white rounded-[32px] shadow-2xl border border-gray-100 flex flex-col z-50 overflow-hidden transition-all ${isMinimized ? 'h-20' : 'h-[500px] md:h-[600px]'}`}
    >
      {/* Header */}
      <div className="p-5 bg-primary-600 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
                <Bot className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-black text-sm">Professor</h3>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Always Learning</span>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-1">
            <button onClick={resetChat} title="Reset Chat" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <RotateCcw className="w-4 h-4" />
            </button>
            <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 sidebar-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-primary-100 text-primary-600' : 'bg-white text-gray-400 border border-gray-100'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-100'}`}>
                    <MathText text={msg.content} />
                    {msg.report && (
                      <KnowledgeReport
                        {...msg.report}
                      />
                    )}
                    {msg.canSave && (
                        <button
                            onClick={() => handleSaveToDB(i)}
                            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-100 transition-colors border border-green-100"
                        >
                            <RotateCcw className="w-3 h-3 rotate-180" /> Save to Knowledge Core
                        </button>
                    )}
                    {msg.isSearch && msg.searchResults && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {msg.searchResults.length > 0 ? msg.searchResults.map((res, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              handleSend(`/explain ${res}`);
                            }}
                            className="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-xs font-bold hover:bg-primary-100 transition-colors"
                          >
                            {res}
                          </button>
                        )) : (
                          <span className="text-xs text-gray-400 italic">No topics found.</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white text-gray-400 border border-gray-100 flex items-center justify-center shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100">
            {selectedImage && (
                <div className="mb-3 relative inline-block">
                    <img src={selectedImage} alt="Selected" className="w-16 h-16 object-cover rounded-xl border-2 border-primary-500" />
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            )}
            <div className="relative flex gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 hover:text-primary-600 transition-all"
                >
                    <ImageIcon className="w-5 h-5" />
                </button>
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask or upload an image..."
                        className="w-full pl-5 pr-14 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all text-sm font-medium"
                    />
                    <button
                        onClick={handleSend}
                        disabled={(!input.trim() && !selectedImage) || isLoading}
                        className="absolute right-2 top-2 bottom-2 w-10 bg-primary-600 text-white rounded-xl flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
