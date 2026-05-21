'use client';

import { motion } from 'framer-motion';
import { Chat, Message } from '@/types';
import { formatDistanceToNow, isToday, format } from 'date-fns';

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  chatName: string;
  chatAvatar?: string;
  isOnline: boolean;
  currentUserId: string;
  onClick: () => void;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, 'HH:mm');
  return formatDistanceToNow(date, { addSuffix: false });
}

function getLastMessagePreview(msg: Message | undefined, currentUserId: string): string {
  if (!msg) return 'Start a conversation';
  if (msg.isDeleted) return '🚫 Message deleted';
  if (msg.type === 'image') return '📷 Image';
  if (msg.type === 'file') return `📎 ${msg.fileName || 'File'}`;
  if (msg.type === 'system') return msg.content;
  const sender = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
  const prefix = sender === currentUserId ? 'You: ' : '';
  return prefix + (msg.content?.length > 35 ? msg.content.slice(0, 35) + '…' : msg.content || '');
}

export function ChatListItem({ chat, isActive, chatName, chatAvatar, isOnline, currentUserId, onClick }: ChatListItemProps) {
  const unread = chat.unreadCount || 0;
  const lastTime = chat.lastMessage?.createdAt || chat.updatedAt;

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
        isActive ? 'bg-[#1e1e1e]' : 'hover:bg-[#161616]'
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center overflow-hidden">
          {chatAvatar ? (
            <img src={chatAvatar} alt={chatName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[14px] font-medium text-[#888]">
              {chat.isGroup ? '👥' : chatName?.[0]?.toUpperCase()}
            </span>
          )}
        </div>
        {isOnline && !chat.isGroup && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#111]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[13px] font-medium text-[#e0e0e0] truncate">{chatName}</span>
          <span className="text-[11px] text-[#444] flex-shrink-0 ml-2">{formatTime(lastTime)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-[12px] truncate ${unread > 0 ? 'text-[#888]' : 'text-[#555]'}`}>
            {getLastMessagePreview(chat.lastMessage, currentUserId)}
          </span>
          {unread > 0 && (
            <span className="ml-2 min-w-[18px] h-[18px] bg-[#e0e0e0] text-[#0a0a0a] rounded-full text-[10px] font-semibold flex items-center justify-center px-1 flex-shrink-0">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
