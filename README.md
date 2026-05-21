# Chatlax

**A premium, production-ready realtime messaging platform.**

Built with Next.js, Node.js, Socket.IO, and MongoDB — Chatlax delivers the polish of WhatsApp and Telegram with a cleaner, more refined dark aesthetic.

---

## ✨ Features

### Authentication
- Google OAuth 2.0 (one-click sign-in)
- Email + password with JWT sessions
- Persistent login via localStorage + Zustand
- Protected routes with automatic redirect

### Messaging
- **Realtime** private and group chat via Socket.IO
- **Typing indicators** — see when others are composing
- **Online/Offline status** with last-seen timestamps
- **Read receipts** — double-tick like WhatsApp
- **Reply to message** — threaded context in any chat
- **Edit & delete** messages (for everyone)
- **Emoji reactions** — quick-react on any message
- **Image & file upload** — drag-drop or attach
- **Pinned messages** — surface key info in any chat
- **Message search** — find anything fast
- **Infinite scroll** with paginated history

### Groups
- Create group chats with custom names
- Admin roles and group management
- System messages for group events
- Member list and group info panel

### User Profiles
- Avatar upload
- Display name & status text
- Online presence broadcasting

### UI/UX
- **Dark mode premium** design — charcoal, white, subtle grays
- **Glassmorphism** accents and soft shadows
- **Framer Motion** transitions throughout
- **Skeleton loaders** for all async states
- **Toast notifications** for all actions
- **Fully responsive** — desktop, tablet, mobile
- **PWA** — installable on mobile and desktop

---

## 🏗️ Architecture

```
chatlax/
├── client/                     # Next.js 14 frontend
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── login/          # Auth pages
│   │   │   ├── register/
│   │   │   └── chat/           # Protected chat area
│   │   │       └── [chatId]/   # Dynamic chat page
│   │   ├── components/
│   │   │   └── chat/           # Sidebar, MessageList, Input, Modals
│   │   ├── hooks/              # useSocket, custom hooks
│   │   ├── lib/                # api.ts, socket.ts
│   │   ├── stores/             # Zustand: authStore, chatStore
│   │   └── types/              # Shared TypeScript types
│   └── public/                 # Static assets + PWA manifest
│
└── server/                     # Express + Socket.IO backend
    └── src/
        ├── config/             # database.ts
        ├── controllers/        # auth, chat, message, user
        ├── middleware/         # auth.ts, errorHandler.ts
        ├── models/             # User, Chat, Message (Mongoose)
        ├── routes/             # REST API routes
        └── socket/             # Socket.IO event handlers
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google OAuth credentials

### 1. Clone & install

```bash
git clone https://github.com/yourusername/chatlax.git
cd chatlax

# Install all dependencies
npm run install:all
```

### 2. Configure the server

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatlax
JWT_SECRET=your_very_long_secret_here
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:3000
```

### 3. Configure the client

```bash
cd client
cp .env.example .env.local
```

Edit `client/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### 4. Run in development

```bash
# From root (runs both simultaneously)
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Health check**: http://localhost:5000/health

---

## 🔑 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → **APIs & Services** → **Credentials**
3. Create **OAuth 2.0 Client ID** (Web application)
4. Add authorized origins:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
5. Copy the **Client ID** and **Client Secret** into your `.env` files

---

## 🌍 Deployment

### Backend → Render

1. Push to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Set build command: `cd server && npm install && npm run build`
4. Set start command: `cd server && npm start`
5. Add all environment variables from `server/.env.example`

### Frontend → Vercel

1. Import GitHub repo to [Vercel](https://vercel.com)
2. Set **Root Directory** to `client`
3. Add environment variables from `client/.env.example`
4. Update `CLIENT_URL` on Render to your Vercel domain

### Database → MongoDB Atlas

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Add your Render server IP to the IP allowlist
3. Get the connection string and set it as `MONGODB_URI`

---

## 🧱 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/google` | Google OAuth login |
| POST | `/api/auth/register` | Email registration |
| POST | `/api/auth/login` | Email login |
| GET | `/api/auth/me` | Get current user |

### Chats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chats` | Get all user chats |
| POST | `/api/chats/private` | Get or create private chat |
| POST | `/api/chats/group` | Create group chat |
| PUT | `/api/chats/:id` | Update group info |
| PUT | `/api/chats/:id/pin` | Pin/unpin message |
| GET | `/api/chats/search/users` | Search users |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/:chatId` | Get messages (paginated) |
| POST | `/api/messages/:chatId` | Send message |
| PUT | `/api/messages/:id` | Edit message |
| DELETE | `/api/messages/:id` | Delete message |
| POST | `/api/messages/:id/react` | Add reaction |
| POST | `/api/messages/:chatId/read` | Mark as read |

### Socket Events

**Client → Server**
- `chats:join` — Join all chat rooms on connect
- `chat:join` / `chat:leave` — Join/leave specific chat
- `typing:start` / `typing:stop` — Typing indicator

**Server → Client**
- `message:new` — New message received
- `message:edited` — Message was edited
- `message:deleted` — Message was deleted
- `message:reaction` — Reaction added/removed
- `messages:read` — Messages marked as read
- `typing:start` / `typing:stop` — Typing indicator from others
- `user:online` / `user:offline` — Presence updates

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| State | Zustand + Immer |
| Backend | Node.js, Express.js, TypeScript |
| Realtime | Socket.IO 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT, Google OAuth 2.0 |
| Upload | Multer |
| PWA | next-pwa |
| Deployment | Vercel + Render + MongoDB Atlas |

---

## 📁 Environment Variables

### Server (`server/.env`)

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs (long random string) |
| `JWT_EXPIRES_IN` | Token expiry (default: `7d`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `CLIENT_URL` | Frontend URL for CORS |

### Client (`client/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server URL |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID |

---

## 📜 License

MIT — free to use, fork, and build upon.

---

Built with precision. Designed for clarity.
