'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '@/types';
import { MessageBubble } from './MessageBubble';
import { useChatStore } from '@/stores/chatStore';
import { messageAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface MessageListProps {
  chatId: string;
  messages: Message[];
  isLoading: boolean;
  currentUserId: string;
}

function groupMessagesByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = [];
  let currentDate = '';

  messages.forEach(msg => {
    const date = new Date(msg.createdAt).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    if (date !== currentDate) {
      currentDate = date;
      groups.push({ date, messages: [msg] });
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  });

  return groups;
}

export function MessageList({ chatId, messages, isLoading, currentUserId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { prependMessages } = useChatStore();
  const prevScrollHeight = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 300);

    if (el.scrollTop < 60 && !loadingMore && hasMore) {
      loadMoreMessages();
    }
  };

  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      prevScrollHeight.current = containerRef.current?.scrollHeight || 0;
      const nextPage = page + 1;
      const { data } = await messageAPI.getMessages(chatId, nextPage);
      if (data.messages.length === 0 || nextPage >= data.pagination.pages) {
        setHasMore(false);
      }
      if (data.messages.length > 0) {
        prependMessages(chatId, data.messages);
        setPage(nextPage);
      }
    } catch {
      toast.error('Failed to load more messages');
    } finally {
      setLoadingMore(false);
    }
  };

  // Restore scroll position after prepend
  useEffect(() => {
    if (loadingMore || !prevScrollHeight.current) return;
    const el = containerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight - prevScrollHeight.current;
    }
  }, [messages.length]);

  const groups = groupMessagesByDate(messages);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-1 relative"
    >
      {/* Load more */}
      {loadingMore && (
        <div className="flex justify-center py-3">
          <div className="flex gap-1">
            {[0,1,2].map(i => (
              <span key={i} className="typing-dot w-1.5 h-1.5 rounded-full bg-[#444]" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4 pt-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`flex items-end gap-2 ${i % 3 === 0 ? 'justify-end' : 'justify-start'}`}>
              {i % 3 !== 0 && <div className="skeleton w-7 h-7 rounded-full flex-shrink-0" />}
              <div className="space-y-1">
                <div className={`skeleton h-9 ${i % 3 === 0 ? 'w-44' : 'w-52'} rounded-2xl`} />
              </div>
            </div>
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="text-3xl mb-3">👋</div>
          <p className="text-[13px] text-[#555]">No messages yet. Say hello!</p>
        </div>
      ) : (
        groups.map((group) => (
          <div key={group.date}>
            {/* Date separator */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-[#1a1a1a]" />
              <span className="text-[11px] text-[#444] bg-[#0e0e0e] px-2">{group.date}</span>
              <div className="flex-1 h-px bg-[#1a1a1a]" />
            </div>

            <div className="space-y-1">
              {group.messages.map((msg, idx) => {
                const prevMsg = group.messages[idx - 1];
                const prevSenderId = typeof prevMsg?.sender === 'object' ? prevMsg.sender._id : prevMsg?.sender;
                const currSenderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
                const isConsecutive = prevSenderId === currSenderId && idx > 0;

                return (
                  <MessageBubble
                    key={msg._id}
                    message={msg}
                    isOwn={currSenderId === currentUserId}
                    currentUserId={currentUserId}
                    isConsecutive={isConsecutive}
                  />
                );
              })}
            </div>
          </div>
        ))
      )}

      <div ref={bottomRef} />

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="fixed bottom-24 right-8 w-9 h-9 bg-[#1e1e1e] border border-[#2a2a2a] rounded-full flex items-center justify-center text-[#888] hover:text-[#e0e0e0] shadow-elevated transition-colors z-10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
