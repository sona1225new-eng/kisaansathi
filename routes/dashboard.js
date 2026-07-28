const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const { getDashboardData, chatAssistant, detectCropDisease } = require('../controllers/dashboardController');
const { getFullData } = require('../controllers/locationController');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get('/overview', optionalAuth, getDashboardData);
router.get('/location-data', optionalAuth, getFullData);
router.post('/chat', auth, chatAssistant);
router.post('/disease-detect', auth, upload.single('image'), detectCropDisease);

module.exports = router;
