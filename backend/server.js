const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const aiRoutes = require('./routes/aiRoutes');

const cors = require('cors');

connectDB();

const app = express();

// ==========================================
// NEW CORS CONFIGURATION
// ==========================================
const allowedOrigins = [
    'http://localhost:5173', // For your local frontend testing
    'https://help-desk-lite-neon.vercel.app' // Your live Vercel frontend
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like Postman or server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
// ==========================================

// Middleware to allow the server to accept JSON data in the body
app.use(express.json());

// A basic test route
app.get('/', (req, res) => {
    res.send('API is running... ready for tickets!');
});

// Mount the user routes
app.use('/api/users', userRoutes);
// Mount the ticket routes
app.use('/api/tickets', ticketRoutes);
// Mount the AI routes
app.use('/api/ai', aiRoutes);
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});