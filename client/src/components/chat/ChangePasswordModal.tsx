'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

interface ChangePasswordModalProps {
  onClose: () => void;
}

interface FieldState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ShowState {
  currentPassword: boolean;
  newPassword: boolean;
  confirmPassword: boolean;
}

export function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const [fields, setFields] = useState<FieldState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [show, setShow] = useState<ShowState>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof FieldState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields(prev => ({ ...prev, [key]: e.target.value }));
    setError('');
  };

  const toggleShow = (key: keyof ShowState) => () =>
    setShow(prev => ({ ...prev, [key]: !prev[key] }));

  const validate = (): string | null => {
    if (!fields.currentPassword || !fields.newPassword || !fields.confirmPassword)
      return 'All fields are required';
    if (fields.newPassword.length < 6)
      return 'New password must be at least 6 characters';
    if (fields.newPassword !== fields.confirmPassword)
      return 'New passwords do not match';
    if (fields.currentPassword === fields.newPassword)
      return 'New password must be different from current password';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    try {
      setIsLoading(true);
      await authAPI.changePassword(fields);
      toast.success('Password changed successfully');
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to change password'));
    } finally {
      setIsLoading(false);
    }
  };

  const strength = (() => {
    const p = fields.newPassword;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][strength];
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#4ade80'][strength];

  const EyeIcon = ({ visible }: { visible: boolean }) => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {visible ? (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </>
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </>
      )}
    </svg>
  );

  const fields_config = [
    { key: 'currentPassword' as const, label: 'Current password', placeholder: 'Enter current password' },
    { key: 'newPassword' as const, label: 'New password', placeholder: 'Min. 6 characters' },
    { key: 'confirmPassword' as const, label: 'Confirm new password', placeholder: 'Repeat new password' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          className="bg-[#111] border border-[#1f1f1f] rounded-2xl w-full max-w-sm shadow-2xl"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
            <h2 className="text-[15px] font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>
              Change Password
            </h2>
            <button onClick={onClose} className="text-[#555] hover:text-[#888] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {fields_config.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-[12px] text-[#666] mb-1.5">{label}</label>
                <div className="relative">
                  <input
                    type={show[key] ? 'text' : 'password'}
                    value={fields[key]}
                    onChange={set(key)}
                    placeholder={placeholder}
                    autoComplete={key === 'currentPassword' ? 'current-password' : 'new-password'}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3.5 py-2.5 pr-10 text-[14px] text-[#e0e0e0] placeholder:text-[#444] focus:outline-none focus:border-[#3a3a3a] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={toggleShow(key)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888] transition-colors"
                  >
                    <EyeIcon visible={show[key]} />
                  </button>
                </div>
                {/* Password strength bar for new password */}
                {key === 'newPassword' && fields.newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{ background: i <= strength ? strengthColor : '#2a2a2a' }}
                        />
                      ))}
                    </div>
                    <p className="text-[11px]" style={{ color: strengthColor }}>{strengthLabel}</p>
                  </div>
                )}
              </div>
            ))}

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5"
                >
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-[13px] text-red-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-[14px] text-[#666] hover:text-[#888] hover:bg-[#1a1a1a] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-[#e0e0e0] text-[#0a0a0a] py-2.5 rounded-xl font-semibold text-[14px] hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin" />
                    Changing...
                  </>
                ) : (
                  'Change password'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
