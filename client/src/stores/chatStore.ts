import { create } from 'zustand';
import { Chat, Message, TypingUser } from '@/types';

interface ChatStore {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Record<string, Message[]>;
  typingUsers: TypingUser[];
  // Fix #5: use Record instead of Set for serializability
  onlineUsers: Record<string, boolean>;
  isLoadingChats: boolean;
  isLoadingMessages: boolean;
  replyTo: Message | null;
  searchQuery: string;

  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  setActiveChat: (chat: Chat | null) => void;

  setMessages: (chatId: string, messages: Message[]) => void;
  prependMessages: (chatId: string, messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  removeMessage: (messageId: string) => void;

  addTypingUser: (user: TypingUser) => void;
  removeTypingUser: (userId: string, chatId: string) => void;

  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;
  isUserOnline: (userId: string) => boolean;

  setReplyTo: (message: Message | null) => void;
  setSearchQuery: (q: string) => void;
  incrementUnread: (chatId: string) => void;
  clearUnread: (chatId: string) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  activeChat: null,
  messages: {},
  typingUsers: [],
  onlineUsers: {},
  isLoadingChats: false,
  isLoadingMessages: false,
  replyTo: null,
  searchQuery: '',

  setChats: (chats) => set({ chats }),

  addChat: (chat) =>
    set((state) => ({
      chats: [chat, ...state.chats.filter((c) => c._id !== chat._id)],
    })),

  updateChat: (chatId, updates) =>
    set((state) => ({
      chats: state.chats.map((c) => (c._id === chatId ? { ...c, ...updates } : c)),
      activeChat: state.activeChat?._id === chatId
        ? { ...state.activeChat, ...updates }
        : state.activeChat,
    })),

  setActiveChat: (chat) => set({ activeChat: chat }),

  setMessages: (chatId, messages) =>
    set((state) => ({ messages: { ...state.messages, [chatId]: messages } })),

  prependMessages: (chatId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...messages, ...(state.messages[chatId] || [])],
      },
    })),

  addMessage: (message) => {
    const chatId = message.chat;
    set((state) => {
      const existing = state.messages[chatId] || [];
      const isDuplicate = existing.some((m) => m._id === message._id);
      if (isDuplicate) return state;

      return {
        messages: {
          ...state.messages,
          [chatId]: [...existing, message],
        },
        chats: state.chats.map((c) =>
          c._id === chatId ? { ...c, lastMessage: message, updatedAt: message.createdAt } : c
        ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
      };
    });
  },

  updateMessage: (messageId, updates) =>
    set((state) => {
      const newMessages = { ...state.messages };
      for (const chatId in newMessages) {
        newMessages[chatId] = newMessages[chatId].map((m) =>
          m._id === messageId ? { ...m, ...updates } : m
        );
      }
      return { messages: newMessages };
    }),

  removeMessage: (messageId) =>
    set((state) => {
      const newMessages = { ...state.messages };
      for (const chatId in newMessages) {
        newMessages[chatId] = newMessages[chatId].filter((m) => m._id !== messageId);
      }
      return { messages: newMessages };
    }),

  addTypingUser: (user) =>
    set((state) => ({
      typingUsers: [
        ...state.typingUsers.filter(
          (t) => !(t.userId === user.userId && t.chatId === user.chatId)
        ),
        user,
      ],
    })),

  removeTypingUser: (userId, chatId) =>
    set((state) => ({
      typingUsers: state.typingUsers.filter(
        (t) => !(t.userId === userId && t.chatId === chatId)
      ),
    })),

  setUserOnline: (userId) =>
    set((state) => ({
      onlineUsers: { ...state.onlineUsers, [userId]: true },
    })),

  setUserOffline: (userId) =>
    set((state) => {
      const updated = { ...state.onlineUsers };
      delete updated[userId];
      return { onlineUsers: updated };
    }),

  isUserOnline: (userId) => !!get().onlineUsers[userId],

  setReplyTo: (message) => set({ replyTo: message }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  incrementUnread: (chatId) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c._id === chatId ? { ...c, unreadCount: (c.unreadCount || 0) + 1 } : c
      ),
    })),

  clearUnread: (chatId) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c._id === chatId ? { ...c, unreadCount: 0 } : c
      ),
    })),
}));
