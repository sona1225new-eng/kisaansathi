const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const createToken = (user) =>
  jwt.sign({ id: user._id || user.id }, process.env.JWT_SECRET || 'dev-secret-key-12345', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// In-memory fallback storage if MongoDB is not connected
const memoryUsers = new Map();
const demoUser = {
  _id: 'user_demo_123',
  id: 'user_demo_123',
  name: 'Ramesh Kumar Ji',
  email: 'ramesh@kisaansaathi.in',
  location: 'Madhepura, Bihar',
  savedCrops: ['Paddy (Dhan)', 'Wheat (Gehu)'],
  favoriteLocations: ['Madhepura', 'Patna'],
  // Local fallback only: makes the demo account explicit instead of accepting any password.
  password: bcrypt.hashSync('demo123', 10),
};
memoryUsers.set(demoUser.email, demoUser);

exports.register = async (req, res) => {
  try {
    const { name, email, password, location } = req.body;
    if (!name || !email || !password) {
      return sendError(res, 'Please provide name, email and password', 400);
    }

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) return sendError(res, 'User already exists', 400);

      const user = await User.create({ name, email, password, location: location || 'Madhepura, Bihar' });
      const token = createToken(user);
      return sendSuccess(res, { user: { id: user._id, name: user.name, email: user.email, location: user.location }, token }, 201);
    } catch {
      // In-memory fallback
      if (memoryUsers.has(email)) return sendError(res, 'User already exists', 400);
      const newMemoryUser = {
        _id: `user_${Date.now()}`,
        id: `user_${Date.now()}`,
        name,
        email,
        location: location || 'Madhepura, Bihar',
        password: await bcrypt.hash(password, 10),
        savedCrops: [],
        favoriteLocations: [],
      };
      memoryUsers.set(email, newMemoryUser);
      const token = createToken(newMemoryUser);
      return sendSuccess(res, { user: newMemoryUser, token }, 201);
    }
  } catch (error) {
    return sendError(res, error.message || 'Registration failed', 500);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return sendError(res, 'Please provide email and password', 400);

    try {
      const user = await User.findOne({ email });
      if (user && (await user.comparePassword(password))) {
        const token = createToken(user);
        return sendSuccess(res, { user: { id: user._id, name: user.name, email: user.email, location: user.location }, token });
      }
    } catch {
      // Ignore Mongo error, check in-memory store or create demo session
    }

    if (memoryUsers.has(email)) {
      const memUser = memoryUsers.get(email);
      if (await bcrypt.compare(password, memUser.password)) {
        const token = createToken(memUser);
        return sendSuccess(res, { user: { id: memUser.id, name: memUser.name, email: memUser.email, location: memUser.location }, token });
      }
    }
    return sendError(res, 'Invalid email or password', 401);
  } catch (error) {
    return sendError(res, error.message || 'Login failed', 500);
  }
};

exports.logout = async (req, res) => {
  return sendSuccess(res, { message: 'Logged out successfully' });
};

// Send the opaque reset token by email in production. Returning it in development
// keeps the local/demo build usable without coupling the API to an email provider.
exports.forgotPassword = async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!email) return sendError(res, 'Please provide your email address', 400);
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expires = new Date(Date.now() + 15 * 60 * 1000);
  try {
    const user = await User.findOne({ email });
    if (user) {
      user.resetPasswordToken = tokenHash;
      user.resetPasswordExpires = expires;
      await user.save({ validateBeforeSave: false });
    } else if (memoryUsers.has(email)) {
      memoryUsers.get(email).resetPasswordToken = tokenHash;
      memoryUsers.get(email).resetPasswordExpires = expires;
    }
    const payload = { message: 'If an account exists, reset instructions have been sent.' };
    if (process.env.NODE_ENV !== 'production') payload.resetToken = rawToken;
    return sendSuccess(res, payload);
  } catch (error) {
    return sendError(res, 'Unable to start password reset', 500);
  }
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 6) return sendError(res, 'A valid token and a 6+ character password are required', 400);
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  try {
    const user = await User.findOne({ resetPasswordToken: tokenHash, resetPasswordExpires: { $gt: new Date() } });
    if (user) {
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return sendSuccess(res, { message: 'Password reset successfully' });
    }
    const memoryUser = [...memoryUsers.values()].find((entry) => entry.resetPasswordToken === tokenHash && entry.resetPasswordExpires > new Date());
    if (!memoryUser) return sendError(res, 'This reset link is invalid or has expired', 400);
    memoryUser.password = await bcrypt.hash(password, 10);
    memoryUser.resetPasswordToken = undefined;
    memoryUser.resetPasswordExpires = undefined;
    return sendSuccess(res, { message: 'Password reset successfully' });
  } catch (error) {
    return sendError(res, 'Unable to reset password', 500);
  }
};
