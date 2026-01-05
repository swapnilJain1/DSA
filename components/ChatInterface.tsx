import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { createChatSession } from '../services/geminiService';
import { Chat, GenerateContentResponse } from "@google/genai";

interface ChatInterfaceProps {
  codeContext: string;
  apiKey: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ codeContext, apiKey }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hi! I'm AlgoMind. Ask me anything about your code, or request a hint if you're stuck!",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Keep chat session ref to persist conversation
  const chatSessionRef = useRef<Chat | null>(null);

  useEffect(() => {
    // Initialize chat session on mount or when apiKey changes
    if (apiKey) {
      try {
        chatSessionRef.current = createChatSession(apiKey);
      } catch (error) {
        console.error("Failed to initialize chat session:", error);
      }
    }
  }, [apiKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    if (!chatSessionRef.current) {
        if (apiKey) {
            try {
                chatSessionRef.current = createChatSession(apiKey);
            } catch (error) {
                 setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: "Failed to connect to AI service. Please check your API key.",
                    timestamp: Date.now()
                  }]);
                  return;
            }
        } else {
             setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: "Please configure your Google Gemini API Key in settings to use the chat.",
                timestamp: Date.now()
              }]);
             return;
        }
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Provide context about the current code being edited
      const promptWithContext = `Current Code Context:\n\`\`\`javascript\n${codeContext}\n\`\`\`\n\nUser Query: ${userMsg.text}`;

      const result = await chatSessionRef.current.sendMessageStream({ message: promptWithContext });

      let fullResponse = "";
      const botMsgId = (Date.now() + 1).toString();
      
      // Add placeholder bot message
      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'model',
        text: '',
        timestamp: Date.now()
      }]);

      for await (const chunk of result) {
         const chunkText = (chunk as GenerateContentResponse).text;
         if (chunkText) {
             fullResponse += chunkText;
             setMessages(prev => prev.map(msg => 
               msg.id === botMsgId ? { ...msg, text: fullResponse } : msg
             ));
         }
      }

    } catch (error) {
      console.error("Chat Error", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "Sorry, I encountered an error connecting to the AI service.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center shrink-0
              ${msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'}
            `}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
            </div>
            <div className={`
              max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
              ${msg.role === 'user' 
                ? 'bg-blue-600/20 text-blue-100 rounded-tr-none border border-blue-600/30' 
                : 'bg-gray-800 text-gray-300 rounded-tl-none border border-gray-700'}
            `}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
               <Sparkles className="w-4 h-4 text-white animate-pulse" />
             </div>
             <div className="bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3 border border-gray-700 flex items-center gap-1">
               <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
               <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI for help or hints..."
            className="w-full bg-gray-800 text-white placeholder-gray-500 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-700 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-2 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;