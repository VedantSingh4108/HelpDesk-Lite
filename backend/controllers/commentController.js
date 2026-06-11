const Comment = require('../models/Comment');
const Ticket = require('../models/Ticket');

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
const addComment = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.ticketId);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        // 1. Create the comment in the database
        const comment = await Comment.create({
            ticket: req.params.ticketId,
            user: req.user._id, // This comes securely from your JWT!
            text: req.body.text
        });

        // 2. Fetch it back immediately with the user's name attached so the frontend can display it instantly without refreshing
        const populatedComment = await Comment.findById(comment._id).populate('user', 'name role email');

        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add comment', error: error.message });
    }
};

module.exports = { getComments, addComment };