const express = require('express');
const router = express.Router();
const { createTicket, getTickets, updateTicket, getAllTickets, claimTicket, updateTicketByAgent } = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

// Existing routes for creating and getting ALL user tickets
router.route('/')
    .post(protect, createTicket)
    .get(protect, getTickets);

// NEW: Route for updating a SPECIFIC ticket by its ID
router.route('/:id')
    .put(protect, updateTicket);
// Get all tickets (or filter by ?assignedTo=me)
router.route('/')
    .get(protect, getAllTickets);

// The Atomic Claim Route
router.route('/:id/claim')
    .put(protect, claimTicket);

// The standard status update route
router.route('/:id')
    .put(protect, updateTicketByAgent);

module.exports = router;