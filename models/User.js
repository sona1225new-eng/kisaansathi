const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, default: '' },
  location: { type: String, default: 'Madhepura, Bihar' },

  // Location enrichment
  gpsCoords: {
    lat: { type: Number, default: null },
    lon: { type: Number, default: null },
  },
  district: { type: String, default: '' },
  state: { type: String, default: 'Bihar' },
  locationSource: {
    type: String,
    enum: ['gps', 'manual', 'default'],
    default: 'default',
  },
  locationUpdatedAt: { type: Date, default: null },

  // Preferences
  preferredLanguage: { type: String, default: 'hi' },
  preferredCrops: [{ type: String }],
  role: { type: String, enum: ['farmer', 'admin'], default: 'farmer' },
  savedCrops: [{ type: String }],
  favoriteLocations: [{ type: String }],
  notificationPreferences: {
    weather: { type: Boolean, default: true },
    mandi: { type: Boolean, default: true },
    schemes: { type: Boolean, default: true },
    news: { type: Boolean, default: true },
    diseaseAlerts: { type: Boolean, default: true },
    cropCalendar: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
