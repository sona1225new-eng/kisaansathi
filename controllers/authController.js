const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const createToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, location } = req.body;
    if (!name || !email || !password) return sendError(res, 'Please provide name, email and password', 400);

    const existingUser = await User.findOne({ email });
    if (existingUser) return sendError(res, 'User already exists', 400);

    const user = await User.create({ name, email, password, location });
    const token = createToken(user);
    sendSuccess(res, { user: { id: user._id, name: user.name, email: user.email, location: user.location }, token }, 201);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return sendError(res, 'Please provide email and password', 400);

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) return sendError(res, 'Invalid credentials', 401);

    const token = createToken(user);
    sendSuccess(res, { user: { id: user._id, name: user.name, email: user.email, location: user.location }, token });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

exports.logout = async (req, res) => {
  sendSuccess(res, { message: 'Logged out successfully' });
};
