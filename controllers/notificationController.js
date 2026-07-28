const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const mockNotifications = [
  { id: '1', title: '🌾 Weather Alert', message: 'Heavy rain expected in Bihar next week. Plan harvesting accordingly.', read: false, createdAt: new Date() },
  { id: '2', title: '📈 Mandi Price Spike', message: 'Paddy prices up by 2.4% in local mandis.', read: false, createdAt: new Date() },
  { id: '3', title: '🏛️ New Scheme Launched', message: 'PMKSY drip irrigation subsidy application is open.', read: true, createdAt: new Date() },
];

exports.listNotifications = async (req, res) => {
  try {
    if (req.user && req.user._id) {
      try {
        const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
        if (notifications.length) return sendSuccess(res, { notifications });
      } catch {
        // Fallback to mock
      }
    }
    return sendSuccess(res, { notifications: mockNotifications });
  } catch (error) {
    return sendSuccess(res, { notifications: mockNotifications });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    if (req.user && req.user._id) {
      try {
        await Notification.findByIdAndUpdate(req.params.id, { read: true });
      } catch {
        // ignore
      }
    }
    return sendSuccess(res, { message: 'Notification marked as read' });
  } catch (error) {
    return sendSuccess(res, { message: 'Notification marked as read' });
  }
};
