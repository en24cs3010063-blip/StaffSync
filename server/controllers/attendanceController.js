const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const Department = require('../models/Department');

// Format Date to YYYY-MM-DD
const formatDateStr = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

/**
 * @desc    Employee Check-In
 * @route   POST /api/attendance/check-in
 * @access  Private
 */
exports.checkIn = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const todayStr = formatDateStr();

    // Check if already checked in today
    const existing = await Attendance.findOne({
      employee: employee._id,
      date: todayStr,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in for today (' + todayStr + ') at ' + new Date(existing.checkIn).toLocaleTimeString(),
        data: existing,
      });
    }

    const { note } = req.body;

    const attendance = await Attendance.create({
      employee: employee._id,
      user: req.user._id,
      date: todayStr,
      checkIn: new Date(),
      status: 'Present',
      checkInNote: note || '',
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json({
      success: true,
      message: 'Check-in successful! Have a great workday.',
      data: attendance,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in for today.',
      });
    }
    next(error);
  }
};

/**
 * @desc    Employee Check-Out
 * @route   POST /api/attendance/check-out
 * @access  Private
 */
exports.checkOut = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const todayStr = formatDateStr();

    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: todayStr,
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'You have not checked in yet today. Please check in first.',
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out today at ' + new Date(attendance.checkOut).toLocaleTimeString(),
        data: attendance,
      });
    }

    const checkOutTime = new Date();
    const durationMs = checkOutTime.getTime() - new Date(attendance.checkIn).getTime();
    const workHours = Number((durationMs / (1000 * 60 * 60)).toFixed(2));

    const { note } = req.body;

    attendance.checkOut = checkOutTime;
    attendance.workHours = workHours;
    if (note) attendance.checkOutNote = note;

    // If worked less than 4 hours, mark as Half-Day
    if (workHours < 4) {
      attendance.status = 'Half-Day';
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: `Checked out successfully! Total work hours today: ${workHours} hrs.`,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get today's attendance status for logged-in user
 * @route   GET /api/attendance/today
 * @access  Private
 */
exports.getTodayStatus = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(200).json({ success: true, data: null });
    }

    const todayStr = formatDateStr();
    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: todayStr,
    });

    res.status(200).json({
      success: true,
      data: attendance || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get attendance history for logged-in employee
 * @route   GET /api/attendance/my-history
 * @access  Private
 */
exports.getMyAttendance = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const { month, year } = req.query;
    let query = { employee: employee._id };

    if (month && year) {
      const paddedMonth = String(month).padStart(2, '0');
      query.date = { $regex: `^${year}-${paddedMonth}` };
    }

    const records = await Attendance.find(query).sort({ date: -1 }).limit(100);

    // Calculate summary statistics
    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === 'Present').length;
    const halfDays = records.filter(r => r.status === 'Half-Day').length;
    const totalHours = Number(records.reduce((acc, r) => acc + (r.workHours || 0), 0).toFixed(1));

    res.status(200).json({
      success: true,
      summary: {
        totalDays,
        presentDays,
        halfDays,
        totalHours,
        avgHoursPerDay: totalDays > 0 ? Number((totalHours / totalDays).toFixed(1)) : 0,
      },
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get team attendance for Manager
 * @route   GET /api/attendance/team
 * @access  Private (Manager & Admin)
 */
exports.getTeamAttendance = async (req, res, next) => {
  try {
    const { date = formatDateStr() } = req.query;

    // Find employees who report to this manager
    let teamEmployees;
    if (req.user.role === 'admin') {
      teamEmployees = await Employee.find().populate('user', 'name email avatar').populate('department', 'name code');
    } else {
      const managerDept = await Department.findOne({ manager: req.user._id });
      teamEmployees = await Employee.find({
        $or: [
          { manager: req.user._id },
          ...(managerDept ? [{ department: managerDept._id }] : []),
        ],
      }).populate('user', 'name email avatar').populate('department', 'name code');
    }

    const employeeIds = teamEmployees.map(e => e._id);

    // Find attendance records for these employees on that date
    const attendanceRecords = await Attendance.find({
      employee: { $in: employeeIds },
      date,
    });

    const attendanceMap = new Map();
    attendanceRecords.forEach(att => attendanceMap.set(String(att.employee), att));

    // Combine into report
    const teamReport = teamEmployees.map(emp => {
      const att = attendanceMap.get(String(emp._id));
      return {
        employee: emp,
        attendance: att || {
          status: 'Absent',
          checkIn: null,
          checkOut: null,
          workHours: 0,
        },
      };
    });

    const presentCount = attendanceRecords.filter(a => a.status === 'Present' || a.status === 'Half-Day').length;
    const absentCount = teamEmployees.length - presentCount;

    res.status(200).json({
      success: true,
      date,
      totalTeam: teamEmployees.length,
      presentCount,
      absentCount,
      data: teamReport,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get organization-wide attendance for HR/Admin
 * @route   GET /api/attendance/organization
 * @access  Private (Admin / HR)
 */
exports.getOrganizationAttendance = async (req, res, next) => {
  try {
    const { date = formatDateStr(), department, status } = req.query;

    let empQuery = {};
    if (department) empQuery.department = department;

    const employees = await Employee.find(empQuery)
      .populate('user', 'name email avatar')
      .populate('department', 'name code')
      .populate('manager', 'name');

    const empIds = employees.map(e => e._id);

    let attQuery = { employee: { $in: empIds }, date };
    if (status) attQuery.status = status;

    const attendanceRecords = await Attendance.find(attQuery)
      .populate('user', 'name email')
      .populate({
        path: 'employee',
        populate: { path: 'department', select: 'name code' },
      });

    // Summary counters
    const totalEmployees = employees.length;
    const presentCount = attendanceRecords.filter(a => a.status === 'Present').length;
    const halfDayCount = attendanceRecords.filter(a => a.status === 'Half-Day').length;
    const absentCount = Math.max(0, totalEmployees - (presentCount + halfDayCount));

    res.status(200).json({
      success: true,
      date,
      summary: {
        totalEmployees,
        presentCount,
        halfDayCount,
        absentCount,
        attendanceRate: totalEmployees > 0 ? Number((((presentCount + halfDayCount) / totalEmployees) * 100).toFixed(1)) : 0,
      },
      data: attendanceRecords,
    });
  } catch (error) {
    next(error);
  }
};
