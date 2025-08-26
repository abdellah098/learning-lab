import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  name: string;
  contactPerson: string;
  contactEmail: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new Schema<IClient>({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true,
  },
  contactEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
}, {
  timestamps: true,
});

// Unique index for active clients with the same name
clientSchema.index({ name: 1, isActive: 1 }, { 
  unique: true,
  partialFilterExpression: { isActive: true }
});

export const Client = mongoose.model<IClient>('Client', clientSchema);