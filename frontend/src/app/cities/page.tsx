'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Globe, MapPin, Clock } from 'lucide-react';
import { cityService, aiService } from '@/services/index';
import DashboardLayout from '../dashboard/layout';

interface City { city: string; country: string; countryCode?: string; population?: number }
interface Insights { overview?: string; bestTimeToVisit?: string; avgDailyBudget?: { budget: number; mid: number; luxury: number }; mustSeeAttractions?: { name: string; type: string }[] }

export default function CitiesPage() {
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const { data: citiesData, isLoading } = useQuery({
    queryKey: ['cities', search],
    queryFn: () => cityService.searchCities(search, 12),
    enabled: search.length >= 2,
  });

  const cities: City[] = citiesData?.data?.data || citiesData?.data || [];

  const handleCitySelect = async (city: City) => {
    setSelectedCity(city);
    setInsights(null);
    setLoadingInsights(true);
    try {
      const res = await aiService.getDestinationInsights(city.city, city.country);
      setInsights(res.data as Insights);
    } catch {
      setInsights(null);
    } finally {
      setLoadingInsights(false);
    }
  };

  const popularDestinations = [
    { city: 'Paris', country: 'France', emoji: '🗼' },
    { city: 'Tokyo', country: 'Japan', emoji: '🗾' },
    { city: 'Bali', country: 'Indonesia', emoji: '🌴' },
    { city: 'New York', country: 'United States', emoji: '🗽' },
    { city: 'Barcelona', country: 'Spain', emoji: '💃' },
    { city: 'Dubai', country: 'UAE', emoji: '🏙️' },
    { city: 'Rome', country: 'Italy', emoji: '🏛️' },
    { city: 'Sydney', country: 'Australia', emoji: '🦘' },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2 mb-2">
            <Globe className="w-7 h-7 text-cyan-400" /> Discover Cities
          </h1>
          <p className="text-surface-400">Explore destinations worldwide and get AI-powered travel insights.</p>
        </motion.div>

        {/* Search */}
        <div className="relative max-w-xl mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search any city in the world..."
            className="input-field pl-12 py-4 text-lg rounded-2xl"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* City List */}
          <div>
            {search.length < 2 ? (
              <>
                <h2 className="text-lg font-semibold text-white mb-4">✨ Popular Destinations</h2>
                <div className="grid grid-cols-2 gap-3">
                  {popularDestinations.map((dest, i) => (
                    <motion.button
                      key={dest.city}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleCitySelect(dest)}
                      className={`p-4 rounded-2xl text-left transition-all card-hover glass-card ${selectedCity?.city === dest.city ? 'border-brand-500 bg-brand-500/10' : ''}`}
                    >
                      <div className="text-3xl mb-2">{dest.emoji}</div>
                      <div className="font-semibold text-white">{dest.city}</div>
                      <div className="text-surface-500 text-xs">{dest.country}</div>
                    </motion.button>
                  ))}
                </div>
              </>
            ) : isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
              </div>
            ) : cities.length === 0 ? (
              <div className="text-center py-12 text-surface-500">No cities found for &ldquo;{search}&rdquo;</div>
            ) : (
              <>
                <h2 className="text-sm text-surface-500 mb-3">{cities.length} results for &ldquo;{search}&rdquo;</h2>
                <div className="space-y-2">
                  {cities.map((city, i) => (
                    <motion.button
                      key={`${city.city}-${city.country}-${i}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => handleCitySelect(city)}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all ${selectedCity?.city === city.city && selectedCity?.country === city.country ? 'glass-card border-brand-500' : 'glass border border-surface-700 hover:border-surface-600'}`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-lg">
                        {city.countryCode || '🌍'}
                      </div>
                      <div>
                        <div className="font-medium text-white">{city.city}</div>
                        <div className="text-xs text-surface-500">{city.country}</div>
                      </div>
                      <MapPin className="w-4 h-4 text-surface-600 ml-auto" />
                    </motion.button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* City Insights Panel */}
          <div>
            {!selectedCity ? (
              <div className="glass-card p-8 text-center sticky top-4">
                <Globe className="w-12 h-12 text-surface-600 mx-auto mb-3" />
                <h3 className="font-semibold text-surface-400">Select a city</h3>
                <p className="text-surface-600 text-sm mt-1">Get AI-powered insights about any destination</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card overflow-hidden sticky top-4">
                {/* City Image */}
                <div className="relative h-40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://picsum.photos/seed/${selectedCity.city}/600/300`}
                    alt={selectedCity.city}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-900/80 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h2 className="text-2xl font-display font-bold text-white">{selectedCity.city}</h2>
                    <p className="text-surface-300 text-sm">{selectedCity.country}</p>
                  </div>
                </div>

                <div className="p-5">
                  {loadingInsights ? (
                    <div className="space-y-3">
                      <div className="skeleton h-4 w-3/4 rounded" />
                      <div className="skeleton h-4 rounded" />
                      <div className="skeleton h-4 w-2/3 rounded" />
                    </div>
                  ) : insights ? (
                    <div className="space-y-4">
                      {insights.overview && (
                        <p className="text-surface-300 text-sm leading-relaxed">{insights.overview}</p>
                      )}

                      {insights.bestTimeToVisit && (
                        <div className="flex items-start gap-2">
                          <Clock className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-xs text-surface-500 mb-0.5">Best Time to Visit</div>
                            <div className="text-sm text-surface-200">{insights.bestTimeToVisit}</div>
                          </div>
                        </div>
                      )}

                      {insights.avgDailyBudget && (
                        <div>
                          <div className="text-xs text-surface-500 mb-2">Daily Budget (USD)</div>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { label: 'Budget', value: insights.avgDailyBudget.budget, color: 'text-emerald-400' },
                              { label: 'Mid', value: insights.avgDailyBudget.mid, color: 'text-brand-400' },
                              { label: 'Luxury', value: insights.avgDailyBudget.luxury, color: 'text-amber-400' },
                            ].map(b => (
                              <div key={b.label} className="text-center p-2 rounded-lg bg-surface-800">
                                <div className={`font-bold text-sm ${b.color}`}>${b.value}</div>
                                <div className="text-surface-500 text-xs">{b.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {insights.mustSeeAttractions && insights.mustSeeAttractions.length > 0 && (
                        <div>
                          <div className="text-xs text-surface-500 mb-2">Must-See Attractions</div>
                          <div className="space-y-1.5">
                            {insights.mustSeeAttractions.slice(0, 4).map((a) => (
                              <div key={a.name} className="flex items-center gap-2 text-sm">
                                <span>⭐</span>
                                <span className="text-surface-200">{a.name}</span>
                                <span className="text-surface-600 text-xs">· {a.type}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-surface-500 text-sm">AI insights require GEMINI_API_KEY to be configured.</p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
