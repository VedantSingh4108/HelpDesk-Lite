const express = require('express');
const router = express.Router();
const { getChatbotResponse } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// We apply the "protect" middleware so only logged-in employees can use the bot
router.post('/chat', protect, getChatbotResponse);

module.exports = router;