'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chat } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { formatDistanceToNow } from 'date-fns';

interface ChatHeaderProps {
  chat: Chat;
}

export function ChatHeader({ chat }: ChatHeaderProps) {
  const { user } = useAuthStore();
  const { typingUsers } = useChatStore();
  const [showInfo, setShowInfo] = useState(false);

  const chatTyping = typingUsers.filter(t => t.chatId === chat._id);

  const getChatName = (): string => {
    if (chat.isGroup) return chat.name || 'Group';
    const other = chat.participants.find(p => p._id !== user?._id);
    return other?.name || 'Unknown';
  };

  const getChatAvatar = (): string | undefined => {
    if (chat.isGroup) return chat.avatar;
    const other = chat.participants.find(p => p._id !== user?._id);
    return other?.avatar;
  };

  const getChatStatus = (): string => {
    if (chat.isGroup) return `${chat.participants.length} members`;
    const other = chat.participants.find(p => p._id !== user?._id);
    if (other?.isOnline) return 'Online';
    if (other?.lastSeen) return `Last seen ${formatDistanceToNow(new Date(other.lastSeen), { addSuffix: true })}`;
    return 'Offline';
  };

  const isOtherOnline = (): boolean => {
    if (chat.isGroup) return false;
    const other = chat.participants.find(p => p._id !== user?._id);
    return other?.isOnline || false;
  };

  const name = getChatName();
  const avatar = getChatAvatar();
  const status = getChatStatus();

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1a1a1a] bg-[#111] flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center overflow-hidden">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[13px] font-medium text-[#888]">
                {chat.isGroup ? '👥' : name?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          {isOtherOnline() && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#111]" />
          )}
        </div>

        <div>
          <h2 className="text-[14px] font-semibold text-[#e0e0e0]">{name}</h2>
          <div className="h-4 flex items-center">
            <AnimatePresence mode="wait">
              {chatTyping.length > 0 ? (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -2 }}
                  className="flex items-center gap-1.5"
                >
                  <div className="flex gap-0.5">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="typing-dot w-1 h-1 rounded-full bg-[#888]" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#666]">
                    {chatTyping.length === 1
                      ? `${chatTyping[0].userName} is typing`
                      : `${chatTyping.length} people typing`}
                  </span>
                </motion.div>
              ) : (
                <motion.span
                  key="status"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`text-[11px] ${isOtherOnline() ? 'text-green-400' : 'text-[#555]'}`}
                >
                  {status}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {[
          {
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            ),
            title: 'Search messages',
            onClick: () => {},
          },
          {
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            title: 'Chat info',
            onClick: () => setShowInfo(!showInfo),
          },
        ].map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            title={action.title}
            className="p-2 rounded-lg text-[#555] hover:text-[#e0e0e0] hover:bg-[#1e1e1e] transition-colors"
          >
            {action.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
