import mongoose, { Schema, Document } from 'mongoose';
import { hashPassword, comparePassword } from '../../common/utils';
import { ROLES } from '../../common/constants';
import { RefreshTokenData } from '../../types';
import { string } from 'zod';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLogin?: Date;
  defaultPassword: string;
  refreshTokens: RefreshTokenData[];
  comparePassword(password: string): Promise<boolean>;
}

const refreshTokenSchema = new Schema({
  tokenHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  ip: String,
  ua: String,
}, { _id: false });

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    required: true,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  defaultPassword: {
    type: String,
    required: false,
    select: true,
  },
  lastLogin: Date,
  refreshTokens: [refreshTokenSchema],
}, {
  timestamps: true,
});

// Indexes
userSchema.index({ lastName: 1, firstName: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await hashPassword(this.password);
  next();
});

// Compare password method
userSchema.methods.comparePassword = function(password: string): Promise<boolean> {
  return comparePassword(password, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);