
import React, { useState, useRef, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Send, Bot, User, CornerDownLeft, Loader } from 'lucide-react';
import { askAiAssistant } from '../../services/geminiService';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await askAiAssistant(input);
      const aiMessage: Message = { sender: 'ai', text: aiResponse };
      setMessages(prev => [...prev, userMessage, aiMessage]);
    } catch (error) {
      const errorMessage: Message = { sender: 'ai', text: "Sorry, I couldn't get a response. Please try again." };
      setMessages(prev => [...prev, userMessage, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "What's our paternity leave policy?",
    "How many sick leaves can I take?",
    "Explain the notice period.",
    "What are the standard work hours?",
  ];
  
  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI HR Assistant" size="lg">
      <div className="flex flex-col h-[60vh]">
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 rounded-t-md">
          {messages.length === 0 ? (
             <div className="text-center flex flex-col items-center justify-center h-full">
                <Bot size={48} className="text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold text-slate-700">Welcome to the AI Assistant!</h3>
                <p className="text-slate-500 mt-1">How can I help you with our HR policies today?</p>
                <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-md">
                    {quickPrompts.map(prompt => (
                         <button key={prompt} onClick={() => handleQuickPrompt(prompt)} className="text-sm text-left p-3 bg-white rounded-lg border border-slate-200 hover:bg-slate-100 hover:border-blue-400 transition">
                             {prompt}
                         </button>
                    ))}
                </div>
             </div>
          ) : (
            messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'ai' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center"><Bot size={20} /></div>}
              <div className={`max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'}`}>
                 <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
              {msg.sender === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center"><User size={20} /></div>}
            </div>
          )))}
          {isLoading && (
             <div className="flex items-start gap-3">
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center"><Bot size={20} /></div>
                <div className="max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-white text-slate-700 border border-slate-200 rounded-bl-none flex items-center">
                    <Loader className="animate-spin text-blue-500" size={20} />
                    <span className="ml-2 text-sm text-slate-500">Thinking...</span>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-slate-200">
          <form onSubmit={handleSendMessage} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about leave, notice period, etc..."
              className="w-full bg-slate-100 border-slate-200 rounded-lg py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
              disabled={!input.trim() || isLoading}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default AiAssistantModal;