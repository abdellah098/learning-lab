import { PROJECT_STATUS, TASK_STATUS } from '../../common/constants';
import mongoose, { Schema, Model, Types, Document } from 'mongoose';

export interface IObjective {
  _id?: Types.ObjectId;
  title: string;
  kpi: string;
  targetValue: number;
  currentValue: number;
}

export interface ITask {
  _id?: Types.ObjectId;
  name: string;
  description?: string;
  assigneeId?: Types.ObjectId;
  dueDate: Date;
  status: string;
  completedAt?: Date;
}

export interface IProject {
  _id?: Types.ObjectId;
  name: string;
  description?: string;
  channel: string;
  status: string;
  clientId: Types.ObjectId;
  teamMembers: Types.ObjectId[];
  objectives: Types.DocumentArray<IObjective>;
  tasks: Types.DocumentArray<ITask>;
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const objectiveSchema = new Schema<IObjective>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  kpi: {
    type: String,
    required: true,
    trim: true,
  },
  targetValue: {
    type: Number,
    required: true,
    min: 0,
  },
  currentValue: {
    type: Number,
    default: 0,
    min: 0,
  },
});

const taskSchema = new Schema<ITask>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  assigneeId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(TASK_STATUS),
    default: TASK_STATUS.PENDING,
    index: true,
  },
  completedAt: Date,
});

const projectSchema = new Schema<IProject>({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    trim: true,
  },
  channel: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: Object.values(PROJECT_STATUS),
    default: PROJECT_STATUS.DRAFT,
    index: true,
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true,
  },
  teamMembers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  }],
  objectives: [objectiveSchema],
  tasks: [taskSchema],
  startDate: Date,
  endDate: Date,
}, {
  timestamps: true,
});

// Text search index
projectSchema.index({ name: 'text', description: 'text' });

// Business logic hooks
taskSchema.pre('save', function() {
  if (this.isModified('status') && this.status === TASK_STATUS.COMPLETED && !this.completedAt) {
    this.completedAt = new Date();
  }
});

projectSchema.pre('save', function() {
  if (this.isModified('status') && this.status === PROJECT_STATUS.COMPLETED && !this.endDate) {
    this.endDate = new Date();
  }
  
  // Validate dueDate >= startDate for tasks
  if (this.startDate) {
    this.tasks.forEach(task => {
      if (task.dueDate < this.startDate!) {
        throw new Error(`Task "${task.name}" due date cannot be before project start date`);
      }
    });
  }
});

export const Project = mongoose.model<IProject>('Project', projectSchema);