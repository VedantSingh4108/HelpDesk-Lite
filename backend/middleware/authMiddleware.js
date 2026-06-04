const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // Check if the request headers have an "Authorization" token that starts with "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get the token from the header (looks like "Bearer eyJhbGci...")
            token = req.headers.authorization.split(' ')[1];

            // Decode the token using your secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey123');

            // Find the user in the database and attach them to the request object (minus the password)
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Move on to the actual controller function
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };