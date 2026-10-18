const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Training = require('../models/Training');

const formatDateStr = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

/**
 * @desc    Get HR / Admin Dashboard Overview Analytics
 * @route   GET /api/analytics/admin
 * @access  Private (Admin)
 */
exports.getAdminAnalytics = async (req, res, next) => {
  try {
    const todayStr = formatDateStr();

    // 1. Employee counts
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'Active' });
    const totalManagers = await User.countDocuments({ role: 'manager', isActive: true });
    const totalDepartments = await Department.countDocuments();

    // 2. Attendance today
    const presentToday = await Attendance.countDocuments({
      date: todayStr,
      status: { $in: ['Present', 'Half-Day'] },
    });
    const absentToday = Math.max(0, totalEmployees - presentToday);

    // 3. Pending Leaves
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });

    // 4. Department-wise employee counts
    const departments = await Department.find();
    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const count = await Employee.countDocuments({ department: dept._id });
        return {
          id: dept._id,
          name: dept.name,
          code: dept.code,
          count,
        };
      })
    );

    // 5. Attendance Trend for last 7 days
    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      past7Days.push(formatDateStr(d));
    }

    const attendanceTrend = await Promise.all(
      past7Days.map(async (dateStr) => {
        const present = await Attendance.countDocuments({
          date: dateStr,
          status: 'Present',
        });
        const halfDay = await Attendance.countDocuments({
          date: dateStr,
          status: 'Half-Day',
        });
        const dayLabel = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        return {
          date: dateStr,
          day: dayLabel,
          present,
          halfDay,
          total: present + halfDay,
        };
      })
    );

    // 6. Leave status distribution
    const leaveStats = {
      approved: await Leave.countDocuments({ status: 'Approved' }),
      pending: pendingLeaves,
      rejected: await Leave.countDocuments({ status: 'Rejected' }),
    };

    // 7. Recent activities
    const recentLeaves = await Leave.find()
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentEmployees = await Employee.find()
      .populate('user', 'name email avatar')
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalEmployees,
        activeEmployees,
        totalManagers,
        totalDepartments,
        presentToday,
        absentToday,
        pendingLeaves,
        attendanceRateToday: totalEmployees > 0 ? Number(((presentToday / totalEmployees) * 100).toFixed(1)) : 0,
      },
      departmentStats,
      attendanceTrend,
      leaveStats,
      recentLeaves,
      recentEmployees,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Manager Dashboard Analytics
 * @route   GET /api/analytics/manager
 * @access  Private (Manager & Admin)
 */
exports.getManagerAnalytics = async (req, res, next) => {
  try {
    const todayStr = formatDateStr();

    // Find team employees
    const managerDept = await Department.findOne({ manager: req.user._id });
    const teamEmployees = await Employee.find({
      $or: [
        { manager: req.user._id },
        ...(managerDept ? [{ department: managerDept._id }] : []),
      ],
    }).populate('user', 'name email avatar').populate('department', 'name code');

    const teamIds = teamEmployees.map(e => e._id);

    // Attendance today for team
    const teamAttendanceToday = await Attendance.find({
      employee: { $in: teamIds },
      date: todayStr,
    });

    const presentCount = teamAttendanceToday.filter(a => a.status === 'Present' || a.status === 'Half-Day').length;
    const absentCount = teamEmployees.length - presentCount;

    // Pending team leaves
    const pendingTeamLeaves = await Leave.find({
      employee: { $in: teamIds },
      status: 'Pending',
    }).populate('user', 'name email avatar');

    // Training programs assigned to team
    const trainings = await Training.find({
      'assignedEmployees.employee': { $in: teamIds },
    });

    let completedTrainingsCount = 0;
    let totalAssignments = 0;

    trainings.forEach(t => {
      t.assignedEmployees.forEach(a => {
        if (teamIds.some(id => String(id) === String(a.employee))) {
          totalAssignments++;
          if (a.status === 'Completed') completedTrainingsCount++;
        }
      });
    });

    res.status(200).json({
      success: true,
      stats: {
        totalTeamMembers: teamEmployees.length,
        presentToday: presentCount,
        absentToday: absentCount,
        pendingLeaves: pendingTeamLeaves.length,
        teamAttendanceRate: teamEmployees.length > 0 ? Number(((presentCount / teamEmployees.length) * 100).toFixed(1)) : 0,
        trainingCompletionRate: totalAssignments > 0 ? Number(((completedTrainingsCount / totalAssignments) * 100).toFixed(1)) : 0,
      },
      teamMembers: teamEmployees,
      pendingLeaves: pendingTeamLeaves,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Employee Dashboard Analytics
 * @route   GET /api/analytics/employee
 * @access  Private
 */
exports.getEmployeeAnalytics = async (req, res, next) => {
  try {
    const todayStr = formatDateStr();
    const employee = await Employee.findOne({ user: req.user._id })
      .populate('department', 'name code')
      .populate('manager', 'name email');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    // Today's attendance
    const todayAttendance = await Attendance.findOne({
      employee: employee._id,
      date: todayStr,
    });

    // Attendance past 30 days
    const attendanceRecords = await Attendance.find({
      employee: employee._id,
    }).sort({ date: -1 }).limit(30);

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(a => a.status === 'Present').length;
    const totalHours = Number(attendanceRecords.reduce((sum, a) => sum + (a.workHours || 0), 0).toFixed(1));

    // Leaves
    const leaves = await Leave.find({ employee: employee._id }).sort({ createdAt: -1 });
    const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
    const approvedLeaves = leaves.filter(l => l.status === 'Approved').length;

    // Trainings
    const trainings = await Training.find({
      'assignedEmployees.user': req.user._id,
    });

    const pendingTrainings = trainings.filter(t => {
      const a = t.assignedEmployees.find(emp => String(emp.user) === String(req.user._id));
      return a && a.status !== 'Completed';
    }).length;

    res.status(200).json({
      success: true,
      employee,
      todayAttendance,
      stats: {
        totalDaysLogged: totalDays,
        presentDays,
        totalHoursLogged: totalHours,
        pendingLeaves,
        approvedLeaves,
        pendingTrainings,
      },
      recentAttendance: attendanceRecords.slice(0, 7),
      recentLeaves: leaves.slice(0, 5),
    });
  } catch (error) {
    next(error);
  }
};
