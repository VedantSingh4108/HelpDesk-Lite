const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    // Links to the specific Ticket
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Ticket'
    },
    // Links to the User (End-User or Agent) who typed the message
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    // The actual chat message
    text: {
        type: String,
        required: [true, 'Please add some text to the comment']
    }
}, {
    timestamps: true // Automatically adds createdAt so we can sort the chat chronologically
});

module.exports = mongoose.model('Comment', CommentSchema);