const express = require('express');
const router = express.Router();
const { getComments, addComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

// Notice we apply your 'protect' middleware so only logged-in users can chat!
router.route('/:ticketId')
    .get(protect, getComments)
    .post(protect, addComment);

module.exports = router;