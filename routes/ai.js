const express = require('express');
const { chatWithAI } = require('../services/aiService');

const router = express.Router();

router.post('/chat', chatWithAI);

module.exports = router;