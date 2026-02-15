
/**
 * ChatBot.tsx - AI Tutor Interface
 * This component provides a floating chat interface where users can interact with
 * an AI tutor for exam preparation assistance.
 */
import React, { useState, useRef, useEffect, memo } from 'react';
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

/**
 * ChatMessage Component - Renders an individual chat bubble.
 * Memoized to prevent re-renders of the entire message history during
 * AI response streaming.
 */
const ChatMessage = memo(({ msg }: { msg: Message }) => {
  return (
    <div
      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] p-3 rounded-2xl ${
          msg.role === 'user'
            ? 'bg-brand-600 text-white rounded-tr-sm'
            : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm shadow-sm'
        }`}
      >
        {/* MathText handles rendering of LaTeX math expressions */}
        <MathText text={msg.text} className={msg.role === 'user' ? 'text-white' : 'text-gray-800'} />
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

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
        className="fixed bottom-6 right-6 bg-brand-600 text-white p-4 rounded-full shadow-lg hover:bg-brand-700 transition-all hover:scale-105 z-50 flex items-center gap-2 group"
        aria-label="Chat with AI Tutor"
      >
        <Bot className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-bold">
          Ask AI Tutor
        </span>
      </button>
    );
  }

  // --- Render logic for open state (Chat Window) ---
  return (
    <div className="fixed bottom-4 right-4 w-full md:w-96 h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 z-50 animate-fade-in-up">
      {/* Header Area */}
      <div className="bg-brand-600 p-4 rounded-t-2xl flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1.5 rounded-lg">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold">AI Exam Tutor</h3>
            <div className="flex items-center gap-1 text-xs text-brand-100">
              {isOnline ? (
                <>
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Online
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  Offline
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
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
            className="p-1 hover:bg-brand-500 rounded-lg transition-colors mr-1"
            title="Clear Chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          {/* Close Window Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-brand-500 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Message List Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 sidebar-scrollbar">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} msg={msg} />
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
      <div className="p-4 bg-white border-t border-gray-100 rounded-b-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-gray-50 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="p-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
