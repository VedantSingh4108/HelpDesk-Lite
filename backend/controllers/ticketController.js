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
// Inside backend/controllers/ticketController.js

const getTickets = async (req, res) => {
    try {
        // 1. Create an empty filter object
        let query = {};

        // 2. Check if the frontend is asking for 'My Assigned' tickets
        if (req.query.assignedTo === 'me') {
            // req.user._id comes from your protect/auth middleware
            query.assignedTo = req.user._id;
        }

        // 3. Fetch tickets using the filter (Empty query gets all, specific query gets yours)
        const tickets = await Ticket.find(query).populate('assignedTo', 'name email');

        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching tickets." });
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

// @desc    Get tickets (Supports filtering by assignedTo)
// @route   GET /api/tickets
// @access  Private (Agent/Admin only)
const getAllTickets = async (req, res) => {
    try {
        let query = {};
        if (req.query.assignedTo === 'me') {
            query.assignedTo = req.user._id;
        }

        const tickets = await Ticket.find(query)
            .populate('user', 'name email')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch tickets' });
    }
};

// @desc    Claim an open ticket (Handles Concurrency Deadlocks)
// @route   PUT /api/tickets/:id/claim
// @access  Private (Agent/Admin only)
const claimTicket = async (req, res) => {
    try {
        // Moved these INSIDE the try block so they don't crash the app if missing!
        const ticketId = req.params.id;

        // Safety check to ensure the user token was actually parsed
        if (!req.user || !req.user._id) {
            console.error("CRASH: req.user is undefined! You forgot the 'protect' middleware on this route.");
            return res.status(401).json({ message: "Not authorized, no user found" });
        }

        const agentId = req.user._id;

        const ticket = await Ticket.findOneAndUpdate(
            {
                _id: ticketId,
                // Change: Remove the "" from the array. 
                // Use $or to check for null OR specifically query where the field is missing
                $or: [
                    { assignedTo: null },
                    { assignedTo: { $exists: false } }
                ]
            },
            {
                $set: {
                    assignedTo: agentId,
                    status: 'in-progress'
                }
            },
            { new: true }
        );

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found, or it has already been claimed by someone else." });
        }

        res.json(ticket);
    } catch (error) {
        // THIS IS THE MAGIC LINE: It prints the hidden crash to your backend terminal
        console.error("CRITICAL CRASH IN CLAIM TICKET:", error);

        // Sends the exact error message back to your React app
        res.status(500).json({ message: 'Server error during ticket claim.', details: error.message });
    }
};

// @desc    Update ticket status
// @route   PUT /api/tickets/:id
// @access  Private (Agent/Admin only)
const updateTicketByAgent = async (req, res) => {
    const { status } = req.body;
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        ticket.status = status;
        const updatedTicket = await ticket.save();

        const fullyPopulated = await Ticket.findById(updatedTicket._id)
            .populate('user', 'name email')
            .populate('assignedTo', 'name email');

        res.status(200).json(fullyPopulated);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update ticket' });
    }
};

module.exports = {
    createTicket, getTickets, updateTicket,
    getAllTickets,
    claimTicket,
    updateTicketByAgent
};
