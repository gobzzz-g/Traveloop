'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Plus, Search, Grid3X3, List, Trash2, Copy, Archive,
  Calendar, Map, DollarSign, ChevronDown
} from 'lucide-react';
import { tripService } from '@/services/tripService';
import { Trip } from '@/types';
import { formatDate, formatCurrency, getTripDuration, getTravelStyleEmoji, getStatusColor, cn } from '@/lib/utils';
import DashboardLayout from '../dashboard/layout';

export default function TripsPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['trips', { search, filterStatus }],
    queryFn: () => tripService.getTrips({ search, status: filterStatus as Trip['status'] || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tripService.deleteTrip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip deleted');
    },
    onError: () => toast.error('Failed to delete trip'),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => tripService.duplicateTrip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip duplicated!');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => tripService.updateTrip(id, { isArchived: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip archived');
    },
  });

  const trips: Trip[] = data?.data || [];

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">My Trips</h1>
            <p className="text-surface-400 mt-1">{trips.length} trip{trips.length !== 1 ? 's' : ''} planned</p>
          </div>
          <Link
            href="/trips/create"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-600 transition-all btn-glow"
          >
            <Plus className="w-4 h-4" /> New Trip
          </Link>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input
              type="text"
              placeholder="Search trips..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field pr-8 appearance-none cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="PLANNING">Planning</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none" />
            </div>

            <div className="flex glass rounded-xl p-1 border border-surface-700">
              <button onClick={() => setView('grid')} className={cn('p-2 rounded-lg transition-colors', view === 'grid' ? 'bg-brand-500 text-white' : 'text-surface-400 hover:text-white')}>
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button onClick={() => setView('list')} className={cn('p-2 rounded-lg transition-colors', view === 'list' ? 'bg-brand-500 text-white' : 'text-surface-400 hover:text-white')}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Trips Grid/List */}
        {isLoading ? (
          <div className={cn('gap-4', view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col')}>
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {search ? 'No trips match your search' : 'No trips yet!'}
            </h3>
            <p className="text-surface-400 mb-6">
              {search ? 'Try a different search term.' : 'Start planning your first adventure.'}
            </p>
            {!search && (
              <Link href="/trips/create" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-600 transition-all">
                <Plus className="w-4 h-4" /> Create First Trip
              </Link>
            )}
          </div>
        ) : (
          <div className={cn(view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'flex flex-col gap-4')}>
            {trips.map((trip, i) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card overflow-hidden card-hover group"
              >
                {/* Cover Image */}
                <div className="relative h-36 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={trip.coverImage || `https://picsum.photos/seed/${trip.id}/600/300`}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-900/80 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className={cn('badge border text-xs', getStatusColor(trip.status))}>
                      {trip.status}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => { e.preventDefault(); duplicateMutation.mutate(trip.id); }}
                      className="p-1.5 rounded-lg bg-surface-900/80 text-surface-300 hover:text-white transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); archiveMutation.mutate(trip.id); }}
                      className="p-1.5 rounded-lg bg-surface-900/80 text-surface-300 hover:text-amber-400 transition-colors"
                      title="Archive"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); handleDelete(trip.id, trip.title); }}
                      className="p-1.5 rounded-lg bg-surface-900/80 text-surface-300 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <Link href={`/trips/${trip.id}`} className="block p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-lg">{getTravelStyleEmoji(trip.travelStyle)}</span>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-brand-300 transition-colors line-clamp-1">{trip.title}</h3>
                      {trip.description && <p className="text-surface-500 text-xs mt-0.5 line-clamp-1">{trip.description}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5 mt-3">
                    <div className="flex items-center gap-2 text-xs text-surface-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(trip.startDate, 'MMM d')} – {formatDate(trip.endDate, 'MMM d, yyyy')}</span>
                      <span className="text-surface-600">·</span>
                      <span>{getTripDuration(trip.startDate, trip.endDate)} days</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-surface-400">
                      <Map className="w-3.5 h-3.5" />
                      <span>{trip.destinations?.length ?? 0} destinations</span>
                      {trip.destinations && trip.destinations[0] && (
                        <span className="text-surface-500">({trip.destinations[0].city}{trip.destinations.length > 1 ? ` +${trip.destinations.length - 1}` : ''})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-surface-400">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{formatCurrency(trip.budget, trip.currency)} budget</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
