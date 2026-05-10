'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Trash2, Edit3, MapPin, Clock, DollarSign,
  Calendar, Share2, Brain, ChevronDown, ChevronUp, Loader2
} from 'lucide-react';
import { tripService } from '@/services/tripService';
import { destinationService, activityService, shareService, aiService } from '@/services/index';
import { formatDate, formatCurrency, getCategoryIcon } from '@/lib/utils';
import { Trip, Destination, Activity } from '@/types';
import DashboardLayout from '../../dashboard/layout';

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [expandedDest, setExpandedDest] = useState<string | null>(null);
  const [showAddDest, setShowAddDest] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [newDest, setNewDest] = useState({ city: '', country: '', arrivalDate: '', departureDate: '' });
  const [newActivity, setNewActivity] = useState({ title: '', category: 'OTHER', cost: '0', duration: '60', startTime: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => tripService.getTripById(id),
    enabled: !!id,
  });

  const trip: Trip | undefined = data?.data;

  const addDestMutation = useMutation({
    mutationFn: (data: object) => destinationService.addDestination(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', id] });
      setShowAddDest(false);
      setNewDest({ city: '', country: '', arrivalDate: '', departureDate: '' });
      toast.success('Destination added!');
    },
    onError: () => toast.error('Failed to add destination'),
  });

  const deleteDestMutation = useMutation({
    mutationFn: (destId: string) => destinationService.deleteDestination(destId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', id] });
      toast.success('Destination removed');
    },
  });

  const addActivityMutation = useMutation({
    mutationFn: (data: object) => activityService.addActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', id] });
      setShowAddActivity(null);
      setNewActivity({ title: '', category: 'OTHER', cost: '0', duration: '60', startTime: '' });
      toast.success('Activity added!');
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: (actId: string) => activityService.deleteActivity(actId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', id] }),
  });

  const createShareMutation = useMutation({
    mutationFn: () => shareService.createShareLink(id),
    onSuccess: (res) => {
      const slug = res.data.publicSlug;
      const url = `${window.location.origin}/share/${slug}`;
      navigator.clipboard.writeText(url).then(() => toast.success('Share link copied to clipboard!'));
    },
    onError: () => toast.error('Failed to create share link'),
  });

  const handleAIItinerary = async () => {
    if (!trip) return;
    setAiGenerating(true);
    try {
      const days = Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24));
      const dest = trip.destinations[0];
      const res = await aiService.generateItinerary({
        destination: dest ? `${dest.city}, ${dest.country}` : trip.title,
        days,
        budget: trip.budget,
        currency: trip.currency,
        travelStyle: trip.travelStyle,
        travelers: trip.travelersCount,
        startDate: trip.startDate,
      });
      toast.success('AI itinerary generated! Check the plan below ✨');
      // Show the result in a simple way
      console.log('AI Itinerary:', res.data);
      alert('AI itinerary generated! Data logged to console. Full itinerary view coming in Phase 2.');
    } catch {
      toast.error('AI generation failed. Configure GEMINI_API_KEY.');
    } finally {
      setAiGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 space-y-4 max-w-5xl mx-auto">
          <div className="skeleton h-48 rounded-2xl" />
          <div className="skeleton h-20 rounded-2xl" />
          <div className="skeleton h-40 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!trip) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <h2 className="text-xl text-surface-400">Trip not found</h2>
          <Link href="/trips" className="text-brand-400 mt-2 block">← Back to trips</Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-5xl mx-auto">
        {/* Back + Title */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/trips" className="p-2 rounded-xl glass hover:bg-surface-800 text-surface-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold text-white">{trip.title}</h1>
            <p className="text-surface-400 text-sm mt-0.5">
              {formatDate(trip.startDate)} – {formatDate(trip.endDate)} · {trip.travelersCount} traveler{trip.travelersCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAIItinerary}
              disabled={aiGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 hover:bg-brand-500/20 text-sm transition-all disabled:opacity-50"
            >
              {aiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              AI Plan
            </button>
            <button
              onClick={() => createShareMutation.mutate()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-surface-700 text-surface-300 hover:border-brand-500/50 text-sm transition-all"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: MapPin, label: 'Destinations', value: trip.destinations.length },
            { icon: DollarSign, label: 'Budget', value: formatCurrency(trip.budget, trip.currency) },
            { icon: Calendar, label: 'Days', value: Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)) },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 text-center">
              <s.icon className="w-5 h-5 mx-auto mb-1 text-brand-400" />
              <div className="font-bold text-white">{s.value}</div>
              <div className="text-surface-500 text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Destinations */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold text-white">Destinations</h2>
            <button
              onClick={() => setShowAddDest(!showAddDest)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm hover:bg-brand-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add City
            </button>
          </div>

          {showAddDest && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input placeholder="City" value={newDest.city} onChange={e => setNewDest(p => ({ ...p, city: e.target.value }))} className="input-field" />
                <input placeholder="Country" value={newDest.country} onChange={e => setNewDest(p => ({ ...p, country: e.target.value }))} className="input-field" />
                <input type="date" value={newDest.arrivalDate} onChange={e => setNewDest(p => ({ ...p, arrivalDate: e.target.value }))} className="input-field" placeholder="Arrival" />
                <input type="date" value={newDest.departureDate} onChange={e => setNewDest(p => ({ ...p, departureDate: e.target.value }))} className="input-field" placeholder="Departure" />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowAddDest(false)} className="px-4 py-2 rounded-xl text-surface-400 hover:text-white text-sm">Cancel</button>
                <button
                  onClick={() => addDestMutation.mutate({
                    tripId: id,
                    city: newDest.city,
                    country: newDest.country,
                    arrivalDate: new Date(newDest.arrivalDate).toISOString(),
                    departureDate: new Date(newDest.departureDate).toISOString(),
                  })}
                  disabled={!newDest.city || !newDest.country || !newDest.arrivalDate || addDestMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-all disabled:opacity-50"
                >
                  {addDestMutation.isPending ? '...' : 'Add'}
                </button>
              </div>
            </motion.div>
          )}

          {trip.destinations.length === 0 ? (
            <div className="glass-card p-8 text-center text-surface-500">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-surface-600" />
              <p>No destinations yet. Add your first city above.</p>
            </div>
          ) : (
            trip.destinations.map((dest: Destination, i: number) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card overflow-hidden"
              >
                {/* Destination Header */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => setExpandedDest(expandedDest === dest.id ? null : dest.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-xl">🏙️</div>
                    <div>
                      <h3 className="font-semibold text-white">{dest.city}, {dest.country}</h3>
                      <p className="text-surface-500 text-xs">
                        {formatDate(dest.arrivalDate, 'MMM d')} – {formatDate(dest.departureDate, 'MMM d')} · {dest.activities.length} activities
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); if (confirm('Delete this destination?')) deleteDestMutation.mutate(dest.id); }}
                      className="p-1.5 rounded-lg text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {expandedDest === dest.id ? <ChevronUp className="w-4 h-4 text-surface-400" /> : <ChevronDown className="w-4 h-4 text-surface-400" />}
                  </div>
                </div>

                {/* Activities */}
                {expandedDest === dest.id && (
                  <div className="border-t border-surface-800 p-4 space-y-3">
                    {dest.activities.map((activity: Activity) => (
                      <div key={activity.id} className="flex items-start justify-between p-3 rounded-xl bg-surface-800/50">
                        <div className="flex items-start gap-3">
                          <span className="text-lg mt-0.5">{getCategoryIcon(activity.category)}</span>
                          <div>
                            <p className="text-sm font-medium text-white">{activity.title}</p>
                            <div className="flex gap-3 mt-1 text-xs text-surface-500">
                              {activity.startTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{activity.startTime}</span>}
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{activity.duration}min</span>
                              <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{formatCurrency(activity.cost, activity.currency)}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteActivityMutation.mutate(activity.id)}
                          className="p-1 text-surface-600 hover:text-red-400 transition-colors ml-2 flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    {showAddActivity === dest.id ? (
                      <div className="p-3 rounded-xl border border-surface-700 space-y-2">
                        <input placeholder="Activity title" value={newActivity.title} onChange={e => setNewActivity(p => ({ ...p, title: e.target.value }))} className="input-field text-sm" />
                        <div className="grid grid-cols-2 gap-2">
                          <select value={newActivity.category} onChange={e => setNewActivity(p => ({ ...p, category: e.target.value }))} className="input-field text-sm">
                            {['ADVENTURE', 'FOOD', 'HISTORICAL', 'SHOPPING', 'NIGHTLIFE', 'BEACHES', 'HIKING', 'CULTURAL', 'OTHER'].map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <input placeholder="Start time (HH:MM)" value={newActivity.startTime} onChange={e => setNewActivity(p => ({ ...p, startTime: e.target.value }))} className="input-field text-sm" />
                          <input type="number" placeholder="Cost" value={newActivity.cost} onChange={e => setNewActivity(p => ({ ...p, cost: e.target.value }))} className="input-field text-sm" />
                          <input type="number" placeholder="Duration (min)" value={newActivity.duration} onChange={e => setNewActivity(p => ({ ...p, duration: e.target.value }))} className="input-field text-sm" />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setShowAddActivity(null)} className="px-3 py-1.5 text-sm text-surface-400 hover:text-white">Cancel</button>
                          <button
                            onClick={() => addActivityMutation.mutate({
                              destinationId: dest.id,
                              title: newActivity.title,
                              category: newActivity.category,
                              cost: parseFloat(newActivity.cost) || 0,
                              duration: parseInt(newActivity.duration) || 60,
                              startTime: newActivity.startTime || undefined,
                            })}
                            disabled={!newActivity.title || addActivityMutation.isPending}
                            className="px-3 py-1.5 rounded-lg bg-brand-500 text-white text-sm font-medium disabled:opacity-50"
                          >
                            Add Activity
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddActivity(dest.id)}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-surface-700 text-surface-500 hover:text-brand-400 hover:border-brand-500/50 text-sm transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Activity
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Budget', icon: DollarSign, href: `/budget/${id}` },
            { label: 'Packing', icon: MapPin, href: `/packing/${id}` },
            { label: 'Journal', icon: Edit3, href: `/journal?tripId=${id}` },
            { label: 'Share', icon: Share2, onClick: () => createShareMutation.mutate() },
          ].map((item) => (
            item.href ? (
              <Link key={item.label} href={item.href} className="flex flex-col items-center gap-2 p-4 glass-card hover:border-brand-500/30 transition-all text-surface-400 hover:text-brand-400">
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            ) : (
              <button key={item.label} onClick={item.onClick} className="flex flex-col items-center gap-2 p-4 glass-card hover:border-brand-500/30 transition-all text-surface-400 hover:text-brand-400">
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
