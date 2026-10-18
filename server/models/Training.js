const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['document', 'video', 'link', 'course'], default: 'link' },
  },
  { _id: false }
);

const AssignedEmployeeSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed'],
      default: 'Not Started',
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completionDate: {
      type: Date,
    },
    feedback: {
      type: String,
      default: '',
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const TrainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Training title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Technical', 'Compliance', 'Leadership', 'Soft Skills', 'Onboarding', 'Safety'],
      default: 'Technical',
    },
    instructor: {
      type: String,
      default: 'Internal HR / Learning Team',
    },
    estimatedHours: {
      type: Number,
      default: 5,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    resources: [ResourceSchema],
    assignedEmployees: [AssignedEmployeeSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

TrainingSchema.index({ 'assignedEmployees.user': 1 });
TrainingSchema.index({ category: 1 });

module.exports = mongoose.model('Training', TrainingSchema);
