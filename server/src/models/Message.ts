import mongoose, { Document, Schema } from 'mongoose';

export type MessageType = 'text' | 'image' | 'file' | 'system';

export interface IReaction {
  emoji: string;
  users: mongoose.Types.ObjectId[];
}

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  chat: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  type: MessageType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyTo?: mongoose.Types.ObjectId;
  readBy: mongoose.Types.ObjectId[];
  reactions: IReaction[];
  isEdited: boolean;
  isDeleted: boolean;
  deletedFor: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ReactionSchema = new Schema<IReaction>({
  emoji: { type: String, required: true },
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { _id: false });

const MessageSchema = new Schema<IMessage>(
  {
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, maxlength: 5000 },
    type: { type: String, enum: ['text', 'image', 'file', 'system'], default: 'text' },
    fileUrl: { type: String },
    fileName: { type: String },
    fileSize: { type: Number },
    replyTo: { type: Schema.Types.ObjectId, ref: 'Message', default: null },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    reactions: [ReactionSchema],
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedFor: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

MessageSchema.index({ chat: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });
MessageSchema.index({ content: 'text' });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
