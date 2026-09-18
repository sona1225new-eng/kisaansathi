const express = require('express');
const {
  signup,
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
  resendVerification,
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/register', register);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/resend-verification-email', resendVerification);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
