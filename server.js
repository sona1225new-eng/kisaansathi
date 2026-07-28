require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & CORS
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ─── API Routes ─────────────────────────────────────────────────────────────

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/health', require('./routes/health'));
app.use('/api/location', require('./routes/location'));

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: '🌾 Kisaan Saathi API Server is running cleanly',
    version: '2.0.0',
    endpoints: [
      '/api/location/full',
      '/api/location/resolve',
      '/api/location/weather',
      '/api/location/forecast',
      '/api/location/mandi',
      '/api/location/schemes',
      '/api/location/crops',
      '/api/location/disease-alerts',
      '/api/location/news',
      '/api/location/kvks',
      '/api/location/calendar',
      '/api/dashboard/overview',
      '/api/auth/login',
      '/api/auth/register',
      '/api/users/profile',
    ],
  });
});

// Serve frontend static build if available
if (require('fs').existsSync(path.join(__dirname, 'dist'))) {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Global Error Handler
app.use(errorHandler);

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`🌾 Kisaan Saathi backend server running on http://localhost:${PORT}`);
  });
};

connectDB()
  .then(() => {
    startServer();
  })
  .catch((error) => {
    console.warn('⚠️ MongoDB unavailable, running server with in-memory fallbacks:', error.message);
    startServer();
  });
