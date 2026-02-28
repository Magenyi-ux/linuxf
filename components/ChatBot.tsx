
/**
 * ChatBot.tsx - AI Tutor Interface
 * This component provides a floating chat interface where users can interact with
 * an AI tutor for exam preparation assistance.
 */
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Loader2, Bot, Trash2 } from 'lucide-react';
import { createTutorChatSession } from '../services/geminiService';
import { Chat, GenerateContentResponse } from "@google/genai";
import { MathText } from './MathText';
import { offlineTutor } from '../services/offlineTutorService';

// Definition of a chat message structure
interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const ChatBot: React.FC = () => {
  // --- State Hooks ---
  const [isOpen, setIsOpen] = useState(false); // Controls visibility of the chat window
  const [isOnline, setIsOnline] = useState(navigator.onLine); // Tracks internet connection
  const [messages, setMessages] = useState<Message[]>([]); // Array of chat messages
  const [inputValue, setInputValue] = useState(''); // Current text in the input field
  const [isTyping, setIsTyping] = useState(false); // Indicates if AI is currently generating a response

  // Refs for tracking the chat session and managing auto-scroll
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Automatically scrolls the chat window to the bottom when new messages arrive.
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Effect to listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Effect to load chat history from local storage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('waExamPrep_chat_messages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Failed to parse saved messages", e);
      }
    } else {
      // Default welcome message
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: "Hello! I'm your AI Tutor. I can help you with JAMB, WAEC, and NECO topics. Ask me anything!"
        }
      ]);
    }
  }, []);

  // Effect to persist messages to local storage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('waExamPrep_chat_messages', JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages, isOpen]);

  /**
   * Initializes the Gemini AI chat session if it hasn't been created yet.
   */
  const initializeChat = () => {
    if (!chatSessionRef.current) {
      chatSessionRef.current = createTutorChatSession();
    }
  };

  /**
   * Opens the chat window and ensures the AI session is initialized.
   */
  const handleOpen = () => {
    setIsOpen(true);
    initializeChat();
  };

  /**
   * Sends the user's message to the AI and handles the response.
   */
  const handleSend = async () => {
    if (!inputValue.trim() || !chatSessionRef.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue
    };

    // Add user message to state and clear input
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // --- Offline Handling ---
    // If the device is offline, use the local OfflineTutorService for a mock response
    if (!offlineTutor.isOnline()) {
      setTimeout(() => {
        const offlineResponse = offlineTutor.getOfflineResponse(userMessage.text);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'model',
          text: offlineResponse
        }]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    // --- Online Handling (Gemini AI) ---
    try {
      // Start streaming the AI's response for a better user experience
      const resultStream = await chatSessionRef.current.sendMessageStream({ 
        message: userMessage.text 
      });
      
      const botMessageId = (Date.now() + 1).toString();
      let fullText = '';
      
      // Add a placeholder message for the incoming stream
      setMessages(prev => [...prev, { id: botMessageId, role: 'model', text: '' }]);

      // Iterate through chunks of the streamed response
      for await (const chunk of resultStream) {
        const c = chunk as GenerateContentResponse;
        const text = c.text;
        if (text) {
          fullText += text;
          // Update the specific message in state as more text arrives
          setMessages(prev => 
            prev.map(msg => 
              msg.id === botMessageId ? { ...msg, text: fullText } : msg
            )
          );
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: "I'm having trouble connecting right now. Please try again." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  /**
   * Allows sending messages by pressing the 'Enter' key.
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- Render logic for closed state ---
  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-24 lg:bottom-10 right-6 lg:right-10 bg-brand-600 text-white p-5 rounded-[2rem] shadow-2xl shadow-brand-500/20 hover:bg-brand-700 transition-all hover:scale-110 active:scale-95 z-50 flex items-center gap-3 group"
        aria-label="Chat with AI Tutor"
      >
        <div className="relative">
            <Bot className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full border-2 border-brand-600" />
        </div>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap font-black uppercase tracking-widest text-xs">
          Personal Tutor
        </span>
      </button>
    );
  }

  // --- Render logic for open state (Chat Window) ---
  return (
    <div className="fixed bottom-4 right-4 w-[calc(100%-2rem)] md:w-[450px] h-[600px] max-h-[85vh] bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] flex flex-col border border-gray-100 z-50 animate-fade-in-up overflow-hidden">
      {/* Header Area */}
      <div className="bg-brand-600 p-6 flex items-center justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full translate-x-16 -translate-y-16" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl shadow-xl rotate-3">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black tracking-tight text-lg">AI Exam Tutor</h3>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-100">
              {isOnline ? (
                <>
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  Online Assistance
                </>
              ) : (
                <>
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                  Offline Mode
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          {/* Clear History Button */}
          <button
            onClick={() => {
              if (confirm("Clear chat history?")) {
                const welcomeMsg = {
                  id: 'welcome',
                  role: 'model' as const,
                  text: "Hello! I'm your AI Tutor. I can help you with JAMB, WAEC, and NECO topics. Ask me anything!"
                };
                setMessages([welcomeMsg]);
                localStorage.setItem('waExamPrep_chat_messages', JSON.stringify([welcomeMsg]));
              }
            }}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center"
            title="Clear Chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          {/* Close Window Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Message List Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface-50/50 sidebar-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
          >
            <div
              className={`max-w-[85%] p-5 rounded-[1.5rem] shadow-sm ${
                msg.role === 'user'
                  ? 'bg-brand-600 text-white rounded-tr-none shadow-brand-500/10'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
              }`}
            >
              {/* MathText handles rendering of LaTeX math expressions */}
              <MathText text={msg.text} className={`text-sm font-medium leading-relaxed ${msg.role === 'user' ? 'text-white' : 'text-gray-800'}`} />
            </div>
          </div>
        ))}
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-brand-600 animate-spin" />
              <span className="text-xs text-gray-400">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Area */}
      <div className="p-6 bg-white border-t border-gray-50 rounded-b-[2.5rem]">
        <div className="flex gap-3 bg-gray-50 p-2 rounded-[1.5rem] border border-gray-100 focus-within:border-brand-500 transition-all shadow-inner">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your tutor anything..."
            className="flex-1 px-4 py-2 bg-transparent outline-none font-bold text-gray-700 text-sm placeholder:text-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="w-10 h-10 bg-brand-600 text-white rounded-2xl flex items-center justify-center hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-500/20 active:scale-90"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
