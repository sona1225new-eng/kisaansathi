const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    sendSuccess(res, { notifications });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    sendSuccess(res, { message: 'Notification marked as read' });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};
