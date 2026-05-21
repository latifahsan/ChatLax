'use client';

import { useEffect } from 'react';
import { connectSocket, joinChats } from '@/lib/socket';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { Message } from '@/types';

export const useSocket = () => {
  const { token, isAuthenticated } = useAuthStore();
  const {
    addMessage,
    updateMessage,
    addTypingUser,
    removeTypingUser,
    setUserOnline,
    setUserOffline,
    chats,
    incrementUnread,
    clearUnread,
  } = useChatStore();

  // Effect 1: register all socket event handlers
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket = connectSocket(token);

    // Remove any previous listeners for these events before re-attaching.
    // This makes the effect safe to run multiple times (React StrictMode
    // mounts -> cleans up -> mounts again in development, and the cleanup
    // below only removes our specific handlers, so re-running this effect
    // re-registers them correctly without duplicates).
    socket.off('message:new');
    socket.off('message:edited');
    socket.off('message:deleted');
    socket.off('message:reaction');
    socket.off('messages:read');
    socket.off('typing:start');
    socket.off('typing:stop');
    socket.off('user:online');
    socket.off('user:offline');
    socket.off('connect');

    // On (re)connect, rejoin all chat rooms. Socket.IO server-side rooms are
    // cleared on disconnect, so after any reconnect we must re-emit 'chats:join'.
    socket.on('connect', () => {
      const currentChats = useChatStore.getState().chats;
      if (currentChats.length > 0) {
        socket.emit('chats:join', currentChats.map((c) => c._id));
      }
    });

    socket.on('message:new', (message: Message) => {
      addMessage(message);
      const currentActiveChat = useChatStore.getState().activeChat;
      if (currentActiveChat?._id !== message.chat) {
        incrementUnread(message.chat);
      }
    });

    socket.on('message:edited', ({ _id, content, isEdited }: Partial<Message>) => {
      if (_id) updateMessage(_id, { content, isEdited });
    });

    socket.on('message:deleted', ({ _id, forEveryone }: { _id: string; forEveryone: boolean }) => {
      if (forEveryone) {
        updateMessage(_id, { isDeleted: true, content: 'This message was deleted' });
      }
    });

    socket.on('message:reaction', ({ _id, reactions }: { _id: string; reactions: Message['reactions'] }) => {
      updateMessage(_id, { reactions });
    });

    socket.on('messages:read', ({ chatId }: { chatId: string }) => {
      clearUnread(chatId);
    });

    socket.on('typing:start', ({ chatId, userId, userName }: { chatId: string; userId: string; userName: string }) => {
      addTypingUser({ chatId, userId, userName });
    });

    socket.on('typing:stop', ({ chatId, userId }: { chatId: string; userId: string }) => {
      removeTypingUser(userId, chatId);
    });

    socket.on('user:online', ({ userId }: { userId: string }) => {
      setUserOnline(userId);
    });

    socket.on('user:offline', ({ userId }: { userId: string }) => {
      setUserOffline(userId);
    });

    return () => {
      socket.off('connect');
      socket.off('message:new');
      socket.off('message:edited');
      socket.off('message:deleted');
      socket.off('message:reaction');
      socket.off('messages:read');
      socket.off('typing:start');
      socket.off('typing:stop');
      socket.off('user:online');
      socket.off('user:offline');
    };
  }, [isAuthenticated, token]);

  // Effect 2: join chat rooms when chats list first loads or changes.
  // The 'connect' handler above covers the reconnect case.
  useEffect(() => {
    if (!isAuthenticated || chats.length === 0) return;
    joinChats(chats.map((c) => c._id));
  }, [isAuthenticated, chats]);
};
