const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to generate a JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'supersecretkey123', {
        expiresIn: '30d',
    });
};

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
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

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        // Fetch all users but exclude their passwords for security
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.role = req.body.role || user.role;
            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user role', error: error.message });
    }
};

// @desc    Create a new user (Admin Panel)
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
    // UPDATED: Added password extraction here
    const { name, email, role, password } = req.body;

    try {
        // 1. Check if the email is already in use
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // 2. Create the user
        const user = await User.create({
            name,
            email,
            // UPDATED: Use provided password if it exists, otherwise use default
            password: password || 'Password123!',
            // FIXED: Changed 'user' to 'end-user' to perfectly match Mongoose enum
            role: role || 'end-user'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data received' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to create user', error: error.message });
    }
};

module.exports = { authUser, getUsers, updateUserRole, createUser };