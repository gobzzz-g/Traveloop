'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Plane, Mail, ArrowLeft } from 'lucide-react';
import { authService } from '@/services/authService';

const schema = z.object({ email: z.string().email('Invalid email') });
type Form = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center">
            <Plane className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-display font-bold gradient-text">Traveloop</span>
        </Link>

        <div className="glass-card p-8">
          {!sent ? (
            <>
              <h1 className="text-2xl font-display font-bold text-white mb-2">Reset Password</h1>
              <p className="text-surface-400 mb-6">Enter your email and we&apos;ll send a reset link.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                    <input {...register('email')} type="email" placeholder="your@email.com" className="input-field pl-10" />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <button type="submit" disabled={isLoading} className="w-full py-3 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">📧</div>
              <h2 className="text-xl font-semibold text-white mb-2">Check your inbox!</h2>
              <p className="text-surface-400 text-sm">If that email exists, a reset link has been sent.</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-brand-400 hover:text-brand-300 text-sm flex items-center justify-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
