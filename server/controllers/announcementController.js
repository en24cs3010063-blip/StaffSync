const Announcement = require('../models/Announcement');
const User = require('../models/User');
const { notifyMany } = require('../services/notificationService');

/**
 * @desc    Get all announcements
 * @route   GET /api/announcements
 * @access  Private
 */
exports.getAnnouncements = async (req, res, next) => {
  try {
    const { category, priority } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (priority) {
      query.priority = priority;
    }

    const announcements = await Announcement.find(query)
      .populate('author', 'name email avatar role')
      .populate('targetDepartment', 'name code')
      .sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single announcement
 * @route   GET /api/announcements/:id
 * @access  Private
 */
exports.getAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('author', 'name email avatar role')
      .populate('targetDepartment', 'name code');

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create announcement (HR / Admin)
 * @route   POST /api/announcements
 * @access  Private (Admin / HR)
 */
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category, priority, targetDepartment, isPinned, expiresAt } = req.body;

    const announcement = await Announcement.create({
      title,
      content,
      category: category || 'General',
      priority: priority || 'Medium',
      targetDepartment: targetDepartment || null,
      author: req.user._id,
      isPinned: Boolean(isPinned),
      expiresAt: expiresAt || null,
    });

    // Notify users
    const allUsers = await User.find({ isActive: true }).select('_id');
    const recipientIds = allUsers.map(u => u._id).filter(id => String(id) !== String(req.user._id));

    await notifyMany({
      recipients: recipientIds,
      title: `Announcement: ${title}`,
      message: `${req.user.name} published a new company announcement: "${title}"`,
      type: 'announcement',
      link: '/announcements',
    });

    const populated = await Announcement.findById(announcement._id)
      .populate('author', 'name email avatar role')
      .populate('targetDepartment', 'name code');

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update announcement
 * @route   PUT /api/announcements/:id
 * @access  Private (Admin / HR)
 */
exports.updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('author', 'name email avatar role')
      .populate('targetDepartment', 'name code');

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete announcement
 * @route   DELETE /api/announcements/:id
 * @access  Private (Admin / HR)
 */
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
