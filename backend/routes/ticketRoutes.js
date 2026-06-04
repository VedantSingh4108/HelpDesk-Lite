const express = require('express');
const router = express.Router();
const { createTicket, getTickets, updateTicket } = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

// Existing routes for creating and getting ALL user tickets
router.route('/')
    .post(protect, createTicket)
    .get(protect, getTickets);

// NEW: Route for updating a SPECIFIC ticket by its ID
router.route('/:id')
    .put(protect, updateTicket);

module.exports = router;