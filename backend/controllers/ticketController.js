const Ticket = require('../models/Ticket');
const sendEmail = require('../utils/sendEmail');
// 1. Import the official Gemini SDK 
const { GoogleGenAI, Type } = require('@google/genai');
const Category = require('../models/Category');
// Initialize the AI with your existing environment variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const Comment = require('../models/Comment');
// @desc    Create a new ticket with AI Categorization
// @route   POST /api/tickets
const createTicket = async (req, res) => {
    // Notice we no longer require 'category' from the frontend!
    const { title, description } = req.body;

    try {
        // 1. Fetch LIVE categories from MongoDB
        const liveCategories = await Category.find({});

        // Extract just the names into an array. Add a failsafe just in case the DB is completely empty.
        const dynamicCategoryNames = liveCategories.length > 0
            ? liveCategories.map(cat => cat.name)
            : ["Technical Support"];

        // 2. Set up our safe default values in case the AI request fails
        let finalCategory = dynamicCategoryNames[0]; // Defaults to the first live category
        let finalPriority = 'medium';

        // 3. Ask Gemini to classify the ticket
        try {
            const prompt = `You are an advanced helpdesk routing AI. Analyze the incoming support ticket title and description. Classify it into one of the allowed categories and determine its priority level based on the urgency of the problem described.
            
            Title: ${title}
            Description: ${description}`;

            const response = await ai.models.generateContent({
                model: 'gemini-flash-lite-latest', // The fastest model for structured data
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT, // Assuming you have imported Type from the SDK
                        properties: {
                            category: {
                                type: Type.STRING,
                                // 🔥 THE MAGIC SAUCE: Inject the live database array here!
                                enum: dynamicCategoryNames
                            },
                            priority: {
                                type: Type.STRING,
                                enum: ["low", "medium", "high"]
                            }
                        },
                        required: ["category", "priority"]
                    }
                }
            });

            // Parse the guaranteed JSON response
            const aiDecision = JSON.parse(response.text);
            finalCategory = aiDecision.category;
            finalPriority = aiDecision.priority;

            console.log("🤖 Gemini Successfully Categorized Ticket:", aiDecision);

        } catch (aiError) {
            console.error("⚠️ Gemini Classification Failed. Reverting to default values.", aiError.message);
            // We do NOT throw an error here. We want the ticket to save regardless!
        }

        // --- NEW: Grab the Cloudinary URL if a file was uploaded ---
        const attachmentUrl = req.file ? req.file.path : null;

        // 4. Save to the database using the AI's choices AND the attachment
        const ticket = await Ticket.create({
            user: req.user._id,
            title,
            description,
            category: finalCategory,
            attachmentUrl, // <-- Saved to MongoDB here
            status: 'open',
            priority: finalPriority
        });

        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create ticket', error: error.message });
    }
};

// ... the rest of your controller functions stay exactly the same
// @desc    Get tickets (End-users get their own, Agents/Admins get all)
// @route   GET /api/tickets
// Inside backend/controllers/ticketController.js

// @desc    Get tickets (Filters based on user role)
// @route   GET /api/tickets
// @access  Private
// @desc    Get tickets (Filters based on user role)
// @route   GET /api/tickets
// @access  Private
// @desc    Get tickets (Filters based on user role AND assignment)
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication error: User ID missing.' });
        }

        // 1. Admin & Support Agent Logic
        if (req.user.role === 'admin' || req.user.role === 'support-agent') {

            // Start with an empty query (which grabs everything)
            let agentQuery = {};

            // If the frontend explicitly asks for "my assigned" tickets, update the query!
            if (req.query.assignedTo === 'me') {
                agentQuery.assignedTo = userId;
            }

            // Also added .populate('assignedTo') so the frontend knows exactly who claimed it
            const allTickets = await Ticket.find(agentQuery)
                .populate('user', 'name email')
                .populate('assignedTo', 'name email');

            return res.json(allTickets);
        }

        // 2. End-User Logic (Stays exactly the same)
        const userTickets = await Ticket.find({ user: userId });
        res.json(userTickets);

    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch tickets', error: error.message });
    }
};

