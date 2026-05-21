import { Response } from 'express';
import mongoose from 'mongoose';
import { Message } from '../models/Message';
import { Chat } from '../models/Chat';
import { AuthRequest } from '../middleware/auth';
import { io } from '../index';

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const userId = req.user!._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Verify user is participant
    const chat = await Chat.findOne({ _id: chatId, participants: userId });
    if (!chat) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const messages = await Message.find({
      chat: chatId,
      deletedFor: { $ne: userId },
    })
      .populate('sender', 'name avatar')
      .populate('replyTo', 'content sender type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Message.countDocuments({ chat: chatId, deletedFor: { $ne: userId } });

    res.json({
      messages: messages.reverse(),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const { content, type = 'text', replyTo, fileUrl, fileName, fileSize } = req.body;
    const userId = req.user!._id;

    const chat = await Chat.findOne({ _id: chatId, participants: userId });
    if (!chat) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const message = await Message.create({
      chat: chatId,
      sender: userId,
      content,
      type,
      replyTo: replyTo || null,
      fileUrl,
      fileName,
      fileSize,
      readBy: [userId],
    });

    await message.populate('sender', 'name avatar');
    if (replyTo) await message.populate('replyTo', 'content sender type');

    // Update chat's last message
    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

    // Emit to all participants
    const messageObj = message.toObject();
    io.to(`chat:${chatId}`).emit('message:new', messageObj);

    res.status(201).json(messageObj);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

export const editMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user!._id;

    const message = await Message.findOne({ _id: messageId, sender: userId });
    if (!message) {
      res.status(404).json({ message: 'Message not found or unauthorized' });
      return;
    }

    message.content = content;
    message.isEdited = true;
    await message.save();

    io.to(`chat:${message.chat.toString()}`).emit('message:edited', {
      _id: message._id,
      content: message.content,
      isEdited: true,
    });

    res.json(message);
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ message: 'Failed to edit message' });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { messageId } = req.params;
    const { forEveryone } = req.body;
    const userId = req.user!._id;

    const message = await Message.findById(messageId);
    if (!message) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }

    if (forEveryone && message.sender.toString() === userId) {
      message.isDeleted = true;
      message.content = 'This message was deleted';
      await message.save();
      io.to(`chat:${message.chat.toString()}`).emit('message:deleted', { _id: message._id, forEveryone: true });
    } else {
      message.deletedFor.push(message.sender);
      await message.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Failed to delete message' });
  }
};

export const reactToMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user!._id;

    const message = await Message.findById(messageId);
    if (!message) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }

    const existingReaction = message.reactions.find(r => r.emoji === emoji);
    if (existingReaction) {
      const userIndex = existingReaction.users.findIndex(u => u.toString() === userId);
      if (userIndex > -1) {
        existingReaction.users.splice(userIndex, 1);
        if (existingReaction.users.length === 0) {
          message.reactions = message.reactions.filter(r => r.emoji !== emoji);
        }
      } else {
        // Fix #4: push the reacting user's ID, not the message sender's ID
        existingReaction.users.push(new mongoose.Types.ObjectId(userId));
      }
    } else {
      message.reactions.push({ emoji, users: [new mongoose.Types.ObjectId(userId)] });
    }

    await message.save();

    io.to(`chat:${message.chat.toString()}`).emit('message:reaction', {
      _id: message._id,
      reactions: message.reactions,
    });

    res.json(message.reactions);
  } catch (error) {
    console.error('React to message error:', error);
    res.status(500).json({ message: 'Failed to react to message' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const userId = req.user!._id;

    await Message.updateMany(
      { chat: chatId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    io.to(`chat:${chatId}`).emit('messages:read', { chatId, userId });

    res.json({ success: true });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
};
