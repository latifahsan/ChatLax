'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useSocket } from '@/hooks/useSocket';
import { Sidebar } from '@/components/chat/Sidebar';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, token, isLoading, refreshUser } = useAuthStore();

  useSocket();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      refreshUser();
    }
  }, []);

  // Fix #2: guard on token too — prevents redirect firing before rehydration settles
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !token) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, token, router]);

  // Fix #1: removed redundant connectSocket() effect — useSocket() handles this

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#e0e0e0] to-[#888] flex items-center justify-center animate-pulse">
            <span className="text-[#0a0a0a] text-sm font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>C</span>
          </div>
          <div className="text-[13px] text-[#555]">Loading Chatlax...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0a] flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
