const Training = require('../models/Training');
const Employee = require('../models/Employee');
const { createNotification } = require('../services/notificationService');

/**
 * @desc    Get trainings (all for admin/manager; personal assigned for employee)
 * @route   GET /api/trainings
 * @access  Private
 */
exports.getTrainings = async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = {};

    if (category) query.category = category;

    // If employee role, filter to trainings where user is assigned
    if (req.user.role === 'employee') {
      query['assignedEmployees.user'] = req.user._id;
    }

    const trainings = await Training.find(query)
      .populate('createdBy', 'name email role')
      .populate('assignedEmployees.employee', 'employeeId designation department')
      .populate('assignedEmployees.user', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: trainings.length,
      data: trainings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single training
 * @route   GET /api/trainings/:id
 * @access  Private
 */
exports.getTrainingById = async (req, res, next) => {
  try {
    const training = await Training.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate({
        path: 'assignedEmployees.employee',
        select: 'employeeId designation department',
        populate: { path: 'department', select: 'name code' },
      })
      .populate('assignedEmployees.user', 'name email avatar');

    if (!training) {
      return res.status(404).json({ success: false, message: 'Training program not found' });
    }

    res.status(200).json({ success: true, data: training });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new training program
 * @route   POST /api/trainings
 * @access  Private (Admin & Manager)
 */
exports.createTraining = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      instructor,
      estimatedHours,
      startDate,
      endDate,
      resources,
      assignedEmployeeIds,
    } = req.body;

    let assignedEmployees = [];
    if (Array.isArray(assignedEmployeeIds) && assignedEmployeeIds.length > 0) {
      const emps = await Employee.find({ _id: { $in: assignedEmployeeIds } });
      assignedEmployees = emps.map(emp => ({
        employee: emp._id,
        user: emp.user,
        status: 'Not Started',
        progressPercentage: 0,
        assignedAt: new Date(),
      }));
    }

    const training = await Training.create({
      title,
      description,
      category: category || 'Technical',
      instructor: instructor || 'StaffSync Learning Hub',
      estimatedHours: estimatedHours || 5,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      resources: resources || [],
      assignedEmployees,
      createdBy: req.user._id,
    });

    // Notify assigned employees
    if (assignedEmployees.length > 0) {
      for (const item of assignedEmployees) {
        await createNotification({
          recipient: item.user,
          title: 'New Training Assigned',
          message: `You have been enrolled in the training: "${title}".`,
          type: 'training',
          link: '/training-management',
        });
      }
    }

    const populated = await Training.findById(training._id)
      .populate('createdBy', 'name email')
      .populate('assignedEmployees.user', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Training program created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign employees to training
 * @route   POST /api/trainings/:id/assign
 * @access  Private (Admin & Manager)
 */
exports.assignEmployees = async (req, res, next) => {
  try {
    const { employeeIds } = req.body;
    const training = await Training.findById(req.params.id);

    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }

    const employees = await Employee.find({ _id: { $in: employeeIds } });
    const existingEmployeeIds = new Set(training.assignedEmployees.map(a => String(a.employee)));

    const newlyAssigned = [];
    for (const emp of employees) {
      if (!existingEmployeeIds.has(String(emp._id))) {
        training.assignedEmployees.push({
          employee: emp._id,
          user: emp.user,
          status: 'Not Started',
          progressPercentage: 0,
          assignedAt: new Date(),
        });
        newlyAssigned.push(emp.user);
      }
    }

    await training.save();

    // Send notifications to newly assigned
    for (const userId of newlyAssigned) {
      await createNotification({
        recipient: userId,
        title: 'New Training Assigned',
        message: `You have been enrolled in the training: "${training.title}".`,
        type: 'training',
        link: '/training-management',
      });
    }

    const updated = await Training.findById(training._id)
      .populate('assignedEmployees.employee', 'employeeId designation')
      .populate('assignedEmployees.user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: `Assigned ${newlyAssigned.length} employee(s) to training`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update employee's own training progress
 * @route   PATCH /api/trainings/:id/progress
 * @access  Private
 */
exports.updateProgress = async (req, res, next) => {
  try {
    const { progressPercentage, status, feedback } = req.body;
    const training = await Training.findById(req.params.id);

    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }

    const assignment = training.assignedEmployees.find(
      a => String(a.user) === String(req.user._id)
    );

    if (!assignment && req.user.role === 'employee') {
      return res.status(403).json({ success: false, message: 'You are not enrolled in this training program.' });
    }

    if (assignment) {
      if (progressPercentage !== undefined) {
        assignment.progressPercentage = Number(progressPercentage);
        if (assignment.progressPercentage === 100) {
          assignment.status = 'Completed';
          assignment.completionDate = new Date();
        } else if (assignment.progressPercentage > 0) {
          assignment.status = 'In Progress';
        }
      }
      if (status) assignment.status = status;
      if (feedback) assignment.feedback = feedback;
    }

    await training.save();

    res.status(200).json({
      success: true,
      message: 'Training progress updated successfully',
      data: training,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update training details
 * @route   PUT /api/trainings/:id
 * @access  Private (Admin & Manager)
 */
exports.updateTraining = async (req, res, next) => {
  try {
    const training = await Training.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Training updated successfully',
      data: training,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete training program
 * @route   DELETE /api/trainings/:id
 * @access  Private (Admin only)
 */
exports.deleteTraining = async (req, res, next) => {
  try {
    const training = await Training.findByIdAndDelete(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Training program removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
