'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { messageAPI, uploadAPI } from '@/lib/api';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { emitTypingStart, emitTypingStop } from '@/lib/socket';
import toast from 'react-hot-toast';

interface MessageInputProps {
  chatId: string;
}

export function MessageInput({ chatId }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { replyTo, setReplyTo, addMessage } = useChatStore();
  const { user } = useAuthStore();

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [content]);

  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      emitTypingStart(chatId);
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emitTypingStop(chatId);
    }, 1500);
  }, [isTyping, chatId]);

  useEffect(() => {
    return () => {
      clearTimeout(typingTimeoutRef.current);
      if (isTyping) emitTypingStop(chatId);
    };
  }, [chatId, isTyping]);

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed || isSending) return;

    try {
      setIsSending(true);
      setContent('');
      setReplyTo(null);
      if (isTyping) {
        emitTypingStop(chatId);
        setIsTyping(false);
      }

      const { data } = await messageAPI.sendMessage(chatId, {
        content: trimmed,
        type: 'text',
        replyTo: replyTo?._id || null,
      });

      // Add message directly from the API response so the sender sees it
      // immediately, without depending on the socket echo.
      // The socket will also emit 'message:new' to the room — addMessage
      // deduplicates by _id so showing twice is not possible.
      addMessage(data);
    } catch {
      toast.error('Failed to send message');
      setContent(trimmed);
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File too large (max 10MB)');
      return;
    }

    try {
      setIsUploading(true);
      const { data: uploadData } = await uploadAPI.upload(file);
      const { data: msgData } = await messageAPI.sendMessage(chatId, {
        content: isImage ? '' : file.name,
        type: isImage ? 'image' : 'file',
        fileUrl: uploadData.url,
        fileName: uploadData.fileName,
        fileSize: uploadData.fileSize,
      });
      // Same as text messages: add immediately from API response
      addMessage(msgData);
    } catch {
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="px-4 py-3 border-t border-[#1a1a1a] bg-[#111] flex-shrink-0">
      {/* Reply preview */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2"
          >
            <div className="w-0.5 h-full bg-[#444] rounded-full self-stretch" />
            <div className="flex-1 min-w-0">
              <span className="text-[11px] text-[#666] block">
                Replying to {typeof replyTo.sender === 'object' ? replyTo.sender.name : 'message'}
              </span>
              <span className="text-[12px] text-[#888] truncate block">{replyTo.content || 'Media'}</span>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="text-[#555] hover:text-[#888] p-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2">
        {/* File attach */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2 rounded-xl text-[#555] hover:text-[#888] hover:bg-[#1a1a1a] transition-colors flex-shrink-0 disabled:opacity-50"
          title="Attach file"
        >
          {isUploading ? (
            <div className="w-4 h-4 border-2 border-[#555] border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Input area */}
        <div className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-4 py-2.5 focus-within:border-[#3a3a3a] transition-colors">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => { setContent(e.target.value); handleTyping(); }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="w-full bg-transparent text-[14px] text-[#e0e0e0] placeholder:text-[#444] resize-none focus:outline-none leading-relaxed max-h-[120px]"
          />
        </div>

        {/* Send button */}
        <motion.button
          onClick={handleSend}
          disabled={!content.trim() || isSending}
          whileTap={{ scale: 0.92 }}
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
            content.trim() && !isSending
              ? 'bg-[#e0e0e0] text-[#0a0a0a] hover:bg-white'
              : 'bg-[#1a1a1a] text-[#444] cursor-not-allowed'
          }`}
        >
          {isSending ? (
            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          )}
        </motion.button>
      </div>
    </div>
  );
}
