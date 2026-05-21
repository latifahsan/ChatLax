import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  avatar?: string;
  status: string;
  googleId?: string;
  password?: string;
  isOnline: boolean;
  lastSeen: Date;
  pinnedChats: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    avatar: { type: String, default: null },
    status: { type: String, default: 'Hey there! I am using ChatLax.', maxlength: 150 },
    googleId: { type: String, sparse: true, unique: true },
    password: { type: String, minlength: 6 },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    pinnedChats: [{ type: Schema.Types.ObjectId, ref: 'Chat' }],
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ name: 'text' });

export const User = mongoose.model<IUser>('User', UserSchema);
