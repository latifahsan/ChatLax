'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { authAPI, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Logo } from '@/components/ui/Logo';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) { setError('All fields are required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    try {
      setIsLoading(true);
      setError('');
      const { data } = await authAPI.register({ name: name.trim(), email: email.trim(), password });
      login(data.token, data.user);
      toast.success('Account created! Welcome to ChatLax 🎉');
      router.push('/chat');
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#4ade80'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5"><Logo size={40} showText={false} /></div>
          <h1 className="text-[22px] font-bold text-[#e0e0e0] mb-1.5" style={{ fontFamily: 'Syne, sans-serif' }}>
            Create your account
          </h1>
          <p className="text-[13px] text-[#555]">Join ChatLax — it's free</p>
        </div>

        <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6 space-y-4">
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5">
              <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[13px] text-red-400">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] text-[#666] mb-1.5">Full name</label>
              <input type="text" value={name} onChange={e => { setName(e.target.value); setError(''); }}
                placeholder="Your name" autoComplete="name" autoFocus maxLength={50}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3.5 py-2.5 text-[14px] text-[#e0e0e0] placeholder:text-[#444] focus:outline-none focus:border-[#3a3a3a] transition-colors" />
            </div>

            <div>
              <label className="block text-[12px] text-[#666] mb-1.5">Email address</label>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com" autoComplete="email"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3.5 py-2.5 text-[14px] text-[#e0e0e0] placeholder:text-[#444] focus:outline-none focus:border-[#3a3a3a] transition-colors" />
            </div>

            <div>
              <label className="block text-[12px] text-[#666] mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Min. 6 characters" autoComplete="new-password"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3.5 py-2.5 pr-10 text-[14px] text-[#e0e0e0] placeholder:text-[#444] focus:outline-none focus:border-[#3a3a3a] transition-colors" />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword
                      ? <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />}
                  </svg>
                </button>
              </div>
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= strength ? strengthColors[strength] : '#2a2a2a' }} />
                    ))}
                  </div>
                  <p className="text-[11px]" style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</p>
                </div>
              )}
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full bg-[#e0e0e0] text-[#0a0a0a] py-2.5 rounded-xl font-semibold text-[14px] hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1">
              {isLoading ? <><div className="w-3.5 h-3.5 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin" />Creating account...</> : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] text-[#555] mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-[#888] hover:text-[#e0e0e0] transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
