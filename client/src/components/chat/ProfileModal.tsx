'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { userAPI, uploadAPI, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { ChangePasswordModal } from './ChangePasswordModal';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface ProfileModalProps { onClose: () => void; }

export function ProfileModal({ onClose }: ProfileModalProps) {
  const router = useRouter();
  const { user, updateUser, logout } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [status, setStatus] = useState(user?.status || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name cannot be empty'); return; }
    try {
      setIsSaving(true);
      const { data } = await userAPI.updateProfile({ name: name.trim(), status: status.trim() });
      updateUser(data);
      toast.success('Profile updated');
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update profile'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image'); return; }
    try {
      setIsUploadingAvatar(true);
      const { data: uploadData } = await uploadAPI.upload(file);
      const { data } = await userAPI.updateProfile({ avatar: uploadData.url });
      updateUser(data);
      toast.success('Avatar updated');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to upload avatar'));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
    router.push('/login');
  };

  if (showChangePassword) {
    return <ChangePasswordModal onClose={() => setShowChangePassword(false)} />;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          className="bg-[#111] border border-[#1f1f1f] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
            <h2 className="text-[15px] font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>Profile</h2>
            <button onClick={onClose} className="text-[#555] hover:text-[#888] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <label className="relative cursor-pointer group">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center overflow-hidden border-2 border-[#2a2a2a] group-hover:border-[#444] transition-colors">
                  {isUploadingAvatar ? (
                    <div className="w-6 h-6 border-2 border-[#888] border-t-transparent rounded-full animate-spin" />
                  ) : user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-medium text-[#888]">{user?.name?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
              <p className="text-[11px] text-[#555]">Click to change avatar</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-[12px] text-[#666] mb-1.5">Display name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} maxLength={50}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3.5 py-2.5 text-[14px] text-[#e0e0e0] placeholder:text-[#444] focus:outline-none focus:border-[#3a3a3a] transition-colors" />
            </div>

            {/* Status */}
            <div>
              <label className="block text-[12px] text-[#666] mb-1.5">Status</label>
              <input type="text" value={status} onChange={e => setStatus(e.target.value)} maxLength={150}
                placeholder="What's on your mind?"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3.5 py-2.5 text-[14px] text-[#e0e0e0] placeholder:text-[#444] focus:outline-none focus:border-[#3a3a3a] transition-colors" />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-[12px] text-[#666] mb-1.5">Email</label>
              <div className="bg-[#161616] border border-[#1f1f1f] rounded-xl px-3.5 py-2.5 text-[14px] text-[#555]">
                {user?.email}
              </div>
            </div>

            <button onClick={handleSave} disabled={isSaving}
              className="w-full bg-[#e0e0e0] text-[#0a0a0a] py-2.5 rounded-xl font-semibold text-[14px] hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isSaving ? <><div className="w-3.5 h-3.5 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin" />Saving...</> : 'Save changes'}
            </button>

            {/* Change password — only for non-Google accounts */}
            {!user?.googleId && (
              <button onClick={() => setShowChangePassword(true)}
                className="w-full py-2.5 rounded-xl text-[14px] text-[#666] hover:text-[#888] hover:bg-[#1a1a1a] transition-colors border border-[#1f1f1f]">
                Change password
              </button>
            )}

            <button onClick={handleLogout}
              className="w-full py-2.5 rounded-xl text-[14px] text-red-400 hover:bg-red-500/10 transition-colors">
              Sign out
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
