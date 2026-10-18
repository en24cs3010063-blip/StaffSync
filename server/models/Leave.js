const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema(
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
    leaveType: {
      type: String,
      enum: ['annual', 'sick', 'casual', 'maternityPaternity', 'unpaid'],
      required: [true, 'Please specify leave type'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    days: {
      type: Number,
      required: true,
      min: [0.5, 'Leave duration must be at least 0.5 days'],
    },
    reason: {
      type: String,
      required: [true, 'Please provide reason for leave'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

LeaveSchema.index({ employee: 1, startDate: 1, endDate: 1 });
LeaveSchema.index({ status: 1 });

module.exports = mongoose.model('Leave', LeaveSchema);