// @desc    Update a ticket (Only if it's still 'open')
// @route   PUT /api/tickets/:id
// @desc    Update a ticket (Allows edits if open, allows closing anytime)
// @route   PUT /api/tickets/:id
// @desc    Update a ticket (Status changes, etc.)
// @route   PUT /api/tickets/:id
// @access  Private
const updateTicket = async (req, res) => {
    try {
        // Find the ticket and grab the user's email
        const ticket = await Ticket.findById(req.params.id).populate('user', 'name email');

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Keep track of the old status to see if it actually changed
        const oldStatus = ticket.status;

        // Update the ticket fields
        ticket.status = req.body.status || ticket.status;
        ticket.description = req.body.description || ticket.description;

        const updatedTicket = await ticket.save();

        // --- NEW: EMAIL NOTIFICATION LOGIC ---
        // Only send an email if the status was actually changed by this request
        if (req.body.status && req.body.status !== oldStatus) {

            let message = `Hi ${ticket.user.name},\n\nYour ticket "${ticket.title}" has been updated to: ${ticket.status.toUpperCase()}.\n\n`;

            // If the agent marked it resolved, ask the user to close it!
            if (ticket.status === 'resolved') {
                message += `Our support team believes this issue is now resolved! \n\nPlease log into your dashboard to review the fix. If everything looks good, kindly click the "Close" button on the ticket to officially wrap it up.\n\nhttp://localhost:5173/my-tickets`;
            } else {
                message += `Log in to view your ticket details: http://localhost:5173/my-tickets`;
            }

            try {
                await sendEmail({
                    email: ticket.user.email,
                    subject: `Ticket Status Update: ${ticket.title}`,
                    message
                });
            } catch (emailErr) {
                console.error("Non-fatal: Failed to send status notification email", emailErr);
            }
        }
        // --------------------------------------

        res.json(updatedTicket);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update ticket', error: error.message });
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
            { returnDocument: 'after' }
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
// @desc    Get Admin Analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
const getAdminAnalytics = async (req, res) => {
    try {
        // 1. Calculate the high-level stats
        const total = await Ticket.countDocuments();
        const open = await Ticket.countDocuments({ status: { $in: ['open', 'in-progress'] } });
        const resolved = await Ticket.countDocuments({ status: { $in: ['resolved', 'closed'] } });

        // 2. Build the chart data (Group tickets by the date they were created)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyTickets = await Ticket.aggregate([
            {
                // Only grab tickets from the last 7 days
                $match: { createdAt: { $gte: sevenDaysAgo } }
            },
            {
                // Group them by formatting the Date into a "YYYY-MM-DD" string
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            {
                // Sort by date ascending (oldest to newest)
                $sort: { _id: 1 }
            }
        ]);

        // 3. Format the data perfectly for Recharts
        const formattedChartData = dailyTickets.map(item => ({
            date: item._id, // e.g., "2026-06-08"
            count: item.count
        }));

        res.json({
            stats: { total, open, resolved },
            chartData: formattedChartData
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ message: 'Failed to fetch analytics data' });
    }
};
// @desc    Generate AI suggested reply for agents
// @route   GET /api/tickets/:id/suggest-reply
// @access  Private (Agents/Admins)
const suggestReply = async (req, res) => {
    try {
        // 1. Fetch the ticket and all related comments
        const ticket = await Ticket.findById(req.params.id).populate('user', 'name');
        const comments = await Comment.find({ ticket: req.params.id }).populate('user', 'role name');

        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        // 2. Format the conversation history for the AI
        let conversationHistory = `Ticket Title: ${ticket.title}\nDescription: ${ticket.description}\n\n`;

        if (comments.length === 0) {
            conversationHistory += "(No comments yet. This is a brand new ticket.)\n";
        } else {
            comments.forEach(comment => {
                const speaker = comment.user.role === 'end-user' ? 'Customer' : 'Support Agent';
                conversationHistory += `${speaker} (${comment.user.name}): ${comment.text}\n`;
            });
        }

        // 3. The Prompt Engineering
        // 3. The Prompt Engineering
        const prompt = `
            You are a professional, empathetic, and highly skilled IT support agent. 
            Read the following ticket description and conversation history, and draft a helpful reply to the customer.
            Keep it concise, professional, and directly address their last message or the main issue.
            Do not include placeholders like "[Your Name]". Just write the raw message body that an agent can immediately send.
            
            Conversation History:
            ${conversationHistory}
        `;

        // 4. Initialize the new SDK correctly (just like your categorization function)
        const { GoogleGenAI } = require('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // 5. Call the model
        const response = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest', // You can use flash or pro here
            contents: prompt,
        });

        // 6. Extract the text response
        const suggestedText = response.text;

        // 7. Send the draft back to the frontend
        res.json({ suggestion: suggestedText });
    } catch (error) {
        console.error("AI Suggestion Error:", error);
        res.status(500).json({ message: 'Failed to generate AI suggestion' });
    }
};
// Don't forget to export it at the bottom!
module.exports = {
    createTicket, getTickets, updateTicket,
    getAllTickets,
    claimTicket,
    updateTicketByAgent,
    getAdminAnalytics,
    suggestReply
};