'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import {
  Plane, Map, Brain, DollarSign, Package, Users,
  Star, ChevronRight, Globe, Zap, Shield, ArrowRight
} from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI Itinerary Generator', description: 'Get personalized day-by-day itineraries powered by Google Gemini AI based on your budget, style, and interests.', color: 'text-brand-400', bg: 'bg-brand-500/10' },
  { icon: Map, title: 'Interactive Builder', description: 'Drag and drop activities, reorder destinations, and visualize your route on an interactive map.', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: DollarSign, title: 'Smart Budget Tracking', description: 'Auto-calculate costs, split by category, get AI budget estimates, and never overspend again.', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: Package, title: 'Smart Packing Lists', description: 'AI generates personalized packing lists based on destination, weather, and trip duration.', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { icon: Users, title: 'Collaborative Planning', description: 'Share trips with friends, plan together in real-time, and create group itineraries effortlessly.', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { icon: Globe, title: 'Discover Cities', description: 'Explore 500K+ cities worldwide with AI insights, weather, best seasons, and local tips.', color: 'text-amber-400', bg: 'bg-amber-500/10' },
];

const stats = [
  { value: '50K+', label: 'Trips Planned' },
  { value: '120+', label: 'Countries' },
  { value: '98%', label: 'Happy Travelers' },
  { value: '4.9★', label: 'App Rating' },
];

const testimonials = [
  { name: 'Sarah M.', location: 'New York', text: 'Traveloop planned my entire Europe trip in minutes. The AI suggestions were spot-on!', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah' },
  { name: 'James K.', location: 'London', text: 'The budget tracker saved me hundreds. I always knew exactly where my money was going.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james' },
  { name: 'Priya S.', location: 'Mumbai', text: 'Planning solo trips used to be stressful. Traveloop makes it fun and easy!', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya' },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-surface-900 overflow-hidden">
      {/* ─── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center">
                <Plane className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-display font-bold gradient-text">Traveloop</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-surface-400 hover:text-white transition-colors text-sm">Features</a>
              <a href="#how-it-works" className="text-surface-400 hover:text-white transition-colors text-sm">How It Works</a>
              <a href="#testimonials" className="text-surface-400 hover:text-white transition-colors text-sm">Reviews</a>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-all btn-glow flex items-center gap-2"
                >
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-surface-300 hover:text-white text-sm transition-colors">
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-all btn-glow"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-20 px-4 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-brand-500/30 text-sm text-brand-300 mb-8">
              <Zap className="w-4 h-4" />
              Powered by Google Gemini AI
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
              Plan Trips Like a{' '}
              <span className="gradient-text">Travel Expert</span>
            </h1>

            <p className="text-xl text-surface-400 mb-10 max-w-3xl mx-auto leading-relaxed">
              Traveloop uses AI to build perfect itineraries, estimate budgets, generate packing lists,
              and discover hidden gems — all in seconds. Travel smarter, not harder.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-violet-500 text-white font-semibold text-lg hover:from-brand-600 hover:to-violet-600 transition-all btn-glow flex items-center gap-2 group"
              >
                Start Planning Free
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/share/european-adventure-demo"
                className="px-8 py-4 rounded-2xl glass border border-surface-700 text-surface-200 font-semibold text-lg hover:border-brand-500/50 transition-all flex items-center gap-2"
              >
                <Globe className="w-5 h-5" />
                See a Sample Trip
              </Link>
            </div>
          </motion.div>

          {/* Hero Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="glass-card p-6 max-w-4xl mx-auto shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-surface-500 text-xs ml-2">European Adventure · 14 Days · $5,000</span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {['Paris 🗼', 'Rome 🏛️', 'Barcelona 🌊'].map((city, i) => (
                  <motion.div
                    key={city}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="glass-light rounded-xl p-4 text-left"
                  >
                    <div className="text-lg mb-1">{city.split(' ')[1]}</div>
                    <div className="font-semibold text-sm text-surface-200">{city.split(' ')[0]}</div>
                    <div className="text-xs text-surface-500 mt-1">4 days · 8 activities</div>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-surface-400">
                  <span className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-emerald-400" /> $4,800 planned</span>
                  <span className="flex items-center gap-1"><Package className="w-4 h-4 text-violet-400" /> 24 items packed</span>
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-400" /> AI optimized</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                  ✅ Ready to go!
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Stats ───────────────────────────────────────────────────────────── */}
      <section className="py-16 border-y border-surface-800">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl font-display font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-surface-500 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">
              Everything You Need to <span className="gradient-text">Travel Smart</span>
            </h2>
            <p className="text-surface-400 text-lg max-w-2xl mx-auto">
              From AI itinerary generation to real-time budget tracking — Traveloop has every feature modern travelers need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6 card-hover"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-surface-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-900/10 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">
              Plan in <span className="gradient-text">3 Simple Steps</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Tell AI Your Dream Trip', desc: 'Enter your destination, dates, budget, and travel style. Our AI does the heavy planning.', icon: Brain },
              { step: '02', title: 'Customize & Refine', desc: 'Drag and drop activities, edit your budget, add personal notes, and make it yours.', icon: Map },
              { step: '03', title: 'Share & Go!', desc: 'Share your perfect itinerary with friends, download it, or take it offline.', icon: Globe },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative inline-flex mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
                    <item.icon className="w-8 h-8 text-brand-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-surface-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ────────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">
              Loved by <span className="gradient-text">Travelers Worldwide</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-surface-300 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full bg-surface-700" />
                  <div>
                    <div className="font-medium text-sm">{t.name}</div>
                    <div className="text-surface-500 text-xs">{t.location}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-6">
                <Plane className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-display font-bold mb-4">
                Ready to Plan Your Next Adventure?
              </h2>
              <p className="text-surface-400 mb-8 text-lg">
                Join 50,000+ travelers using Traveloop to plan smarter trips.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-violet-500 text-white font-semibold text-lg hover:from-brand-600 hover:to-violet-600 transition-all btn-glow group"
              >
                Start Free Today
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-surface-600 text-sm mt-4 flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" /> No credit card required
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-surface-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center">
                <Plane className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold gradient-text">Traveloop</span>
            </div>
            <p className="text-surface-600 text-sm">© 2026 Traveloop. Built with ❤️ for travelers.</p>
            <div className="flex gap-6 text-surface-500 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
