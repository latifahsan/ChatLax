'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { chatAPI } from '@/lib/api';
import { useChatStore } from '@/stores/chatStore';
import { User } from '@/types';
import toast from 'react-hot-toast';

interface NewChatModalProps {
  onClose: () => void;
}

export function NewChatModal({ onClose }: NewChatModalProps) {
  const router = useRouter();
  const { addChat } = useChatStore();
  const [tab, setTab] = useState<'direct' | 'group'>('direct');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selected, setSelected] = useState<User[]>([]);
  const [groupName, setGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    try {
      setIsSearching(true);
      const { data } = await chatAPI.searchUsers(q);
      setResults(data);
    } catch {
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  const handleDirectChat = async (user: User) => {
    try {
      setIsCreating(true);
      const { data } = await chatAPI.getOrCreatePrivate(user._id);
      addChat(data);
      router.push(`/chat/${data._id}`);
      onClose();
    } catch {
      toast.error('Failed to open chat');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selected.length < 1) {
      toast.error('Group name and at least 1 member required');
      return;
    }
    try {
      setIsCreating(true);
      const { data } = await chatAPI.createGroup({
        name: groupName.trim(),
        participants: selected.map(u => u._id),
      });
      addChat(data);
      router.push(`/chat/${data._id}`);
      onClose();
    } catch {
      toast.error('Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  const toggleSelect = (user: User) => {
    setSelected(prev =>
      prev.find(u => u._id === user._id)
        ? prev.filter(u => u._id !== user._id)
        : [...prev, user]
    );
  };

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
          className="bg-[#111] border border-[#1f1f1f] rounded-2xl w-full max-w-md overflow-hidden shadow-elevated"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
            <h2 className="text-[15px] font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>
              New conversation
            </h2>
            <button onClick={onClose} className="text-[#555] hover:text-[#888] transition-colors">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#1a1a1a]">
            {(['direct', 'group'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-[13px] font-medium transition-colors ${
                  tab === t ? 'text-[#e0e0e0] border-b-2 border-[#e0e0e0]' : 'text-[#555] hover:text-[#888]'
                }`}
              >
                {t === 'direct' ? 'Direct message' : 'New group'}
              </button>
            ))}
          </div>

          <div className="p-5 space-y-4">
            {/* Group name (group tab only) */}
            {tab === 'group' && (
              <input
                type="text"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="Group name"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3.5 py-2.5 text-[14px] text-[#e0e0e0] placeholder:text-[#444] focus:outline-none focus:border-[#3a3a3a]"
              />
            )}

            {/* Search */}
            <div className="relative">
              <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5">
                <svg className="w-3.5 h-3.5 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="flex-1 bg-transparent text-[14px] text-[#e0e0e0] placeholder:text-[#444] focus:outline-none"
                  autoFocus
                />
                {isSearching && (
                  <div className="w-3 h-3 border-2 border-[#555] border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            </div>

            {/* Selected chips (group mode) */}
            {tab === 'group' && selected.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selected.map(u => (
                  <div key={u._id} className="flex items-center gap-1.5 bg-[#1e1e1e] border border-[#2a2a2a] rounded-full px-2.5 py-1">
                    <span className="text-[12px] text-[#e0e0e0]">{u.name}</span>
                    <button onClick={() => toggleSelect(u)} className="text-[#555] hover:text-[#888]">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Results */}
            <div className="max-h-56 overflow-y-auto space-y-0.5">
              {results.length === 0 && query.length > 0 && !isSearching && (
                <p className="text-[13px] text-[#444] text-center py-6">No users found</p>
              )}
              {results.length === 0 && query.length === 0 && (
                <p className="text-[13px] text-[#444] text-center py-6">Search for people to chat with</p>
              )}
              {results.map(user => {
                const isSelectedUser = selected.find(u => u._id === user._id);
                return (
                  <button
                    key={user._id}
                    onClick={() => tab === 'direct' ? handleDirectChat(user) : toggleSelect(user)}
                    disabled={isCreating}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                      isSelectedUser ? 'bg-[#1e1e1e] border border-[#2a2a2a]' : 'hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center overflow-hidden flex-shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[13px] text-[#888]">{user.name?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-[#e0e0e0]">{user.name}</div>
                      <div className="text-[11px] text-[#555] truncate">{user.email}</div>
                    </div>
                    {user.isOnline && (
                      <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                    )}
                    {tab === 'group' && isSelectedUser && (
                      <svg className="w-4 h-4 text-[#e0e0e0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Create group button */}
            {tab === 'group' && (
              <button
                onClick={handleCreateGroup}
                disabled={isCreating || !groupName.trim() || selected.length < 1}
                className="w-full bg-[#e0e0e0] text-[#0a0a0a] py-2.5 rounded-xl font-semibold text-[14px] hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : `Create group${selected.length > 0 ? ` (${selected.length + 1} members)` : ''}`}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
