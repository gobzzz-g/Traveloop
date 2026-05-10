'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Heart, Eye, Share2, MapPin, Calendar, DollarSign, Users } from 'lucide-react';
import { shareService } from '@/services/index';
import { formatDate, formatCurrency, getTripDuration, getTravelStyleEmoji } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Destination, Activity } from '@/types';

export default function SharedTripPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['shared-trip', slug],
    queryFn: () => shareService.getSharedTrip(slug),
    enabled: !!slug,
  });

  const likeMutation = useMutation({
    mutationFn: () => shareService.likeTrip(slug),
    onSuccess: () => toast.success('❤️ Liked!'),
  });

  const sharedData = data?.data;
  const trip = sharedData?.trip;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center text-center px-4">
        <div>
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-display font-bold text-white mb-2">Trip Not Found</h1>
          <p className="text-surface-400">This trip may be private or the link has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-900">
      {/* Hero */}
      <div className="relative h-72 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={trip.coverImage || `https://picsum.photos/seed/${trip.id}/1200/600`}
          alt={trip.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/50 to-transparent" />

        {/* Navbar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center">
              <span className="text-white text-sm">✈</span>
            </div>
            <span className="font-display font-bold gradient-text text-lg">Traveloop</span>
          </div>
          <div className="flex items-center gap-3 text-surface-300 text-sm">
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {sharedData.views}</span>
            <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {sharedData.likes}</span>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">{trip.title}</h1>
          <div className="flex flex-wrap gap-4 text-surface-300 text-sm">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(trip.startDate)} – {formatDate(trip.endDate)}</span>
            <span className="flex items-center gap-1"><span>{getTravelStyleEmoji(trip.travelStyle)}</span> {trip.travelStyle}</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {trip.travelersCount} travelers</span>
            <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {formatCurrency(trip.budget, trip.currency)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Actions */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-surface-400 text-sm">
            <span>{getTripDuration(trip.startDate, trip.endDate)} days</span>
            <span>·</span>
            <span>{trip.destinations.length} destinations</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-sm transition-all"
            >
              <Heart className="w-4 h-4" /> Like
            </button>
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-surface-700 text-surface-300 hover:border-brand-500/50 text-sm transition-all"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>

        {trip.description && (
          <div className="glass-card p-5 mb-6">
            <p className="text-surface-300 leading-relaxed">{trip.description}</p>
          </div>
        )}

        {/* Destinations & Activities */}
        <div className="space-y-6">
          {trip.destinations.map((dest: Destination, i: number) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass-card overflow-hidden"
            >
              <div className="relative h-48 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={dest.imageUrl || `https://picsum.photos/seed/${dest.city}/800/400`}
                  alt={dest.city}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-900/80 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h2 className="text-2xl font-display font-bold text-white">{dest.city}, {dest.country}</h2>
                  <p className="text-surface-300 text-sm">
                    {formatDate(dest.arrivalDate, 'MMM d')} – {formatDate(dest.departureDate, 'MMM d')}
                  </p>
                </div>
              </div>

              {dest.activities.length > 0 && (
                <div className="p-4">
                  <h3 className="font-medium text-surface-300 text-sm mb-3 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {dest.activities.length} Activities
                  </h3>
                  <div className="space-y-2">
                    {dest.activities.map((activity: Activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-800/50">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🎡</span>
                          <div>
                            <p className="text-sm font-medium text-white">{activity.title}</p>
                            <p className="text-xs text-surface-500">{activity.category} · {activity.duration}min</p>
                          </div>
                        </div>
                        <span className="text-sm text-surface-400">{formatCurrency(activity.cost, activity.currency)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center glass-card p-8">
          <div className="text-4xl mb-4">✈️</div>
          <h3 className="text-xl font-display font-bold text-white mb-2">Plan Your Own Trip!</h3>
          <p className="text-surface-400 mb-5">Create AI-powered itineraries like this one for free.</p>
          <a
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-brand-500 to-violet-500 text-white font-semibold hover:from-brand-600 hover:to-violet-600 transition-all btn-glow"
          >
            Get Started Free
          </a>
        </div>
      </div>
    </div>
  );
}
