import { Response } from 'express';
import mongoose from 'mongoose';
import { Chat } from '../models/Chat';
import { User } from '../models/User';
import { Message } from '../models/Message';
import { AuthRequest } from '../middleware/auth';

export const getChats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;

    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'name avatar isOnline lastSeen status')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name' },
      })
      .populate('pinnedMessage')
      .sort({ updatedAt: -1 })
      .lean();

    // Get unread counts
    const chatsWithUnread = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await Message.countDocuments({
          chat: chat._id,
          readBy: { $ne: userId },
          sender: { $ne: userId },
        });
        return { ...chat, unreadCount };
      })
    );

    res.json(chatsWithUnread);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
};

export const getOrCreateChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId: targetUserId } = req.body;
    const currentUserId = req.user!._id;

    if (targetUserId === currentUserId) {
      res.status(400).json({ message: 'Cannot chat with yourself' });
      return;
    }

    // Check if private chat already exists
    let chat = await Chat.findOne({
      isGroup: false,
      participants: {
        $all: [currentUserId, targetUserId],
        $size: 2,
      },
    })
      .populate('participants', 'name avatar isOnline lastSeen status')
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'name' } });

    if (!chat) {
      chat = await Chat.create({
        isGroup: false,
        participants: [currentUserId, targetUserId],
        createdBy: currentUserId,
      });

      chat = await Chat.findById(chat._id)
        .populate('participants', 'name avatar isOnline lastSeen status')
        .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'name' } }) as typeof chat;
    }

    res.json(chat);
  } catch (error) {
    console.error('Get or create chat error:', error);
    res.status(500).json({ message: 'Failed to get or create chat' });
  }
};

export const createGroupChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, participants, description } = req.body;
    const currentUserId = req.user!._id;

    if (!name || !participants?.length) {
      res.status(400).json({ message: 'Name and participants required' });
      return;
    }

    const allParticipants = [...new Set([currentUserId, ...participants])];

    const chat = await Chat.create({
      isGroup: true,
      name,
      description,
      participants: allParticipants,
      admins: [currentUserId],
      createdBy: currentUserId,
    });

    // Create system message
    await Message.create({
      chat: chat._id,
      sender: currentUserId,
      content: `${req.user!.name} created the group "${name}"`,
      type: 'system',
    });

    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'name avatar isOnline lastSeen status')
      .lean();

    res.status(201).json(populatedChat);
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Failed to create group' });
  }
};

export const updateGroupChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const { name, description, avatar } = req.body;
    const userId = req.user!._id;

    const chat = await Chat.findOne({ _id: chatId, admins: userId });
    if (!chat) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    if (name) chat.name = name;
    if (description !== undefined) chat.description = description;
    if (avatar) chat.avatar = avatar;

    await chat.save();
    res.json(chat);
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ message: 'Failed to update group' });
  }
};

export const pinMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const { messageId } = req.body;
    const userId = req.user!._id;

    const chat = await Chat.findOne({ _id: chatId, participants: userId });
    if (!chat) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    chat.pinnedMessage = messageId ? new mongoose.Types.ObjectId(messageId) : undefined;
    await chat.save();

    res.json({ success: true, pinnedMessage: chat.pinnedMessage });
  } catch (error) {
    console.error('Pin message error:', error);
    res.status(500).json({ message: 'Failed to pin message' });
  }
};

export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    const userId = req.user!._id;

    if (!q || typeof q !== 'string') {
      res.json([]);
      return;
    }

    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
    })
      .select('name email avatar isOnline status')
      .limit(20)
      .lean();

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
};
