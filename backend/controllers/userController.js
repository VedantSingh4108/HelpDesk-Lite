const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
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
// @desc    Forgot Password (Generates token & sends email)
// @route   POST /api/users/forgotpassword
// @access  Public
// @desc    Forgot Password (Generates token & sends email)
// @route   POST /api/users/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    console.log("\n--- STARTING PASSWORD RESET FLOW ---");
    console.log("1. Email received from frontend:", req.body.email);

    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            console.log("2. Result: User NOT found in database.");
            return res.status(200).json({ message: 'If that email is in our system, a reset link has been sent.' });
        }
        console.log("2. Result: User FOUND!", user.name);

        console.log("3. Generating secure tokens...");
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        console.log("4. Saving temporary tokens to database...");
        await user.save();
        console.log("-> Tokens saved successfully.");

        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
        const message = `
            You are receiving this email because you (or someone else) has requested the reset of a password.
            Please click on the following link, or paste it into your browser to complete the process:
            \n\n${resetUrl}\n\n
            This link will expire in 10 minutes.
        `;

        console.log("5. Attempting to send email via Nodemailer...");
        try {
            await sendEmail({
                email: user.email,
                subject: 'Helpdesk Platform - Password Reset Token',
                message
            });
            console.log("6. SUCCESS! Email handed off to Google Post Office.");
            res.status(200).json({ message: 'If that email is in our system, a reset link has been sent.' });
        } catch (err) {
            console.error("!!! NODEMAILER ERROR:", err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ message: 'Email could not be sent: ' + err.message });
        }
    } catch (error) {
        console.error("!!! FATAL DATABASE OR CODE ERROR:", error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Reset Password (Verifies token & saves new password)
// @route   PUT /api/users/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
    try {
        // 1. Get the hashed version of the token the user sent in the URL
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

        // 2. Find the user with that exact token AND ensure it hasn't expired
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() } // "Greater Than" right now
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // 3. Set the new password 
        // (Remember: Your User model automatically hashes passwords before saving!)
        user.password = req.body.password;

        // 4. Clean up the token so it can't be used again
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error("Error", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
module.exports = { authUser, getUsers, updateUserRole, createUser, forgotPassword, resetPassword };