const Comment = require('../models/Comment');
const Ticket = require('../models/Ticket');
const sendEmail = require('../utils/sendEmail');
// @desc    Get all comments for a specific ticket
// @route   GET /api/comments/:ticketId
// @access  Private
const getComments = async (req, res) => {
    try {
        // 1. Check if the ticket actually exists
        const ticket = await Ticket.findById(req.params.ticketId);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        // 2. Fetch the comments and "populate" the user data
        // We grab the name and role so the React frontend knows whether to align the chat bubble left or right!
        const comments = await Comment.find({ ticket: req.params.ticketId })
            .populate('user', 'name role email');

        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch comments', error: error.message });
    }
};

// @desc    Add a new comment to a ticket
// @route   POST /api/comments/:ticketId
// @access  Private
// @desc    Add a new comment to a ticket
// @route   POST /api/comments/:ticketId
// @access  Private
const addComment = async (req, res) => {
    try {
        // We added .populate('user') here so we can grab the End-User's email!
        const ticket = await Ticket.findById(req.params.ticketId).populate('user', 'name email');
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        // 1. Create the comment in the database
        const comment = await Comment.create({
            ticket: req.params.ticketId,
            user: req.user._id,
            text: req.body.text
        });

        // 2. Fetch it back for the frontend
        const populatedComment = await Comment.findById(comment._id).populate('user', 'name role email');

        // --- NEW: EMAIL NOTIFICATION LOGIC ---
        // If the person who just commented is NOT the end-user, send the end-user an email!
        if (req.user.role !== 'end-user') {
            const ticketUrl = `http://localhost:5173/my-tickets`;
            const message = `
                Hi ${ticket.user.name}, \n
                A support agent has just replied to your ticket (ID: ${ticket._id.toString().slice(-6).toUpperCase()}). \n
                Agent Message: "${req.body.text}" \n
                Log in to your dashboard to view the full conversation and reply:
                ${ticketUrl}
            `;

            try {
                await sendEmail({
                    email: ticket.user.email,
                    subject: `New Reply on Ticket: ${ticket.title}`,
                    message
                });
            } catch (emailErr) {
                console.error("Non-fatal: Failed to send comment notification email", emailErr);
                // We don't throw a 500 error here because the comment was still successfully saved to the database!
            }
        }
        // --------------------------------------

        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add comment', error: error.message });
    }
};

module.exports = { getComments, addComment };