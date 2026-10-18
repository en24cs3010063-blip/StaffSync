const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const { createNotification } = require('../services/notificationService');

// Helper to calculate days between dates (inclusive)
const calculateLeaveDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

/**
 * @desc    Apply for leave
 * @route   POST /api/leaves
 * @access  Private
 */
exports.applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    const employee = await Employee.findOne({ user: req.user._id }).populate('manager');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({ success: false, message: 'End date cannot be earlier than start date.' });
    }

    const days = calculateLeaveDays(start, end);

    // Check leave balance (unless unpaid)
    if (leaveType !== 'unpaid') {
      const balance = employee.leaveBalances[leaveType];
      if (!balance) {
        return res.status(400).json({ success: false, message: `Invalid leave type: ${leaveType}` });
      }
      const remaining = balance.total - balance.used;
      if (remaining < days) {
        return res.status(400).json({
          success: false,
          message: `Insufficient ${leaveType} leave balance. Requested: ${days} day(s), Available: ${remaining} day(s).`,
        });
      }
    }

    // Check for overlapping leaves for this employee
    const overlapping = await Leave.findOne({
      employee: employee._id,
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });

    if (overlapping) {
      return res.status(400).json({
        success: false,
        message: `You already have a ${overlapping.status} leave request covering overlapping dates (${new Date(overlapping.startDate).toLocaleDateString()} to ${new Date(overlapping.endDate).toLocaleDateString()}).`,
      });
    }

    const leave = await Leave.create({
      employee: employee._id,
      user: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      days,
      reason,
      status: 'Pending',
    });

    // Notify manager if assigned, or HR
    if (employee.manager) {
      await createNotification({
        recipient: employee.manager._id || employee.manager,
        title: 'New Leave Request',
        message: `${req.user.name} submitted a ${days}-day ${leaveType} leave request.`,
        type: 'leave',
        link: '/leave-management',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully.',
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's leave requests and balance
 * @route   GET /api/leaves/my-leaves
 * @access  Private
 */
exports.getMyLeaves = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const leaves = await Leave.find({ employee: employee._id })
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      balances: employee.leaveBalances,
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get leaves for review (Manager gets team requests; HR/Admin gets all)
 * @route   GET /api/leaves
 * @access  Private (Manager & Admin)
 */
exports.getLeaves = async (req, res, next) => {
  try {
    const { status, leaveType } = req.query;
    let query = {};

    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;

    if (req.user.role === 'manager') {
      const managerDept = await Department.findOne({ manager: req.user._id });
      const teamEmployees = await Employee.find({
        $or: [
          { manager: req.user._id },
          ...(managerDept ? [{ department: managerDept._id }] : []),
        ],
      });
      const teamEmployeeIds = teamEmployees.map(e => e._id);
      query.employee = { $in: teamEmployeeIds };
    }

    const leaves = await Leave.find(query)
      .populate('user', 'name email avatar')
      .populate({
        path: 'employee',
        populate: { path: 'department', select: 'name code' },
      })
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Review leave (Approve or Reject)
 * @route   PATCH /api/leaves/:id/review
 * @access  Private (Manager & Admin)
 */
exports.reviewLeave = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Approved or Rejected' });
    }

    if (status === 'Rejected' && (!rejectionReason || rejectionReason.trim() === '')) {
      return res.status(400).json({ success: false, message: 'Please provide a reason for rejecting the leave request.' });
    }

    const leave = await Leave.findById(req.params.id)
      .populate('employee')
      .populate('user', 'name email');

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `This leave request is already ${leave.status.toLowerCase()}.`,
      });
    }

    // Role verification: Manager can only approve their team's requests
    if (req.user.role === 'manager') {
      const employee = await Employee.findById(leave.employee._id);
      if (String(employee.manager) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: 'Not authorized to review leave for this employee.' });
      }
    }

    // If approving, deduct balance from employee profile
    if (status === 'Approved' && leave.leaveType !== 'unpaid') {
      const employee = await Employee.findById(leave.employee._id);
      if (employee) {
        const currentUsed = employee.leaveBalances[leave.leaveType]?.used || 0;
        employee.leaveBalances[leave.leaveType].used = currentUsed + leave.days;
        await employee.save();
      }
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewDate = new Date();
    if (rejectionReason) leave.rejectionReason = rejectionReason;

    await leave.save();

    // Send notification to employee
    await createNotification({
      recipient: leave.user._id,
      title: `Leave Request ${status}`,
      message: `Your ${leave.leaveType} leave request for ${new Date(leave.startDate).toLocaleDateString()} has been ${status.toLowerCase()} by ${req.user.name}.${status === 'Rejected' ? ` Reason: ${rejectionReason}` : ''}`,
      type: 'leave',
      link: '/leave-management',
    });

    res.status(200).json({
      success: true,
      message: `Leave request has been ${status.toLowerCase()} successfully.`,
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a pending leave request (by the applicant)
 * @route   PATCH /api/leaves/:id/cancel
 * @access  Private
 */
exports.cancelLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (String(leave.user) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this leave request.' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a leave request that has already been ${leave.status.toLowerCase()}.`,
      });
    }

    leave.status = 'Cancelled';
    await leave.save();

    res.status(200).json({
      success: true,
      message: 'Leave request cancelled successfully.',
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};
