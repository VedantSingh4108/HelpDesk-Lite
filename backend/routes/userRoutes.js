const express = require('express');
const router = express.Router();
const { authUser } = require('../controllers/userController');

// Define the login route
// When the frontend sends a POST request to /login, it runs the authUser function
router.post('/login', authUser);

module.exports = router;