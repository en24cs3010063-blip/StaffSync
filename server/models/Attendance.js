const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
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
    date: {
      type: String, // Stored as "YYYY-MM-DD"
      required: true,
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    workHours: {
      type: Number,
      default: 0, // In hours (e.g., 8.25)
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Half-Day', 'On Leave'],
      default: 'Present',
    },
    checkInNote: {
      type: String,
      trim: true,
      default: '',
    },
    checkOutNote: {
      type: String,
      trim: true,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to strictly prevent duplicate attendance records for an employee on the same date
AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ user: 1, date: 1 });
AttendanceSchema.index({ date: 1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);
