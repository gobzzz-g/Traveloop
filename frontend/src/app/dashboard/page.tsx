'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Plane, Map, DollarSign, Calendar, TrendingUp, Plus,
  ArrowRight, Zap, Cloud, Star, Brain
} from 'lucide-react';
import { tripService } from '@/services/tripService';
import { useAuthStore } from '@/store/authStore';
import { formatDate, formatCurrency, getTripDuration, getTravelStyleEmoji } from '@/lib/utils';
import { Trip } from '@/types';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: tripsData, isLoading } = useQuery({
    queryKey: ['trips', 'dashboard'],
    queryFn: () => tripService.getTrips({ limit: 5, sortBy: 'startDate', sortOrder: 'asc' }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['trip-stats'],
    queryFn: () => tripService.getTripStats(),
  });

  const trips: Trip[] = tripsData?.data || [];
  const stats = statsData?.data;

  const statCards = [
    { label: 'Total Trips', value: stats?.total ?? user?.tripsCount ?? 0, icon: Plane, color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { label: 'Countries', value: user?.countriesCount ?? 0, icon: Map, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Travel Score', value: user?.travelScore ?? 0, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Upcoming', value: stats?.byStatus?.UPCOMING ?? 0, icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto">
      {/* ─── Welcome ──────────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-1">
          Hey {user?.name?.split(' ')[0]}, ready to explore? ✈️
        </h1>
        <p className="text-surface-400">Here&apos;s an overview of your travel plans.</p>
      </motion.div>

      {/* ─── Stats ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5 card-hover"
          >
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{card.value}</div>
            <div className="text-surface-500 text-sm mt-0.5">{card.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Trips List ──────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold text-white">Your Trips</h2>
            <Link href="/trips" className="text-brand-400 hover:text-brand-300 text-sm flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)
            ) : trips.length > 0 ? (
              trips.map((trip, i) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/trips/${trip.id}`} className="block glass-card p-5 card-hover group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{getTravelStyleEmoji(trip.travelStyle)}</span>
                          <h3 className="font-semibold text-white group-hover:text-brand-300 transition-colors">{trip.title}</h3>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-surface-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Map className="w-3.5 h-3.5" />
                            {trip.destinations?.length ?? 0} cities
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            {formatCurrency(trip.budget, trip.currency)}
                          </span>
                        </div>
                        {trip.destinations && trip.destinations.length > 0 && (
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {trip.destinations.slice(0, 4).map((d) => (
                              <span key={d.id} className="px-2 py-0.5 rounded-full bg-surface-800 text-surface-300 text-xs">
                                {d.city}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-sm font-medium text-surface-400">
                          {getTripDuration(trip.startDate, trip.endDate)}d
                        </div>
                        <ArrowRight className="w-4 h-4 text-surface-600 group-hover:text-brand-400 mt-2 ml-auto transition-colors" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="glass-card p-12 text-center">
                <div className="text-5xl mb-4">🗺️</div>
                <h3 className="text-lg font-semibold text-white mb-2">No trips yet!</h3>
                <p className="text-surface-400 text-sm mb-6">Create your first trip and let AI plan it for you.</p>
                <Link
                  href="/trips/create"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-600 transition-all btn-glow"
                >
                  <Plus className="w-4 h-4" /> Create First Trip
                </Link>
              </div>
            )}
          </div>

          {trips.length > 0 && (
            <Link
              href="/trips/create"
              className="mt-4 flex items-center justify-center gap-2 py-4 rounded-2xl glass border border-dashed border-surface-700 text-surface-400 hover:border-brand-500/50 hover:text-brand-400 transition-all text-sm"
            >
              <Plus className="w-4 h-4" /> Create New Trip
            </Link>
          )}
        </div>

        {/* ─── Right Panel ─────────────────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* AI Quick Action */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-brand-400" />
                </div>
                <span className="font-semibold text-white">AI Travel Assistant</span>
              </div>
              <p className="text-surface-400 text-sm mb-4">Ask AI to plan your next trip, estimate budgets, or suggest destinations.</p>
              <Link
                href="/ai"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium hover:bg-brand-500/20 transition-all"
              >
                <Brain className="w-4 h-4" /> Open AI Assistant
              </Link>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-5"
          >
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Travel Stats
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Planning', count: stats?.byStatus?.PLANNING ?? 0, color: 'bg-blue-500' },
                { label: 'Upcoming', count: stats?.byStatus?.UPCOMING ?? 0, color: 'bg-emerald-500' },
                { label: 'Completed', count: stats?.byStatus?.COMPLETED ?? 0, color: 'bg-violet-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-surface-400 text-sm">{item.label}</span>
                  </div>
                  <span className="text-white font-medium text-sm">{item.count}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Weather Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5"
          >
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-cyan-400" /> Weather at Destinations
            </h3>
            {trips.length > 0 && trips[0]?.destinations?.[0] ? (
              <div className="text-center py-2">
                <div className="text-3xl mb-1">⛅</div>
                <div className="text-white font-medium">{trips[0].destinations[0].city}</div>
                <div className="text-surface-400 text-sm">Check weather in Travel Settings</div>
              </div>
            ) : (
              <p className="text-surface-500 text-sm text-center py-2">Add destinations to see weather.</p>
            )}
          </motion.div>

          {/* Badges */}
          {user?.badges && user.badges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-5"
            >
              <h3 className="font-semibold text-white mb-3">🏅 Your Badges</h3>
              <div className="flex flex-wrap gap-2">
                {user.badges.map((ub) => (
                  <div key={ub.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    <span className="text-lg">{ub.badge.icon}</span>
                    <span className="text-xs text-amber-300 font-medium">{ub.badge.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

