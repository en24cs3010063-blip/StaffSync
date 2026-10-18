const Department = require('../models/Department');
const Employee = require('../models/Employee');

/**
 * @desc    Get all departments
 * @route   GET /api/departments
 * @access  Private (all authenticated users can view departments)
 */
exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find()
      .populate('manager', 'name email')
      .sort({ name: 1 });

    // Populate employee count for each department
    const departmentsWithCount = await Promise.all(
      departments.map(async (dept) => {
        const count = await Employee.countDocuments({ department: dept._id });
        const deptObj = dept.toObject();
        deptObj.employeeCount = count;
        return deptObj;
      })
    );

    res.status(200).json({
      success: true,
      count: departmentsWithCount.length,
      data: departmentsWithCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single department
 * @route   GET /api/departments/:id
 * @access  Private
 */
exports.getDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id).populate('manager', 'name email');
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const employeeCount = await Employee.countDocuments({ department: department._id });
    const employees = await Employee.find({ department: department._id }).populate('user', 'name email avatar role');

    const result = department.toObject();
    result.employeeCount = employeeCount;
    result.employees = employees;

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new department
 * @route   POST /api/departments
 * @access  Private (Admin / HR only)
 */
exports.createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, manager } = req.body;

    const existingCode = await Department.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.status(400).json({ success: false, message: 'Department code already exists' });
    }

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description,
      manager: manager || null,
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update department
 * @route   PUT /api/departments/:id
 * @access  Private (Admin / HR only)
 */
exports.updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('manager', 'name email');

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete department
 * @route   DELETE /api/departments/:id
 * @access  Private (Admin / HR only)
 */
exports.deleteDepartment = async (req, res, next) => {
  try {
    const employeeCount = await Employee.countDocuments({ department: req.params.id });
    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department: There are currently ${employeeCount} employee(s) assigned to it. Please reassign them first.`,
      });
    }

    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
