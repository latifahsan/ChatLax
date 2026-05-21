import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  _id: mongoose.Types.ObjectId;
  isGroup: boolean;
  name?: string;
  avatar?: string;
  description?: string;
  participants: mongoose.Types.ObjectId[];
  admins: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
  pinnedMessage?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  mutedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    isGroup: { type: Boolean, default: false },
    name: { type: String, trim: true, maxlength: 100 },
    avatar: { type: String, default: null },
    description: { type: String, maxlength: 500 },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message', default: null },
    pinnedMessage: { type: Schema.Types.ObjectId, ref: 'Message', default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    mutedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

ChatSchema.index({ participants: 1 });

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);
