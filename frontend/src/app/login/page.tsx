'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Plane, Mail, Lock, ArrowRight, Globe } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      // Mock login to bypass backend for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockUser = { id: 'user_123', name: 'Demo User', email: data.email, role: 'USER' };
      setTokens('mock_access_token_123');
      setUser(mockUser as any);
      toast.success(`Welcome back, Demo User! ✈️`);
      router.push('/dashboard');
    } catch (err: unknown) {
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      // Mock demo login
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockUser = { id: 'demo_123', name: 'Demo Explorer', email: 'demo@traveloop.com', role: 'USER' };
      setTokens('mock_demo_token_123');
      setUser(mockUser as any);
      toast.success('Logged in as Demo User! ✈️');
      router.push('/dashboard');
    } catch {
      toast.error('Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 flex">
      {/* Left - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-brand-900/50 to-violet-900/30 items-center justify-center relative overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center z-10 px-12"
        >
          <div className="text-8xl mb-6 animate-float">🌍</div>
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            Welcome Back, Explorer!
          </h2>
          <p className="text-surface-400 text-lg leading-relaxed">
            Your trips, itineraries, and travel memories are waiting for you.
          </p>
          <div className="mt-8 glass rounded-2xl p-5 text-left">
            <p className="text-surface-400 text-sm mb-2">Demo Credentials:</p>
            <p className="text-surface-200 text-sm">📧 demo@traveloop.com</p>
            <p className="text-surface-200 text-sm">🔑 Demo@123</p>
          </div>
        </motion.div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <Link href="/" className="flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-display font-bold gradient-text">Traveloop</span>
          </Link>

          <h1 className="text-3xl font-display font-bold text-white mb-2">Sign in</h1>
          <p className="text-surface-400 mb-8">Good to see you again. Let&apos;s plan your next trip.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm text-surface-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input {...register('email')} type="email" placeholder="your@email.com" className="input-field pl-10" />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-surface-300">Password</label>
                <Link href="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Your password" className="input-field pl-10 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center gap-2">
              <input {...register('rememberMe')} type="checkbox" id="rememberMe" className="w-4 h-4 rounded border-surface-600 bg-surface-800 accent-brand-500" />
              <label htmlFor="rememberMe" className="text-sm text-surface-400">Remember me</label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-violet-500 text-white font-semibold hover:from-brand-600 hover:to-violet-600 transition-all btn-glow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <> Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-700" /></div>
            <div className="relative flex justify-center"><span className="px-3 bg-surface-900 text-surface-500 text-sm">or</span></div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => toast('Google Sign-In requires GOOGLE_CLIENT_ID setup', { icon: 'ℹ️' })}
              className="w-full py-3 rounded-xl glass border border-surface-600 text-surface-300 font-medium hover:border-brand-500/50 transition-all flex items-center justify-center gap-2"
            >
              <Globe className="w-5 h-5" /> Continue with Google
            </button>
            <button
              onClick={handleDemoLogin}
              className="w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium hover:bg-emerald-500/20 transition-all"
            >
              🎯 Try Demo Account
            </button>
          </div>

          <p className="text-center text-surface-500 text-sm mt-6">
            New to Traveloop?{' '}
            <Link href="/signup" className="text-brand-400 hover:text-brand-300 font-medium">Create account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
