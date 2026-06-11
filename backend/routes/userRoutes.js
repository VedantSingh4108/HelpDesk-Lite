const express = require('express');
const router = express.Router();

// 1. Import BOTH the existing auth function AND the new management functions
const { authUser, getUsers, updateUserRole, createUser, forgotPassword, resetPassword } = require('../controllers/userController');

// 2. Import your protection middleware (adjust the path if yours is named differently!)
const { protect } = require('../middleware/authMiddleware');

// --- EXISTING ROUTES ---
// When the frontend sends a POST request to /login, it runs the authUser function
router.post('/login', authUser);

// --- NEW ADMIN ROUTES ---
// Fetch all users
router.route('/').get(protect, getUsers).post(protect, createUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
// Update a specific user's role
router.route('/:id/role').put(protect, updateUserRole);

module.exports = router;