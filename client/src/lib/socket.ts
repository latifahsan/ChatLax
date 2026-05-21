import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const getSocket = (): Socket | null => socket;

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) return socket;

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

export const joinChats = (chatIds: string[]): void => { socket?.emit('chats:join', chatIds); };
export const joinChat = (chatId: string): void => { socket?.emit('chat:join', chatId); };
export const leaveChat = (chatId: string): void => { socket?.emit('chat:leave', chatId); };
export const emitTypingStart = (chatId: string): void => { socket?.emit('typing:start', { chatId }); };
export const emitTypingStop = (chatId: string): void => { socket?.emit('typing:stop', { chatId }); };
