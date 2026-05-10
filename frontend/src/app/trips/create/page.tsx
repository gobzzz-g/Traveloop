'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Calendar, DollarSign, Users, Globe, Brain, ArrowRight, Loader2 } from 'lucide-react';
import { tripService } from '@/services/tripService';
import { aiService } from '@/services/index';
import DashboardLayout from '../../dashboard/layout';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Start date required'),
  endDate: z.string().min(1, 'End date required'),
  budget: z.number().min(0),
  currency: z.string(),
  travelStyle: z.enum(['LUXURY', 'BACKPACKING', 'ADVENTURE', 'FAMILY', 'SOLO', 'ROMANTIC', 'BUSINESS', 'GROUP']),
  privacy: z.enum(['PRIVATE', 'PUBLIC', 'SHARED']),
  travelersCount: z.number().min(1).max(100),
  tags: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const travelStyles = [
  { value: 'SOLO', emoji: '🧳', label: 'Solo' },
  { value: 'FAMILY', emoji: '👨‍👩‍👧', label: 'Family' },
  { value: 'ROMANTIC', emoji: '❤️', label: 'Romantic' },
  { value: 'ADVENTURE', emoji: '🧗', label: 'Adventure' },
  { value: 'BACKPACKING', emoji: '🎒', label: 'Backpacking' },
  { value: 'LUXURY', emoji: '💎', label: 'Luxury' },
  { value: 'BUSINESS', emoji: '💼', label: 'Business' },
  { value: 'GROUP', emoji: '👥', label: 'Group' },
];

export default function CreateTripPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{ tripSummary?: string } | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { travelStyle: 'SOLO' as const, currency: 'USD', travelersCount: 1, privacy: 'PRIVATE' as const, budget: 0 },
  });

  const selectedStyle = watch('travelStyle');

  const createMutation = useMutation({
    mutationFn: (data: FormData) => tripService.createTrip({
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      tags: data.tags?.split(',').map(t => t.trim()).filter(Boolean) || [],
    }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip created! 🎉');
      router.push(`/trips/${res.data.id}`);
    },
    onError: () => toast.error('Failed to create trip'),
  });

  const handleAIGenerate = async () => {
    const values = watch();
    if (!values.title) { toast.error('Add a trip title first'); return; }
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY && true) {
      // AI works via backend - just try it
    }
    setAiGenerating(true);
    try {
      const days = values.startDate && values.endDate
        ? Math.ceil((new Date(values.endDate).getTime() - new Date(values.startDate).getTime()) / (1000 * 60 * 60 * 24))
        : 7;

      const res = await aiService.generateItinerary({
        destination: values.title,
        days,
        budget: values.budget || 2000,
        currency: values.currency || 'USD',
        travelStyle: values.travelStyle,
        travelers: values.travelersCount || 1,
      });

      if (res.data) {
        setAiSuggestion(res.data as { tripSummary?: string });
        if ((res.data as { tripSummary?: string }).tripSummary) {
          setValue('description', (res.data as { tripSummary: string }).tripSummary);
        }
        toast.success('AI itinerary generated! Check description ✨');
      }
    } catch {
      toast.error('AI generation failed. Check your GEMINI_API_KEY.');
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-3xl mx-auto pb-24 md:pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Create New Trip ✈️</h1>
          <p className="text-surface-400 mb-8">Tell us about your adventure and let AI help you plan it.</p>
        </motion.div>

        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-6">
          {/* Basic Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Trip Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-surface-300 mb-1.5">Trip Title *</label>
                <div className="flex gap-2">
                  <input {...register('title')} placeholder="e.g., European Summer Adventure" className="input-field flex-1" />
                  <button
                    type="button"
                    onClick={handleAIGenerate}
                    disabled={aiGenerating}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 hover:bg-brand-500/20 transition-all text-sm font-medium whitespace-nowrap disabled:opacity-50"
                  >
                    {aiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                    {aiGenerating ? 'Generating...' : 'AI Plan'}
                  </button>
                </div>
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm text-surface-300 mb-1.5">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Describe your trip goals and highlights..."
                  className="input-field resize-none"
                />
              </div>

              {aiSuggestion && (
                <div className="p-3 rounded-xl bg-brand-500/5 border border-brand-500/20 text-brand-300 text-sm">
                  ✨ <strong>AI Suggestion:</strong> Description pre-filled based on your trip. Save and visit the itinerary builder for the full AI-generated day plan!
                </div>
              )}
            </div>
          </motion.div>

          {/* Dates & Budget */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Dates & Budget</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-surface-300 mb-1.5 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Start Date *</label>
                <input {...register('startDate')} type="date" className="input-field" />
                {errors.startDate && <p className="text-red-400 text-xs mt-1">{errors.startDate.message}</p>}
              </div>
              <div>
                <label className="block text-sm text-surface-300 mb-1.5 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> End Date *</label>
                <input {...register('endDate')} type="date" className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-surface-300 mb-1.5 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Total Budget</label>
                <input {...register('budget', { valueAsNumber: true })} type="number" min="0" placeholder="5000" className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-surface-300 mb-1.5">Currency</label>
                <select {...register('currency')} className="input-field">
                  {['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'INR', 'SGD'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-surface-300 mb-1.5 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Travelers</label>
                <input {...register('travelersCount', { valueAsNumber: true })} type="number" min="1" max="100" className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-surface-300 mb-1.5 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Privacy</label>
                <select {...register('privacy')} className="input-field">
                  <option value="PRIVATE">🔒 Private</option>
                  <option value="PUBLIC">🌍 Public</option>
                  <option value="SHARED">🔗 Shared Link</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Travel Style */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Travel Style</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {travelStyles.map((style) => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => setValue('travelStyle', style.value as FormData['travelStyle'])}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedStyle === style.value
                      ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                      : 'border-surface-700 bg-surface-800/50 text-surface-400 hover:border-surface-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{style.emoji}</div>
                  <div className="text-xs font-medium">{style.label}</div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Tags */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Tags (optional)</h2>
            <input {...register('tags')} placeholder="europe, beach, adventure (comma separated)" className="input-field" />
          </motion.div>

          <motion.button
            type="submit"
            disabled={createMutation.isPending}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-violet-500 text-white font-semibold text-lg hover:from-brand-600 hover:to-violet-600 transition-all btn-glow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ArrowRight className="w-5 h-5" /> Create Trip</>}
          </motion.button>
        </form>
      </div>
    </DashboardLayout>
  );
}
