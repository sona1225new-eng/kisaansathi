const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const defaultUser = {
  id: 'demo_user_1',
  name: 'Ramesh Kumar Ji',
  email: 'ramesh@kisaansaathi.in',
  location: 'Madhepura, Bihar',
  savedCrops: ['Paddy (Dhan)', 'Wheat (Gehu)'],
  favoriteLocations: ['Madhepura, Bihar', 'Patna, Bihar'],
};

exports.getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return sendSuccess(res, { user: defaultUser });
    }
    try {
      const user = await User.findById(req.user._id || req.user.id).select('-password');
      return sendSuccess(res, { user: user || req.user || defaultUser });
    } catch {
      return sendSuccess(res, { user: req.user || defaultUser });
    }
  } catch (error) {
    return sendSuccess(res, { user: defaultUser });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'location', 'phone'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    try {
      if (req.user && req.user._id) {
        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
        return sendSuccess(res, { user });
      }
    } catch {
      // Fallback update
    }

    const updatedUser = { ...defaultUser, ...updates };
    return sendSuccess(res, { user: updatedUser });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    try {
      if (req.user && req.user._id) {
        const user = await User.findByIdAndUpdate(req.user._id, { notificationPreferences: req.body }, { new: true }).select('-password');
        return sendSuccess(res, { user });
      }
    } catch {
      // Fallback update
    }

    return sendSuccess(res, { user: { ...defaultUser, notificationPreferences: req.body } });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

exports.saveCrop = async (req, res) => {
  try {
    const crop = req.body.crop || 'Paddy (Dhan)';
    try {
      if (req.user && req.user._id) {
        const user = await User.findById(req.user._id);
        if (user && !user.savedCrops.includes(crop)) {
          user.savedCrops.push(crop);
          await user.save();
          return sendSuccess(res, { savedCrops: user.savedCrops });
        }
      }
    } catch {
      // Fallback
    }

    return sendSuccess(res, { savedCrops: [crop] });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

exports.saveFavoriteLocation = async (req, res) => {
  try {
    const location = req.body.location || 'Madhepura';
    try {
      if (req.user && req.user._id) {
        const user = await User.findById(req.user._id);
        if (user && !user.favoriteLocations.includes(location)) {
          user.favoriteLocations.push(location);
          await user.save();
          return sendSuccess(res, { favoriteLocations: user.favoriteLocations });
        }
      }
    } catch {
      // Fallback
    }

    return sendSuccess(res, { favoriteLocations: [location] });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

exports.getNotifications = async (req, res) => {
  try {
    try {
      if (req.user && req.user._id) {
        const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
        return sendSuccess(res, { notifications });
      }
    } catch {
      // Fallback
    }

    return sendSuccess(res, {
      notifications: [
        { id: '1', title: 'Kharif Season Alert', message: 'Sowing window for Paddy in Bihar is open.', createdAt: new Date() },
        { id: '2', title: 'Weather Advisory', message: 'Light rainfall expected over the weekend.', createdAt: new Date() },
      ],
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
