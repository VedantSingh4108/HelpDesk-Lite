const express = require('express');
const router = express.Router();
const {
    createTicket, getTickets, updateTicket,
    claimTicket, updateTicketByAgent, getAdminAnalytics
} = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

// Static routes MUST come before dynamic /:id routes
router.get('/admin/analytics', protect, getAdminAnalytics);

// This handles both POSTing a new ticket, and GETting the secure list
router.route('/')
    .post(protect, createTicket)
    .get(protect, getTickets);

router.route('/:id')
    .put(protect, updateTicket);

router.route('/:id/claim')
    .put(protect, claimTicket);

router.route('/:id/status')
    .put(protect, updateTicketByAgent);

module.exports = router;