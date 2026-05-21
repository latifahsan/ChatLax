export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  status: string;
  isOnline: boolean;
  lastSeen: string;
  googleId?: string;
}

export interface Message {
  _id: string;
  chat: string;
  sender: User | string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyTo?: Message | null;
  readBy: string[];
  reactions: Reaction[];
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Reaction {
  emoji: string;
  users: string[];
}

export interface Chat {
  _id: string;
  isGroup: boolean;
  name?: string;
  avatar?: string;
  description?: string;
  participants: User[];
  admins: string[];
  lastMessage?: Message;
  pinnedMessage?: Message;
  createdBy: string;
  unreadCount?: number;
  mutedBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface TypingUser {
  userId: string;
  userName: string;
  chatId: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
