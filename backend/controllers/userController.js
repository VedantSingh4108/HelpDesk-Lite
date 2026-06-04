const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to generate a JWT
const generateToken = (id, role) => {
    // Signs the token with a secret key, expires in 30 days
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'supersecretkey123', {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token (LOGIN)
// @route   POST /api/users/login
const authUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        // Check if user exists AND if the password matches our Bcrypt hash
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role), // Give them the VIP pass
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { authUser };