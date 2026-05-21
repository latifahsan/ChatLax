import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import rateLimit from 'express-rate-limit';

import { connectDB } from './config/database';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import chatRoutes from './routes/chats';
import messageRoutes from './routes/messages';
import uploadRoutes from './routes/uploads';
import { setupSocket } from './socket';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

if (process.env.NODE_ENV === 'production') {
  const required = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL'];
  for (const key of required) {
    if (!process.env[key]) {
      console.error(`Missing required env var: ${key}`);
      process.exit(1);
    }
  }
}

const app = express();
const httpServer = createServer(app);

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',').map(o => o.trim());

const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV !== 'production' &&
    ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.ip || ''),
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 200,
  message: { message: 'Too many auth attempts, please try again later.' },
});
app.use('/api/auth/', authLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));
else app.use(morgan('combined'));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/uploads', uploadRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

setupSocket(io);
app.use(errorHandler);

const PORT = parseInt(process.env.PORT || '5000', 10);

const start = async () => {
  await connectDB();
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 ChatLax Server on port ${PORT} [${process.env.NODE_ENV}]`);
    console.log(`🔗 Origins: ${allowedOrigins.join(', ')}\n`);
  });
};

start().catch((err) => { console.error('Startup failed:', err); process.exit(1); });

export { io };
