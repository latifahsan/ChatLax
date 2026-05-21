import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return jwt.sign({ userId }, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
  });
};

const sanitizeUser = (user: InstanceType<typeof User>) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  status: user.status,
  isOnline: user.isOnline,
});

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential } = req.body;
    if (!credential) { res.status(400).json({ message: 'Google credential required' }); return; }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) { res.status(400).json({ message: 'Invalid Google token' }); return; }

    const { sub: googleId, email, name, picture } = payload;
    if (!email || !name) { res.status(400).json({ message: 'Incomplete Google profile' }); return; }

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (!user) {
      user = await User.create({ googleId, email, name, avatar: picture });
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.avatar = user.avatar || picture;
      await user.save();
    }

    const token = generateToken(user._id.toString());
    res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Authentication failed. Please try again.' });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      res.status(400).json({ message: 'All fields are required' }); return;
    }
    if (name.trim().length < 2) {
      res.status(400).json({ message: 'Name must be at least 2 characters' }); return;
    }
    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters' }); return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'Invalid email address' }); return;
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) { res.status(409).json({ message: 'Email already in use' }); return; }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password: hashedPassword });

    const token = generateToken(user._id.toString());
    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' }); return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.password) {
      res.status(401).json({ message: 'Invalid email or password' }); return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' }); return;
    }

    const token = generateToken(user._id.toString());
    res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      res.status(400).json({ message: 'All password fields are required' }); return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ message: 'New password must be at least 6 characters' }); return;
    }
    if (newPassword !== confirmPassword) {
      res.status(400).json({ message: 'New passwords do not match' }); return;
    }
    if (currentPassword === newPassword) {
      res.status(400).json({ message: 'New password must be different from current password' }); return;
    }

    const user = await User.findById(req.user!._id);
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }

    if (!user.password) {
      res.status(400).json({ message: 'This account uses Google sign-in. Password change is not available.' }); return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Current password is incorrect' }); return;
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password. Please try again.' });
  }
};
