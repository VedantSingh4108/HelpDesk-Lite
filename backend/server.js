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

app.use(cors());
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
// Add this right below app.use('/api/tickets', ...);
app.use('/api/comments', require('./routes/commentRoutes'));
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});