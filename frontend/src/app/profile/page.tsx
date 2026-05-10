'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { profileService } from '@/services/index';
import { User, Camera, Lock, BadgeCheck, TrendingUp } from 'lucide-react';
import DashboardLayout from '../dashboard/layout';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', language: user?.language || 'en', timezone: user?.timezone || 'UTC' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [avatarUrl, setAvatarUrl] = useState('');

  const updateMutation = useMutation({
    mutationFn: () => profileService.updateProfile(profileForm),
    onSuccess: (res) => {
      updateUser(res.data);
      setIsEditingProfile(false);
      toast.success('Profile updated!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => toast.error('Update failed'),
  });

  const passwordMutation = useMutation({
    mutationFn: () => {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      return profileService.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
    },
    onSuccess: () => {
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed!');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to change password'),
  });

  const avatarMutation = useMutation({
    mutationFn: () => profileService.updateAvatar(avatarUrl),
    onSuccess: (res) => {
      updateUser({ avatar: res.data.avatar });
      setAvatarUrl('');
      toast.success('Avatar updated!');
    },
  });

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-white mb-8">Your Profile</h1>

          {/* Avatar & Basic Info */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-2xl" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-brand flex items-center justify-center text-3xl font-bold text-white">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <button className="absolute -bottom-2 -right-2 p-1.5 rounded-lg bg-surface-700 text-surface-300 hover:text-white border border-surface-600">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-semibold text-white">{user.name}</h2>
                  {user.isEmailVerified && <BadgeCheck className="w-5 h-5 text-brand-400" />}
                  {user.role === 'ADMIN' && <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20">Admin</span>}
                </div>
                <p className="text-surface-400 text-sm">{user.email}</p>
                <div className="flex gap-4 mt-3">
                  <div className="text-center">
                    <div className="font-bold text-white">{user.tripsCount}</div>
                    <div className="text-xs text-surface-500">Trips</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-white">{user.countriesCount}</div>
                    <div className="text-xs text-surface-500">Countries</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-brand-400">{user.travelScore}</div>
                    <div className="text-xs text-surface-500">Score</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => { setIsEditingProfile(!isEditingProfile); setProfileForm({ name: user.name, language: user.language, timezone: user.timezone }); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-surface-700 text-surface-300 hover:border-brand-500/50 text-sm transition-all"
              >
                <User className="w-4 h-4" /> Edit
              </button>
            </div>

            {/* Avatar URL Update */}
            <div className="mt-5 pt-5 border-t border-surface-800">
              <label className="block text-sm text-surface-400 mb-2">Update Avatar URL</label>
              <div className="flex gap-2">
                <input
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  placeholder="https://... or use DiceBear avatars"
                  className="input-field flex-1 text-sm"
                />
                <button
                  onClick={() => avatarUrl && avatarMutation.mutate()}
                  disabled={!avatarUrl || avatarMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-brand-500 text-white text-sm disabled:opacity-50"
                >
                  Set
                </button>
              </div>
              <p className="text-surface-600 text-xs mt-1">
                Try: https://api.dicebear.com/7.x/avataaars/svg?seed=yourname
              </p>
            </div>
          </div>

          {/* Edit Profile Form */}
          {isEditingProfile && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
              <h3 className="font-semibold text-white mb-4">Edit Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-surface-300 mb-1.5">Full Name</label>
                  <input value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-surface-300 mb-1.5">Language</label>
                    <select value={profileForm.language} onChange={e => setProfileForm(p => ({ ...p, language: e.target.value }))} className="input-field">
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="ja">日本語</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-surface-300 mb-1.5">Timezone</label>
                    <select value={profileForm.timezone} onChange={e => setProfileForm(p => ({ ...p, timezone: e.target.value }))} className="input-field">
                      {['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Singapore', 'Australia/Sydney'].map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setIsEditingProfile(false)} className="px-4 py-2 text-surface-400 hover:text-white text-sm">Cancel</button>
                  <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending} className="px-6 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium disabled:opacity-50">
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Change Password */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2"><Lock className="w-4 h-4 text-surface-400" /> Security</h3>
              <button onClick={() => setIsChangingPassword(!isChangingPassword)} className="text-brand-400 hover:text-brand-300 text-sm">
                {isChangingPassword ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {isChangingPassword && (
              <div className="space-y-4">
                <input type="password" placeholder="Current Password" value={passwordForm.currentPassword} onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))} className="input-field" />
                <input type="password" placeholder="New Password (min 8 chars)" value={passwordForm.newPassword} onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} className="input-field" />
                <input type="password" placeholder="Confirm New Password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))} className="input-field" />
                <button onClick={() => passwordMutation.mutate()} disabled={passwordMutation.isPending} className="w-full py-2.5 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-600 transition-all disabled:opacity-50">
                  {passwordMutation.isPending ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            )}
          </div>

          {/* Badges */}
          {user.badges && user.badges.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-amber-400" /> Achievements</h3>
              <div className="grid grid-cols-2 gap-3">
                {user.badges.map(ub => (
                  <div key={ub.id} className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <span className="text-2xl">{ub.badge.icon}</span>
                    <div>
                      <div className="font-medium text-amber-300 text-sm">{ub.badge.name}</div>
                      <div className="text-surface-500 text-xs">{ub.badge.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
