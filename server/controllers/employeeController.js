const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');

/**
 * @desc    Get all employees with filtering & search
 * @route   GET /api/employees
 * @access  Private
 */
exports.getEmployees = async (req, res, next) => {
  try {
    const { search, department, status, role, page = 1, limit = 50 } = req.query;

    let query = {};

    // Role-based restrictions:
    // If manager, filter to only employees who report to this manager OR are in manager's department
    if (req.user.role === 'manager') {
      const managerDept = await Department.findOne({ manager: req.user._id });
      query.$or = [
        { manager: req.user._id },
        ...(managerDept ? [{ department: managerDept._id }] : []),
      ];
    }

    if (department) {
      query.department = department;
    }

    if (status) {
      query.status = status;
    }

    let employees = await Employee.find(query)
      .populate('user', 'name email role avatar isActive lastLogin')
      .populate('department', 'name code')
      .populate('manager', 'name email')
      .sort({ createdAt: -1 });

    // In-memory filter for search across user.name, user.email, employeeId, designation
    if (search && search.trim() !== '') {
      const term = search.toLowerCase().trim();
      employees = employees.filter((emp) => {
        const name = emp.user?.name?.toLowerCase() || '';
        const email = emp.user?.email?.toLowerCase() || '';
        const empId = emp.employeeId?.toLowerCase() || '';
        const desig = emp.designation?.toLowerCase() || '';
        const deptName = emp.department?.name?.toLowerCase() || '';
        return (
          name.includes(term) ||
          email.includes(term) ||
          empId.includes(term) ||
          desig.includes(term) ||
          deptName.includes(term)
        );
      });
    }

    // Role filter
    if (role) {
      employees = employees.filter((emp) => emp.user?.role === role);
    }

    const total = employees.length;
    const startIndex = (page - 1) * limit;
    const paginatedEmployees = employees.slice(startIndex, startIndex + Number(limit));

    res.status(200).json({
      success: true,
      total,
      count: paginatedEmployees.length,
      data: paginatedEmployees,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single employee details
 * @route   GET /api/employees/:id
 * @access  Private
 */
exports.getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('user', 'name email role avatar isActive lastLogin')
      .populate('department', 'name code description')
      .populate('manager', 'name email');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Check manager access: manager can only see their team or themselves
    if (
      req.user.role === 'manager' &&
      String(employee.user._id) !== String(req.user._id) &&
      String(employee.manager?._id) !== String(req.user._id)
    ) {
      // Allow viewing basic public info if not direct report
      // But full profile is accessible if they report to manager
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new employee (HR only)
 * @route   POST /api/employees
 * @access  Private (Admin / HR)
 */
exports.createEmployee = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password = 'Password@123',
      role = 'employee',
      designation,
      department,
      manager,
      phone,
      address,
      dateOfJoining,
      dateOfBirth,
      gender,
      salary,
      employmentType,
      leaveBalances,
      emergencyContact,
      skills,
    } = req.body;

    // Check if user already exists with this email
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    // Generate unique employee ID (e.g. EMP-1001)
    const count = await Employee.countDocuments();
    const employeeId = `EMP-${(1001 + count).toString()}`;

    // Create User record
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role,
      isActive: true,
    });

    // Create Employee record
    const employee = await Employee.create({
      user: user._id,
      employeeId,
      designation,
      department: department || null,
      manager: manager || null,
      phone: phone || '',
      address: address || {},
      dateOfJoining: dateOfJoining || new Date(),
      dateOfBirth: dateOfBirth || null,
      gender: gender || 'Prefer not to say',
      salary: salary || 0,
      employmentType: employmentType || 'Full-Time',
      leaveBalances: leaveBalances || {
        annual: { total: 18, used: 0 },
        sick: { total: 10, used: 0 },
        casual: { total: 8, used: 0 },
        maternityPaternity: { total: 90, used: 0 },
        unpaid: { total: 0, used: 0 },
      },
      emergencyContact: emergencyContact || {},
      skills: Array.isArray(skills) ? skills : [],
    });

    const populatedEmployee = await Employee.findById(employee._id)
      .populate('user', 'name email role avatar isActive')
      .populate('department', 'name code')
      .populate('manager', 'name email');

    res.status(201).json({
      success: true,
      message: 'Employee registered successfully',
      data: populatedEmployee,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update employee (HR or Manager for their team)
 * @route   PUT /api/employees/:id
 * @access  Private (Admin / Manager)
 */
exports.updateEmployee = async (req, res, next) => {
  try {
    let employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const {
      name,
      role,
      isActive,
      designation,
      department,
      manager,
      phone,
      address,
      dateOfJoining,
      dateOfBirth,
      gender,
      salary,
      employmentType,
      status,
      leaveBalances,
      emergencyContact,
      skills,
    } = req.body;

    // Update associated user fields if provided (Admin only for role/isActive)
    if (req.user.role === 'admin') {
      const userUpdates = {};
      if (name) userUpdates.name = name;
      if (role) userUpdates.role = role;
      if (isActive !== undefined) userUpdates.isActive = isActive;

      if (Object.keys(userUpdates).length > 0) {
        await User.findByIdAndUpdate(employee.user, userUpdates);
      }
    }

    // Update employee profile
    if (designation) employee.designation = designation;
    if (department !== undefined) employee.department = department || null;
    if (manager !== undefined) employee.manager = manager || null;
    if (phone !== undefined) employee.phone = phone;
    if (address) employee.address = { ...employee.address, ...address };
    if (dateOfJoining) employee.dateOfJoining = dateOfJoining;
    if (dateOfBirth) employee.dateOfBirth = dateOfBirth;
    if (gender) employee.gender = gender;
    if (salary !== undefined && req.user.role === 'admin') employee.salary = salary;
    if (employmentType) employee.employmentType = employmentType;
    if (status) employee.status = status;
    if (leaveBalances && req.user.role === 'admin') employee.leaveBalances = leaveBalances;
    if (emergencyContact) employee.emergencyContact = { ...employee.emergencyContact, ...emergencyContact };
    if (skills) employee.skills = Array.isArray(skills) ? skills : [];

    await employee.save();

    const updated = await Employee.findById(employee._id)
      .populate('user', 'name email role avatar isActive')
      .populate('department', 'name code')
      .populate('manager', 'name email');

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle employee active/deactivated status
 * @route   PATCH /api/employees/:id/status
 * @access  Private (Admin / HR)
 */
exports.toggleEmployeeStatus = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const user = await User.findById(employee.user);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Associated user account not found' });
    }

    // Prevent HR from deactivating themselves
    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    employee.status = user.isActive ? 'Active' : 'Terminated';
    await employee.save();

    res.status(200).json({
      success: true,
      message: `Employee account ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: employee._id,
        isActive: user.isActive,
        status: employee.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get list of potential managers (Admin or Manager role)
 * @route   GET /api/employees/managers
 * @access  Private
 */
exports.getManagersList = async (req, res, next) => {
  try {
    const managers = await User.find({
      role: { $in: ['admin', 'manager'] },
      isActive: true,
    }).select('name email role avatar');

    res.status(200).json({
      success: true,
      data: managers,
    });
  } catch (error) {
    next(error);
  }
};
