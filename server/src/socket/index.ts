import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

interface AuthSocket extends Socket {
  userId?: string;
  userName?: string;
}

const onlineUsers = new Map<string, string>(); // userId -> socketId

export const setupSocket = (io: Server): void => {
  // Auth middleware
  io.use(async (socket: AuthSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));

      const secret = process.env.JWT_SECRET || 'fallback-secret';
      const decoded = jwt.verify(token, secret) as { userId: string };
      const user = await User.findById(decoded.userId).select('name');

      if (!user) return next(new Error('User not found'));

      socket.userId = decoded.userId;
      socket.userName = user.name;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket: AuthSocket) => {
    const userId = socket.userId!;
    console.log(`🔌 User connected: ${socket.userName} (${userId})`);

    // Track online status
    onlineUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
    io.emit('user:online', { userId });

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Join all user's chat rooms
    socket.on('chats:join', (chatIds: string[]) => {
      chatIds.forEach(id => socket.join(`chat:${id}`));
    });

    socket.on('chat:join', (chatId: string) => {
      socket.join(`chat:${chatId}`);
    });

    socket.on('chat:leave', (chatId: string) => {
      socket.leave(`chat:${chatId}`);
    });

    // Typing indicators
    socket.on('typing:start', ({ chatId }: { chatId: string }) => {
      socket.to(`chat:${chatId}`).emit('typing:start', {
        chatId,
        userId,
        userName: socket.userName,
      });
    });

    socket.on('typing:stop', ({ chatId }: { chatId: string }) => {
      socket.to(`chat:${chatId}`).emit('typing:stop', { chatId, userId });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`🔌 User disconnected: ${socket.userName}`);
      onlineUsers.delete(userId);

      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });

      io.emit('user:offline', { userId, lastSeen: new Date() });
    });
  });
};

export const getOnlineUsers = (): string[] => Array.from(onlineUsers.keys());
