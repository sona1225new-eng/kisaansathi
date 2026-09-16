const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { memoryUsers } = require('../controllers/authController');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'dev-secret-key-12345'
    );

    // First try MongoDB
    try {
      const user = await User.findById(decoded.id).select('-password');

      if (user) {
        req.user = user;
        return next();
      }
    } catch (dbError) {
      console.warn('MongoDB user lookup failed, checking memory user...');
    }

    // If MongoDB is unavailable, check in-memory users
    if (memoryUsers) {
      const memoryUser = [...memoryUsers.values()].find(
        (user) => user.id === decoded.id || user._id === decoded.id
      );

      if (memoryUser) {
        req.user = {
          ...memoryUser,
          _id: memoryUser._id,
          id: memoryUser.id,
        };

        return next();
      }
    }

    return res.status(401).json({
      success: false,
      message: 'User not found',
    });

  } catch (error) {
    console.error('Auth middleware error:', error.message);

    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

module.exports = auth;