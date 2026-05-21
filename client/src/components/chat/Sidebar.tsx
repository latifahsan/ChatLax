'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { chatAPI, getErrorMessage } from '@/lib/api';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { Chat } from '@/types';
import { ChatListItem } from './ChatListItem';
import { NewChatModal } from './NewChatModal';
import { ProfileModal } from './ProfileModal';
import { Logo } from '@/components/ui/Logo';
import toast from 'react-hot-toast';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { chats, setChats, searchQuery, setSearchQuery } = useChatStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const loadChats = useCallback(async () => {
    try {
      const { data } = await chatAPI.getChats();
      setChats(data);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load chats'));
    } finally {
      setIsLoading(false);
    }
  }, [setChats]);

  useEffect(() => { loadChats(); }, [loadChats]);

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (chat.isGroup) return chat.name?.toLowerCase().includes(q);
    const other = chat.participants.find(p => p._id !== user?._id);
    return other?.name?.toLowerCase().includes(q) || other?.email?.toLowerCase().includes(q);
  });

  const getChatName = (chat: Chat) => {
    if (chat.isGroup) return chat.name || 'Group';
    return chat.participants.find(p => p._id !== user?._id)?.name || 'Unknown';
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.isGroup) return chat.avatar;
    return chat.participants.find(p => p._id !== user?._id)?.avatar;
  };

  const isOnline = (chat: Chat) => {
    if (chat.isGroup) return false;
    return chat.participants.find(p => p._id !== user?._id)?.isOnline || false;
  };

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-40 md:hidden bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-2">
        <svg className="w-5 h-5 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setIsMobileOpen(false)} />
        )}
      </AnimatePresence>

      <motion.aside className={`w-[300px] flex-shrink-0 flex flex-col bg-[#111] border-r border-[#1a1a1a] md:relative md:translate-x-0 fixed inset-y-0 left-0 z-50 md:z-auto transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Header with Logo */}
        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          <Logo size={28} showText />

          <div className="flex items-center gap-1">
            <button onClick={() => setShowNewChat(true)}
              className="p-1.5 rounded-lg text-[#666] hover:text-[#e0e0e0] hover:bg-[#1e1e1e] transition-colors" title="New chat">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg text-[#666] hover:text-[#e0e0e0] hover:bg-[#1e1e1e] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h.01M12 12h.01M19 12h.01" />
                </svg>
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    className="absolute right-0 top-full mt-1 w-44 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-2xl z-50">
                    {[
                      { label: 'Profile & settings', onClick: () => { setShowProfile(true); setShowMenu(false); } },
                      { label: 'New group', onClick: () => { setShowNewChat(true); setShowMenu(false); } },
                      { label: 'Sign out', onClick: () => { setShowMenu(false); handleLogout(); }, danger: true },
                    ].map(item => (
                      <button key={item.label} onClick={item.onClick}
                        className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors ${item.danger ? 'text-red-400 hover:bg-red-500/10' : 'text-[#e0e0e0] hover:bg-[#222]'}`}>
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2">
            <svg className="w-3.5 h-3.5 text-[#555] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="flex-1 bg-transparent text-[13px] text-[#e0e0e0] placeholder:text-[#444] focus:outline-none" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[#555] hover:text-[#888]">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-1 px-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-3">
                  <div className="w-10 h-10 rounded-full bg-[#1a1a1a] animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-24 bg-[#1a1a1a] animate-pulse rounded" />
                    <div className="h-3 w-36 bg-[#1a1a1a] animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center px-6">
              <p className="text-[13px] text-[#444]">{searchQuery ? 'No conversations found' : 'No conversations yet'}</p>
              {!searchQuery && (
                <button onClick={() => setShowNewChat(true)} className="text-[12px] text-[#666] hover:text-[#888] mt-2 transition-colors">
                  Start a new chat →
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-0.5 px-2 pb-4">
              {filteredChats.map(chat => (
                <ChatListItem key={chat._id} chat={chat} isActive={pathname === `/chat/${chat._id}`}
                  chatName={getChatName(chat)} chatAvatar={getChatAvatar(chat)} isOnline={isOnline(chat)}
                  currentUserId={user?._id || ''}
                  onClick={() => { router.push(`/chat/${chat._id}`); setIsMobileOpen(false); }} />
              ))}
            </div>
          )}
        </div>

        {/* User footer */}
        <div className="border-t border-[#1a1a1a] p-3">
          <button onClick={() => setShowProfile(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#1a1a1a] transition-colors">
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#333] to-[#222] flex items-center justify-center overflow-hidden">
                {user?.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  : <span className="text-[12px] font-medium text-[#888]">{user?.name?.[0]?.toUpperCase()}</span>}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#111]" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-[13px] font-medium text-[#e0e0e0] truncate">{user?.name}</div>
              <div className="text-[11px] text-[#555] truncate">{user?.status || 'Online'}</div>
            </div>
            <svg className="w-3.5 h-3.5 text-[#444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </motion.aside>

      {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} />}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
}
