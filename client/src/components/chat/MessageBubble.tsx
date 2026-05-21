'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '@/types';
import { format } from 'date-fns';
import { messageAPI } from '@/lib/api';
import { useChatStore } from '@/stores/chatStore';
import toast from 'react-hot-toast';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  currentUserId: string;
  isConsecutive: boolean;
}

export function MessageBubble({ message, isOwn, currentUserId, isConsecutive }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const { setReplyTo, updateMessage } = useChatStore();

  const senderName = typeof message.sender === 'object' ? message.sender.name : 'Unknown';
  const senderAvatar = typeof message.sender === 'object' ? message.sender.avatar : undefined;
  const time = format(new Date(message.createdAt), 'HH:mm');

  const handleReact = async (emoji: string) => {
    try {
      await messageAPI.reactToMessage(message._id, emoji);
    } catch {
      toast.error('Failed to add reaction');
    }
    setShowEmojiPicker(false);
    setShowActions(false);
  };

  const handleEdit = async () => {
    if (!editContent.trim() || editContent === message.content) {
      setIsEditing(false);
      return;
    }
    try {
      await messageAPI.editMessage(message._id, editContent.trim());
      updateMessage(message._id, { content: editContent.trim(), isEdited: true });
      setIsEditing(false);
    } catch {
      toast.error('Failed to edit message');
    }
  };

  const handleDelete = async (forEveryone: boolean) => {
    try {
      await messageAPI.deleteMessage(message._id, forEveryone);
      if (forEveryone) {
        updateMessage(message._id, { isDeleted: true, content: 'This message was deleted' });
      }
    } catch {
      toast.error('Failed to delete message');
    }
    setShowActions(false);
  };

  const isDeleted = message.isDeleted;
  const isSystem = message.type === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-[11px] text-[#444] bg-[#1a1a1a] rounded-full px-3 py-1">{message.content}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-0.5' : 'mt-3'} group message-bubble`}
    >
      {/* Avatar */}
      {!isOwn && !isConsecutive && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center overflow-hidden flex-shrink-0 mr-2 mt-auto">
          {senderAvatar ? (
            <img src={senderAvatar} alt={senderName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-[#888]">{senderName?.[0]?.toUpperCase()}</span>
          )}
        </div>
      )}
      {!isOwn && isConsecutive && <div className="w-7 mr-2 flex-shrink-0" />}

      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[65%] relative`}>
        {/* Sender name for groups */}
        {!isOwn && !isConsecutive && (
          <span className="text-[11px] text-[#666] mb-1 ml-1">{senderName}</span>
        )}

        {/* Reply preview */}
        {message.replyTo && typeof message.replyTo === 'object' && (
          <div className={`text-[11px] border-l-2 border-[#444] pl-2 pr-3 py-1 mb-1 rounded-lg bg-[#1a1a1a] max-w-full ${isOwn ? 'mr-0' : 'ml-0'}`}>
            <span className="text-[#666] block truncate">
              {(message.replyTo as Message).content || 'Message'}
            </span>
          </div>
        )}

        {/* Bubble */}
        <div
          className="relative"
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => { setShowActions(false); setShowEmojiPicker(false); }}
        >
          {/* Action buttons */}
          <AnimatePresence>
            {showActions && !isDeleted && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className={`message-actions absolute -top-8 ${isOwn ? 'right-0' : 'left-0'} flex items-center gap-0.5 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-1 py-0.5 shadow-elevated z-20`}
              >
                {/* React */}
                <div className="relative">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-1.5 rounded-lg text-[#666] hover:text-[#e0e0e0] hover:bg-[#2a2a2a] transition-colors text-[13px]"
                    title="React"
                  >
                    😊
                  </button>
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 4 }}
                        className={`reaction-popup absolute top-full mt-1 ${isOwn ? 'right-0' : 'left-0'} flex gap-1 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-2 py-1.5 shadow-elevated z-30`}
                      >
                        {QUICK_EMOJIS.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => handleReact(emoji)}
                            className="text-[18px] hover:scale-125 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Reply */}
                <button
                  onClick={() => setReplyTo(message)}
                  className="p-1.5 rounded-lg text-[#666] hover:text-[#e0e0e0] hover:bg-[#2a2a2a] transition-colors"
                  title="Reply"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>

                {/* Edit (own messages only) */}
                {isOwn && message.type === 'text' && (
                  <button
                    onClick={() => { setIsEditing(true); setShowActions(false); }}
                    className="p-1.5 rounded-lg text-[#666] hover:text-[#e0e0e0] hover:bg-[#2a2a2a] transition-colors"
                    title="Edit"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}

                {/* Delete */}
                {isOwn && (
                  <button
                    onClick={() => handleDelete(true)}
                    className="p-1.5 rounded-lg text-[#666] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message content */}
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                ref={editRef}
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                autoFocus
                rows={2}
                className="bg-[#1e1e1e] border border-[#3a3a3a] rounded-2xl px-3 py-2 text-[14px] text-[#e0e0e0] resize-none focus:outline-none focus:border-[#555] min-w-[200px]"
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEdit(); }
                  if (e.key === 'Escape') setIsEditing(false);
                }}
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setIsEditing(false)} className="text-[12px] text-[#666] hover:text-[#888] px-2 py-1">Cancel</button>
                <button onClick={handleEdit} className="text-[12px] bg-[#e0e0e0] text-[#0a0a0a] px-3 py-1 rounded-lg font-medium hover:bg-white">Save</button>
              </div>
            </div>
          ) : (
            <div
              className={`relative px-3.5 py-2.5 rounded-2xl ${
                isOwn
                  ? `bg-[#e0e0e0] text-[#0a0a0a] ${isConsecutive ? 'rounded-tr-lg' : 'rounded-tr-sm'}`
                  : `bg-[#1e1e1e] text-[#e0e0e0] border border-[#252525] ${isConsecutive ? 'rounded-tl-lg' : 'rounded-tl-sm'}`
              } ${isDeleted ? 'opacity-50 italic' : ''}`}
            >
              {/* Image */}
              {message.type === 'image' && message.fileUrl && (
                <img
                  src={message.fileUrl}
                  alt="Image"
                  className="rounded-xl max-w-[240px] max-h-[300px] object-cover mb-1"
                />
              )}

              {/* File */}
              {message.type === 'file' && message.fileUrl && (
                <a
                  href={message.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 ${isOwn ? 'text-[#0a0a0a]' : 'text-[#e0e0e0]'}`}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-[13px] underline truncate max-w-[180px]">{message.fileName || 'File'}</span>
                </a>
              )}

              {/* Text */}
              {(message.type === 'text' || message.content) && (
                <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
              )}

              {/* Meta row */}
              <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-end'}`}>
                {message.isEdited && (
                  <span className={`text-[10px] ${isOwn ? 'text-[#666]' : 'text-[#555]'}`}>edited</span>
                )}
                <span className={`text-[10px] ${isOwn ? 'text-[#666]' : 'text-[#555]'}`}>{time}</span>
                {isOwn && !isDeleted && (
                  <span className="text-[10px]">
                    {message.readBy.length > 1 ? (
                      <span className="text-blue-400">✓✓</span>
                    ) : (
                      <span className="text-[#555]">✓</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              {message.reactions.filter(r => r.users.length > 0).map(reaction => (
                <button
                  key={reaction.emoji}
                  onClick={() => handleReact(reaction.emoji)}
                  className={`flex items-center gap-1 text-[12px] px-1.5 py-0.5 rounded-full border transition-colors ${
                    reaction.users.includes(currentUserId)
                      ? 'bg-[#e0e0e0]/10 border-[#e0e0e0]/30'
                      : 'bg-[#1e1e1e] border-[#2a2a2a] hover:border-[#3a3a3a]'
                  }`}
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-[11px] text-[#888]">{reaction.users.length}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
