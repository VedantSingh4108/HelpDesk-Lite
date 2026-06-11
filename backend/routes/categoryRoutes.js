const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory } = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware'); // Admin protection

// Anyone logged in can view categories, but only admins (protected routes) can edit/create
router.route('/')
    .get(protect, getCategories)
    .post(protect, createCategory);

router.route('/:id')
    .put(protect, updateCategory);

module.exports = router;