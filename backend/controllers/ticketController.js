const Ticket = require('../models/Ticket');

// @desc    Create a new ticket
// @route   POST /api/tickets
const createTicket = async (req, res) => {
    const { title, description, category } = req.body;

    try {
        const ticket = await Ticket.create({
            user: req.user._id, // Got this from our authMiddleware!
            title,
            description,
            category,
            status: 'open',
            priority: 'low' // Default, Agents can change this later
        });

        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create ticket', error: error.message });
    }
};

// @desc    Get tickets (End-users get their own, Agents/Admins get all)
// @route   GET /api/tickets
const getTickets = async (req, res) => {
    try {
        let tickets;

        // If it's a normal user, only find tickets where the user ID matches theirs
        if (req.user.role === 'end-user') {
            tickets = await Ticket.find({ user: req.user._id }).sort({ createdAt: -1 });
        } else {
            // If Admin or Agent, fetch everything and include the user's name
            tickets = await Ticket.find({}).populate('user', 'name email').sort({ createdAt: -1 });
        }

        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch tickets' });
    }
};

// @desc    Update a ticket (Only if it's still 'open')
// @route   PUT /api/tickets/:id
const updateTicket = async (req, res) => {
    try {
        // 1. Find the specific ticket they are trying to edit
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found.' });
        }

        // 2. Security Check: Ensure the user actually owns this ticket (unless they are an admin/agent)
        if (ticket.user.toString() !== req.user._id.toString() && req.user.role === 'end-user') {
            return res.status(401).json({ message: 'Not authorized to edit this ticket.' });
        }

        // 3. THE LOCKOUT RULE: If the ticket isn't 'open', they can't touch it
        if (ticket.status !== 'open') {
            return res.status(400).json({
                message: 'You cannot edit this ticket because it is currently under process by our team.'
            });
        }

        // 4. If it IS open, go ahead and update the database
        const updatedTicket = await Ticket.findByIdAndUpdate(
            req.params.id,
            req.body, // This contains the new title/description from the frontend
            { returnDocument: 'after' } // This tells MongoDB to hand us back the freshly updated version
        );

        res.status(200).json(updatedTicket);

    } catch (error) {
        res.status(500).json({ message: 'Server error while updating ticket.', error: error.message });
    }
};

module.exports = { createTicket, getTickets, updateTicket };