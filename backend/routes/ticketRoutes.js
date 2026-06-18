const express = require('express');
const router = express.Router();
const {
    createTicket, getTickets, updateTicket,
    claimTicket, updateTicketByAgent, getAdminAnalytics, suggestReply
} = require('../controllers/ticketController');

// 1. IMPORT AUTHORIZE HERE
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Static routes MUST come before dynamic /:id routes
// 2. ADMIN ONLY
router.get('/admin/analytics', protect, authorize('admin'), getAdminAnalytics);

// This handles both POSTing a new ticket, and GETting the secure list
// Standard users can use these, so 'protect' is enough
router.route('/')
    .post(protect, upload.single('attachment'), createTicket)
    .get(protect, getTickets);

router.route('/:id')
    .put(protect, updateTicket);

// 3. AGENT & ADMIN ONLY routes
router.route('/:id/claim')
    .put(protect, authorize('support-agent', 'admin'), claimTicket);

router.route('/:id/status')
    .put(protect, authorize('support-agent', 'admin'), updateTicketByAgent);

router.route('/:id/suggest-reply')
    .get(protect, authorize('support-agent', 'admin'), suggestReply);

module.exports = router;