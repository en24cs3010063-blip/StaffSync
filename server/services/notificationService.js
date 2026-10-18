const Notification = require('../models/Notification');

/**
 * Helper to dispatch in-app notifications
 */
const createNotification = async ({ recipient, title, message, type = 'system', link = '' }) => {
  try {
    if (!recipient) return null;
    return await Notification.create({
      recipient,
      title,
      message,
      type,
      link,
    });
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

/**
 * Dispatch notification to multiple users (e.g., all employees for new announcement)
 */
const notifyMany = async ({ recipients, title, message, type = 'announcement', link = '' }) => {
  try {
    if (!recipients || recipients.length === 0) return;
    const docs = recipients.map(recipientId => ({
      recipient: recipientId,
      title,
      message,
      type,
      link,
    }));
    return await Notification.insertMany(docs);
  } catch (error) {
    console.error('Failed to broadcast notifications:', error.message);
  }
};

module.exports = {
  createNotification,
  notifyMany,
};
