const express = require('express');
const auth = require('../middleware/auth');
const { listNotifications, markAsRead } = require('../controllers/notificationController');
const router = express.Router();

router.get('/', auth, listNotifications);
router.put('/:id/read', auth, markAsRead);

module.exports = router;
