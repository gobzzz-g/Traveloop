'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Send, Bot, User, Loader2, Brain, MapPin, DollarSign } from 'lucide-react';
import { aiService } from '@/services/index';
import { tripService } from '@/services/tripService';
import { ChatMessage } from '@/types';
import DashboardLayout from '../dashboard/layout';

export default function AIPage() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: "Hey there! I'm Traveloop AI 🌍✈️ Your personal travel assistant. Ask me anything — destinations, budgets, packing, visa info, best time to visit, or let me plan your entire trip! What adventure are you planning?",
      timestamp: new Date(),
    },
  ]);
  const [selectedTrip, setSelectedTrip] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: tripsData } = useQuery({
    queryKey: ['trips', 'ai'],
    queryFn: () => tripService.getTrips({ limit: 10 }),
  });

  const chatMutation = useMutation({
    mutationFn: (msg: string) => {
      const trip = tripsData?.data?.find(t => t.id === selectedTrip);
      return aiService.chat(
        msg,
        chatHistory.filter(m => m.role !== 'model' || chatHistory.indexOf(m) > 0).map(m => ({
          role: m.role as 'user' | 'model',
          content: m.content,
        })),
        trip ? { destination: trip.destinations[0]?.city, budget: trip.budget, travelStyle: trip.travelStyle } : undefined
      );
    },
    onSuccess: (res) => {
      setChatHistory(prev => [...prev, {
        role: 'model',
        content: res.data.reply,
        timestamp: new Date(),
      }]);
    },
    onError: () => {
      setChatHistory(prev => [...prev, {
        role: 'model',
        content: "I'm sorry, I couldn't process that. Please check that GEMINI_API_KEY is configured in your backend .env file.",
        timestamp: new Date(),
      }]);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSend = () => {
    if (!message.trim() || chatMutation.isPending) return;
    const userMsg = message.trim();
    setMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date() }]);
    chatMutation.mutate(userMsg);
  };

  const suggestions = [
    '🗺️ Plan a 7-day trip to Japan for $3000',
    '🧳 What should I pack for a beach vacation?',
    '💰 How much does a week in Paris cost?',
    '✈️ Best time to visit Bali?',
    '🏨 Budget hotels in New York under $100?',
    '📋 Visa requirements for Thailand',
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)] pb-16 md:pb-0">
        {/* Header */}
        <div className="p-4 border-b border-surface-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-white">AI Travel Assistant</h1>
              <p className="text-surface-500 text-xs">Powered by Google Gemini</p>
            </div>
          </div>

          {tripsData?.data && tripsData.data.length > 0 && (
            <select
              value={selectedTrip}
              onChange={(e) => setSelectedTrip(e.target.value)}
              className="input-field text-sm max-w-48"
            >
              <option value="">No trip context</option>
              {tripsData.data.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          )}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'model' ? 'bg-gradient-brand' : 'bg-surface-700'
              }`}>
                {msg.role === 'model' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-surface-200" />}
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-brand-500 text-white rounded-tr-sm'
                  : 'glass border border-surface-700 text-surface-200 rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}

          {chatMutation.isPending && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="glass border border-surface-700 px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex items-center gap-2 text-surface-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        {chatHistory.length <= 1 && (
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setMessage(s); }}
                  className="px-3 py-1.5 rounded-xl text-xs glass border border-surface-700 text-surface-300 hover:border-brand-500/50 hover:text-brand-400 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-surface-800">
          <div className="flex items-end gap-3 glass rounded-2xl border border-surface-700 p-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask me anything about travel..."
              rows={1}
              className="flex-1 bg-transparent text-surface-200 text-sm resize-none outline-none placeholder:text-surface-600 max-h-24"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || chatMutation.isPending}
              className="p-2 rounded-xl bg-brand-500 text-white hover:bg-brand-600 transition-all disabled:opacity-50 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
