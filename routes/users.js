const express = require('express');
const auth = require('../middleware/auth');
const { getProfile, updateProfile, updatePreferences, saveCrop, saveFavoriteLocation, getNotifications } = require('../controllers/userController');
const router = express.Router();

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/preferences', auth, updatePreferences);
router.post('/saved-crops', auth, saveCrop);
router.post('/favorite-locations', auth, saveFavoriteLocation);
router.get('/notifications', auth, getNotifications);

module.exports = router;
