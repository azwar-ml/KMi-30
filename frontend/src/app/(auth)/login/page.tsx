'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Lock, Mail, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/**
 * Login validation schema
 */
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

/**
 * Login Page - Dark themed, glassmorphic design
 */
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setServerError(null);
      await login(data.email, data.password);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : 'Login failed. Please try again.',
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-bloomberg flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background orbs */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 rounded-full bg-trust/10 blur-3xl"
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-bull/10 blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, -50, 0] }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Glassmorphic Container */}
        <div className="glass-card p-8 space-y-6 rounded-2xl border-2 border-white/10">
          {/* Header with Lock Icon */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-3 rounded-full bg-trust/20 border border-trust/30"
            >
              <Lock size={28} className="text-trust" />
            </motion.div>

            <h1 className="text-3xl font-bold text-slate-100">System Secured</h1>
            <p className="text-sm text-slate-400">
              KMI-30 Alpha v4.0 • Institutional Terminal
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Mail size={16} />
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="trader@institution.com"
                className={`
                  w-full glass-input
                  ${errors.email ? 'ring-2 ring-bear' : 'ring-0'}
                `}
              />
              {errors.email && (
                <p className="text-sm text-bear flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.email.message}
                </p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Lock size={16} />
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className={`
                  w-full glass-input
                  ${errors.password ? 'ring-2 ring-bear' : 'ring-0'}
                `}
              />
              {errors.password && (
                <p className="text-sm text-bear flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.password.message}
                </p>
              )}
            </motion.div>

            {/* Server Error */}
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-bear/10 border border-bear/30 text-bear text-sm flex items-center gap-2"
              >
                <AlertCircle size={16} />
                {serverError}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300
                flex items-center justify-center gap-2
                ${
                  isSubmitting
                    ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-trust via-bull to-trust hover:shadow-glow-trust text-white'
                }
              `}
            >
              {isSubmitting && <Loader size={18} className="animate-spin" />}
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-slate-900/50 text-slate-400">New to KMI-30?</span>
            </div>
          </div>

          {/* Register Link */}
          <motion.button
            type="button"
            onClick={() => router.push('/register')}
            whileHover={{ scale: 1.02 }}
            className="w-full py-2 px-4 rounded-lg border-2 border-white/20 text-slate-200 hover:bg-slate-800/30 font-semibold transition-colors"
          >
            Create Account
          </motion.button>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xs text-slate-500 text-center leading-relaxed"
          >
            This system is password-protected. Unauthorized access is prohibited. All activity is logged and monitored.
          </motion.p>
        </div>

        {/* Status Indicator */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center justify-center gap-2 mt-6 text-sm text-slate-400"
        >
          <div className="w-2 h-2 rounded-full bg-bull animate-pulse" />
          System Online
        </motion.div>
      </motion.div>
    </div>
  );
}
