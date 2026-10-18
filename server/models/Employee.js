const mongoose = require('mongoose');

const LeaveBalanceSchema = new mongoose.Schema(
  {
    total: { type: Number, default: 0 },
    used: { type: Number, default: 0 },
  },
  { _id: false }
);

const EmployeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      country: { type: String, default: 'USA' },
    },
    dateOfJoining: {
      type: Date,
      default: Date.now,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Non-Binary', 'Other', 'Prefer not to say'],
      default: 'Prefer not to say',
    },
    salary: {
      type: Number,
      default: 0,
    },
    employmentType: {
      type: String,
      enum: ['Full-Time', 'Part-Time', 'Contract', 'Intern'],
      default: 'Full-Time',
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Probation', 'Terminated'],
      default: 'Active',
    },
    leaveBalances: {
      annual: { type: LeaveBalanceSchema, default: () => ({ total: 18, used: 0 }) },
      sick: { type: LeaveBalanceSchema, default: () => ({ total: 10, used: 0 }) },
      casual: { type: LeaveBalanceSchema, default: () => ({ total: 8, used: 0 }) },
      maternityPaternity: { type: LeaveBalanceSchema, default: () => ({ total: 90, used: 0 }) },
      unpaid: { type: LeaveBalanceSchema, default: () => ({ total: 0, used: 0 }) },
    },
    emergencyContact: {
      name: { type: String, default: '' },
      relationship: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    skills: [String],
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup
EmployeeSchema.index({ department: 1 });
EmployeeSchema.index({ manager: 1 });

module.exports = mongoose.model('Employee', EmployeeSchema);
