import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: { _id: string; name: string; email: string };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) { res.status(500).json({ message: 'Server configuration error' }); return; }

    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, secret) as { userId: string };
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        res.status(401).json({ message: 'Session expired. Please log in again.' });
      } else {
        res.status(401).json({ message: 'Invalid token. Please log in again.' });
      }
      return;
    }

    const user = await User.findById(decoded.userId).select('_id name email').lean();
    if (!user) { res.status(401).json({ message: 'User not found. Please log in again.' }); return; }

    req.user = { _id: user._id.toString(), name: user.name, email: user.email };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};
