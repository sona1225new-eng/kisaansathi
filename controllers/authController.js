const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { sendVerificationEmail } = require('../utils/mailer');

const isDbConnected = () => mongoose.connection.readyState === 1;

const getJwtSecret = () => process.env.JWT_SECRET || 'kisaan-saathi-super-secret-jwt-key-2025';

const createToken = (user) =>
  jwt.sign({ id: user._id || user.id }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const createVerificationToken = (email) =>
  jwt.sign({ email, type: 'email-verification' }, getJwtSecret(), {
    expiresIn: '24h',
  });

const getBaseAppUrl = () => {
  const url = process.env.APP_URL || process.env.CLIENT_URL || `http://localhost:${process.env.PORT || 5000}`;
  return url.replace(/\/$/, '');
};

const getClientLoginUrl = () => {
  const clientUrl = process.env.CLIENT_URL || process.env.APP_URL || 'http://localhost:5173';
  return `${clientUrl.replace(/\/$/, '')}/login`;
};

// In-memory fallback storage if MongoDB is not connected
const memoryUsers = new Map();
const demoUser = {
  _id: 'user_demo_123',
  id: 'user_demo_123',
  name: 'Ramesh Kumar Ji',
  email: 'ramesh@kisaansaathi.in',
  location: 'Madhepura, Bihar',
  isVerified: true,
  savedCrops: ['Paddy (Dhan)', 'Wheat (Gehu)'],
  favoriteLocations: ['Madhepura', 'Patna'],
  // Local fallback only: makes the demo account explicit instead of accepting any password.
  password: bcrypt.hashSync('demo123', 10),
};
memoryUsers.set(demoUser.email, demoUser);

const renderVerificationHtml = ({ success, title, message, actionUrl, actionText }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - KisaanSaathi</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f7f4;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      color: #2d3748;
    }
    .card {
      max-width: 480px;
      width: 90%;
      background: #ffffff;
      border-radius: 16px;
      padding: 40px 32px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
      box-sizing: border-box;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    h1 {
      color: ${success ? '#176b47' : '#dc2626'};
      font-size: 24px;
      margin: 0 0 12px 0;
      font-weight: 700;
    }
    p {
      color: #4a5568;
      font-size: 15px;
      line-height: 1.6;
      margin: 0 0 28px 0;
    }
    .btn {
      display: inline-block;
      background-color: #176b47;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 15px;
      padding: 12px 28px;
      border-radius: 10px;
      transition: background 0.2s;
    }
    .btn:hover {
      background-color: #115839;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? '🌾' : '⚠️'}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="${actionUrl}" class="btn">${actionText}</a>
  </div>
</body>
</html>
`;

/**
 * Handles new user registration/signup.
 * Creates user with isVerified: false, generates a 24h verification JWT token,
 * builds a verification link, and sends the verification email via Resend.
 */
exports.signup = async (req, res) => {
  try {
    const { name, email, password, location } = req.body;
    if (!name || !email || !password) {
      return sendError(res, 'Please provide name, email and password', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long', 400);
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const verificationToken = createVerificationToken(normalizedEmail);
    const verifyLink = `${getBaseAppUrl()}/api/auth/verify-email?token=${verificationToken}`;

    let createdUser = null;

    if (isDbConnected()) {
      try {
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
          return sendError(res, 'User already exists with this email address', 400);
        }

        const user = await User.create({
          name: name.trim(),
          email: normalizedEmail,
          password,
          location: location || 'Madhepura, Bihar',
          isVerified: false,
        });

        createdUser = {
          id: user._id,
          name: user.name,
          email: user.email,
          location: user.location,
          isVerified: user.isVerified,
        };
      } catch (dbError) {
        console.warn('MongoDB user creation failed, falling back to memory store:', dbError.message);
      }
    }

    // In-memory store if DB is disconnected or failed
    if (!createdUser) {
      if (memoryUsers.has(normalizedEmail)) {
        return sendError(res, 'User already exists with this email address', 400);
      }

      const newMemoryUser = {
        _id: `user_${Date.now()}`,
        id: `user_${Date.now()}`,
        name: name.trim(),
        email: normalizedEmail,
        location: location || 'Madhepura, Bihar',
        password: await bcrypt.hash(password, 10),
        isVerified: false,
        savedCrops: [],
        favoriteLocations: [],
      };
      memoryUsers.set(normalizedEmail, newMemoryUser);

      createdUser = {
        id: newMemoryUser.id,
        name: newMemoryUser.name,
        email: newMemoryUser.email,
        location: newMemoryUser.location,
        isVerified: newMemoryUser.isVerified,
      };
    }

    // Send verification email via Resend SDK
    const emailResult = await sendVerificationEmail(normalizedEmail, verifyLink);

    return sendSuccess(
      res,
      {
        message: 'Registration successful! Please check your email to verify your account.',
        user: createdUser,
        requiresVerification: true,
        emailDelivery: emailResult.success ? 'sent' : 'pending',
      },
      201
    );
  } catch (error) {
    console.error('Signup error:', error);
    return sendError(res, error.message || 'Registration failed', 500);
  }
};

// Maintain 'register' alias for backward compatibility
exports.register = exports.signup;

/**
 * Handles email verification via GET /verify-email?token=...
 * Decodes verification JWT, finds user, and marks isVerified: true.
 */
exports.verifyEmail = async (req, res) => {
  const token = req.query.token;
  const acceptsHtml = req.accepts('html') && !req.xhr && !req.headers['accept']?.includes('application/json');
  const loginUrl = getClientLoginUrl();

  if (!token) {
    if (acceptsHtml) {
      return res.status(400).send(
        renderVerificationHtml({
          success: false,
          title: 'Verification Link Missing',
          message: 'No verification token was provided. Please check the link in your email.',
          actionUrl: loginUrl,
          actionText: 'Go to Login',
        })
      );
    }
    return sendError(res, 'Verification token is required', 400);
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());

    if (!decoded.email) {
      if (acceptsHtml) {
        return res.status(400).send(
          renderVerificationHtml({
            success: false,
            title: 'Invalid Verification Link',
            message: 'The verification link is invalid or corrupted. Please request a new one.',
            actionUrl: loginUrl,
            actionText: 'Go to Login',
          })
        );
      }
      return sendError(res, 'Invalid verification token payload', 400);
    }

    const email = decoded.email.toLowerCase();
    let userFound = false;

    // Try MongoDB if connected
    if (isDbConnected()) {
      try {
        const user = await User.findOne({ email });
        if (user) {
          user.isVerified = true;
          await user.save({ validateBeforeSave: false });
          userFound = true;
        }
      } catch (dbErr) {
        console.warn('MongoDB lookup error in verifyEmail:', dbErr.message);
      }
    }

    // Check In-Memory Users fallback
    if (memoryUsers.has(email)) {
      const memUser = memoryUsers.get(email);
      memUser.isVerified = true;
      userFound = true;
    }

    if (!userFound) {
      if (acceptsHtml) {
        return res.status(404).send(
          renderVerificationHtml({
            success: false,
            title: 'User Not Found',
            message: 'No account associated with this verification link was found.',
            actionUrl: loginUrl,
            actionText: 'Register New Account',
          })
        );
      }
      return sendError(res, 'User not found for this email', 404);
    }

    if (acceptsHtml) {
      return res.status(200).send(
        renderVerificationHtml({
          success: true,
          title: 'Email Verified Successfully!',
          message: 'Your KisaanSaathi account has been verified. You can now log in and access all farming advisory features.',
          actionUrl: loginUrl,
          actionText: 'Proceed to Login →',
        })
      );
    }

    return sendSuccess(res, {
      message: 'Email verified successfully. You can now log in.',
      isVerified: true,
    });
  } catch (error) {
    console.error('Email verification error:', error.message);

    let errorMessage = 'Verification link is invalid or has expired.';
    if (error.name === 'TokenExpiredError') {
      errorMessage = 'Your verification link has expired (valid for 24 hours). Please sign up again or request a new link.';
    }

    if (acceptsHtml) {
      return res.status(400).send(
        renderVerificationHtml({
          success: false,
          title: 'Verification Link Expired / Invalid',
          message: errorMessage,
          actionUrl: loginUrl,
          actionText: 'Back to Login',
        })
      );
    }

    return sendError(res, errorMessage, 400);
  }
};

/**
 * Handles resending verification email.
 * Finds the unverified user by email, creates a new 24h verification JWT token,
 * builds a verification link, and sends the verification email via Resend.
 */
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendError(res, 'Please provide your email address', 400);
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    let user = null;

    if (isDbConnected()) {
      try {
        user = await User.findOne({ email: normalizedEmail });
      } catch (dbErr) {
        console.warn('MongoDB lookup error in resendVerification:', dbErr.message);
      }
    }

    if (!user && memoryUsers.has(normalizedEmail)) {
      user = memoryUsers.get(normalizedEmail);
    }

    if (!user) {
      return sendError(res, 'No account found with this email address.', 404);
    }

    if (user.isVerified) {
      return sendError(res, 'This account is already verified. You can log in directly.', 400);
    }

    const verificationToken = createVerificationToken(normalizedEmail);
    const verifyLink = `${getBaseAppUrl()}/api/auth/verify-email?token=${verificationToken}`;

    const emailResult = await sendVerificationEmail(normalizedEmail, verifyLink);

    if (!emailResult.success) {
      return sendError(res, emailResult.error || 'Failed to send verification email. Please try again.', 500);
    }

    return sendSuccess(res, {
      message: 'Verification email sent! Check your inbox.',
      emailDelivery: 'sent',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return sendError(res, error.message || 'Failed to resend verification email.', 500);
  }
};

/**
 * Handles user login.
 * Validates credentials and verifies that the account is email-verified (isVerified === true).
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return sendError(res, 'Please provide email and password', 400);

    const normalizedEmail = String(email).trim().toLowerCase();

    // Check MongoDB if connected
    if (isDbConnected()) {
      try {
        const user = await User.findOne({ email: normalizedEmail });
        if (user && (await user.comparePassword(password))) {
          if (!user.isVerified) {
            return sendError(
              res,
              'Please verify your email before logging in. Check your inbox for the verification link.',
              403
            );
          }

          const token = createToken(user);
          return sendSuccess(res, {
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              location: user.location,
              isVerified: user.isVerified,
            },
            token,
          });
        }
      } catch {
        // Fallback to in-memory store
      }
    }

    // Check In-memory store
    if (memoryUsers.has(normalizedEmail)) {
      const memUser = memoryUsers.get(normalizedEmail);
      if (await bcrypt.compare(password, memUser.password)) {
        if (!memUser.isVerified) {
          return sendError(
            res,
            'Please verify your email before logging in. Check your inbox for the verification link.',
            403
          );
        }

        const token = createToken(memUser);
        return sendSuccess(res, {
          user: {
            id: memUser.id,
            name: memUser.name,
            email: memUser.email,
            location: memUser.location,
            isVerified: memUser.isVerified,
          },
          token,
        });
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
    if (isDbConnected()) {
      const user = await User.findOne({ email });
      if (user) {
        user.resetPasswordToken = tokenHash;
        user.resetPasswordExpires = expires;
        await user.save({ validateBeforeSave: false });
      }
    }
    if (memoryUsers.has(email)) {
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
    if (isDbConnected()) {
      const user = await User.findOne({ resetPasswordToken: tokenHash, resetPasswordExpires: { $gt: new Date() } });
      if (user) {
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        return sendSuccess(res, { message: 'Password reset successfully' });
      }
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

exports.memoryUsers = memoryUsers;