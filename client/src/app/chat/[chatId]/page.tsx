'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { chatAPI, messageAPI } from '@/lib/api';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { joinChat, leaveChat } from '@/lib/socket';
import toast from 'react-hot-toast';

interface PageProps {
  params: { chatId: string };
}

export default function ChatPage({ params }: PageProps) {
  const { chatId } = params;
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    chats, activeChat, setActiveChat,
    messages, setMessages, isLoadingMessages,
    clearUnread,
  } = useChatStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const chat = chats.find(c => c._id === chatId);
    if (chat) {
      setActiveChat(chat);
    } else {
      // Fetch if not in store (direct URL navigation)
      chatAPI.getChats().then(({ data }) => {
        const found = data.find((c: { _id: string }) => c._id === chatId);
        if (found) setActiveChat(found);
        else router.push('/chat');
      }).catch(() => router.push('/chat'));
    }
  }, [chatId, chats]);

  useEffect(() => {
    if (!chatId) return;

    joinChat(chatId);
    loadMessages();
    markAsRead();

    return () => {
      leaveChat(chatId);
      setActiveChat(null);
    };
  }, [chatId]);

  const loadMessages = async () => {
    if (messages[chatId]) return; // Already loaded
    try {
      setIsLoading(true);
      const { data } = await messageAPI.getMessages(chatId);
      setMessages(chatId, data.messages);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await messageAPI.markAsRead(chatId);
      clearUnread(chatId);
    } catch {
      // Silent fail
    }
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0e0e0e]">
        <div className="text-[13px] text-[#444]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0e0e0e]">
      <ChatHeader chat={activeChat} />
      <MessageList
        chatId={chatId}
        messages={messages[chatId] || []}
        isLoading={isLoading || isLoadingMessages}
        currentUserId={user?._id || ''}
      />
      <MessageInput chatId={chatId} />
    </div>
  );
}
