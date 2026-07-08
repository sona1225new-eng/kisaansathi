const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    sendSuccess(res, { user });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'location', 'phone'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    sendSuccess(res, { user });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { notificationPreferences: req.body }, { new: true }).select('-password');
    sendSuccess(res, { user });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

exports.saveCrop = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.savedCrops.includes(req.body.crop)) {
      user.savedCrops.push(req.body.crop);
      await user.save();
    }
    sendSuccess(res, { savedCrops: user.savedCrops });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

exports.saveFavoriteLocation = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.favoriteLocations.includes(req.body.location)) {
      user.favoriteLocations.push(req.body.location);
      await user.save();
    }
    sendSuccess(res, { favoriteLocations: user.favoriteLocations });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    sendSuccess(res, { notifications });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};
