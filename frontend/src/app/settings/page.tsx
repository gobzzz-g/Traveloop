'use client';

import { Settings, Bell, Globe, Lock, Palette, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '../dashboard/layout';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2 mb-8">
            <Settings className="w-7 h-7 text-surface-400" /> Settings
          </h1>

          {/* Notifications */}
          <div className="glass-card p-6 mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2 mb-4"><Bell className="w-4 h-4 text-brand-400" /> Notifications</h2>
            {[
              { label: 'Trip reminders', desc: 'Get notified before your trips' },
              { label: 'AI suggestions', desc: 'Receive personalized destination ideas' },
              { label: 'New features', desc: 'Stay updated on new Traveloop features' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-surface-800 last:border-0">
                <div>
                  <div className="text-sm font-medium text-surface-200">{item.label}</div>
                  <div className="text-xs text-surface-500">{item.desc}</div>
                </div>
                <div className="w-10 h-5 rounded-full bg-brand-500 relative cursor-pointer">
                  <div className="absolute right-1 top-0.5 w-4 h-4 rounded-full bg-white" />
                </div>
              </div>
            ))}
          </div>

          {/* Display */}
          <div className="glass-card p-6 mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2 mb-4"><Palette className="w-4 h-4 text-violet-400" /> Appearance</h2>
            <div className="flex gap-3">
              {[
                { label: 'Dark (Default)', active: true, bg: 'bg-surface-800' },
                { label: 'Light', active: false, bg: 'bg-white' },
              ].map((theme) => (
                <button
                  key={theme.label}
                  onClick={() => toast('Theme switching coming soon!', { icon: '🎨' })}
                  className={`flex-1 p-4 rounded-xl border text-sm font-medium transition-all ${
                    theme.active ? 'border-brand-500 text-brand-300' : 'border-surface-700 text-surface-400 hover:border-surface-600'
                  }`}
                >
                  <div className={`w-full h-12 rounded-lg ${theme.bg} mb-2 border border-surface-600`} />
                  {theme.label}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy */}
          <div className="glass-card p-6 mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2 mb-4"><Globe className="w-4 h-4 text-cyan-400" /> Privacy</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-surface-300">Default trip visibility</span>
                <select className="input-field max-w-36 text-sm py-1.5">
                  <option>Private</option>
                  <option>Public</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-surface-300">Profile visibility</span>
                <select className="input-field max-w-36 text-sm py-1.5">
                  <option>Public</option>
                  <option>Private</option>
                </select>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-card p-6 border border-red-500/20">
            <h2 className="font-semibold text-red-400 flex items-center gap-2 mb-4"><Trash2 className="w-4 h-4" /> Danger Zone</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-surface-200">Delete Account</div>
                  <div className="text-xs text-surface-500">Permanently delete your account and all data</div>
                </div>
                <button
                  onClick={() => toast.error('Contact support to delete your account')}
                  className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/20 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
