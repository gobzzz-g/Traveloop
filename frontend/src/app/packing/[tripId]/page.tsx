'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Check, Brain, Loader2, Package } from 'lucide-react';
import { packingService, aiService } from '@/services/index';
import { tripService } from '@/services/tripService';
import { PackingItem, PackingCategory } from '@/types';
import DashboardLayout from '../../dashboard/layout';

const CATEGORIES: { value: PackingCategory; emoji: string; label: string }[] = [
  { value: 'CLOTHES', emoji: '👕', label: 'Clothes' },
  { value: 'ELECTRONICS', emoji: '📱', label: 'Electronics' },
  { value: 'DOCUMENTS', emoji: '📄', label: 'Documents' },
  { value: 'MEDICINES', emoji: '💊', label: 'Medicines' },
  { value: 'ACCESSORIES', emoji: '👓', label: 'Accessories' },
  { value: 'TOILETRIES', emoji: '🧴', label: 'Toiletries' },
  { value: 'OTHER', emoji: '📦', label: 'Other' },
];

export default function PackingPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const queryClient = useQueryClient();
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState<PackingCategory>('OTHER');
  const [aiGenerating, setAiGenerating] = useState(false);

  const { data: packingData, isLoading } = useQuery({
    queryKey: ['packing', tripId],
    queryFn: () => packingService.getPackingItems(tripId),
    enabled: !!tripId,
  });

  const { data: tripData } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripService.getTripById(tripId),
    enabled: !!tripId,
  });

  const addMutation = useMutation({
    mutationFn: () => packingService.addItem({ tripId, title: newItem, category: newCategory }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packing', tripId] });
      setNewItem('');
      toast.success('Item added');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, packed }: { id: string; packed: boolean }) =>
      packingService.updateItem(id, { packed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packing', tripId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => packingService.deleteItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packing', tripId] }),
  });

  const handleAIGenerate = async () => {
    const trip = tripData?.data;
    if (!trip) return;
    setAiGenerating(true);
    try {
      const days = Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24));
      const res = await aiService.generatePackingList({
        destination: trip.destinations[0]?.city || trip.title,
        days,
        travelStyle: trip.travelStyle,
      });

      const packingResult = res.data as { categories?: Record<string, { item: string; quantity?: number }[]> };
      if (packingResult?.categories) {
        const items: { title: string; category: PackingCategory }[] = [];
        for (const [cat, list] of Object.entries(packingResult.categories)) {
          if (Array.isArray(list)) {
            for (const item of list) {
              items.push({ title: item.item, category: cat as PackingCategory });
            }
          }
        }
        if (items.length > 0) {
          await packingService.bulkAdd(tripId, items);
          queryClient.invalidateQueries({ queryKey: ['packing', tripId] });
          toast.success(`${items.length} items added by AI! ✨`);
        }
      }
    } catch {
      toast.error('AI generation failed. Configure GEMINI_API_KEY.');
    } finally {
      setAiGenerating(false);
    }
  };

  const packing = packingData?.data;
  const items: PackingItem[] = packing?.items || [];
  const totalItems = packing?.totalItems || 0;
  const packedItems = packing?.packedItems || 0;
  const completion = packing?.completionPercentage || 0;
  const grouped = packing?.grouped || {};

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/trips/${tripId}`} className="p-2 rounded-xl glass hover:bg-surface-800 text-surface-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-violet-400" /> Packing Checklist
            </h1>
          </div>
          <button
            onClick={handleAIGenerate}
            disabled={aiGenerating}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm hover:bg-brand-500/20 transition-all"
          >
            {aiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            AI Generate
          </button>
        </div>

        {/* Progress */}
        <div className="glass-card p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-surface-300 font-medium">{packedItems} / {totalItems} items packed</span>
            <span className="text-brand-400 font-bold">{Math.round(completion)}%</span>
          </div>
          <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completion}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>

        {/* Add Item */}
        <div className="glass-card p-4 mb-6">
          <div className="flex gap-2">
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && newItem.trim()) addMutation.mutate(); }}
              placeholder="Add an item..."
              className="input-field flex-1"
            />
            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value as PackingCategory)} className="input-field max-w-36">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
            </select>
            <button
              onClick={() => newItem.trim() && addMutation.mutate()}
              disabled={!newItem.trim() || addMutation.isPending}
              className="px-4 py-2 rounded-xl bg-brand-500 text-white hover:bg-brand-600 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Items by Category */}
        {isLoading ? (
          [...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl mb-4" />)
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🎒</div>
            <p className="text-surface-400">No items yet. Add manually or use AI to generate a smart list!</p>
          </div>
        ) : (
          CATEGORIES.filter(cat => grouped[cat.value]?.length > 0).map((cat) => (
            <motion.div key={cat.value} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card mb-4 overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-800 flex items-center gap-2">
                <span className="text-lg">{cat.emoji}</span>
                <span className="font-medium text-white">{cat.label}</span>
                <span className="ml-auto text-xs text-surface-500">
                  {(grouped[cat.value] as PackingItem[])?.filter((i: PackingItem) => i.packed).length} / {grouped[cat.value]?.length}
                </span>
              </div>
              <div className="divide-y divide-surface-800">
                {(grouped[cat.value] as PackingItem[])?.map((item: PackingItem) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <button
                      onClick={() => toggleMutation.mutate({ id: item.id, packed: !item.packed })}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        item.packed ? 'bg-emerald-500 border-emerald-500' : 'border-surface-600 hover:border-emerald-500'
                      }`}
                    >
                      {item.packed && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span className={`flex-1 text-sm ${item.packed ? 'line-through text-surface-600' : 'text-surface-200'}`}>
                      {item.title}
                      {item.quantity > 1 && <span className="text-surface-500 ml-1">×{item.quantity}</span>}
                    </span>
                    <button onClick={() => deleteMutation.mutate(item.id)} className="text-surface-600 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
