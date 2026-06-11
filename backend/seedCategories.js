const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category'); // Adjust path if needed

dotenv.config();

const defaultCategories = [
    { name: 'Technical Support', description: 'Hardware and software issues.' },
    { name: 'Billing & Subscriptions', description: 'Invoice and payment questions.' },
    { name: 'Feature Request', description: 'Ideas for new platform features.' },
    { name: 'Account Access', description: 'Password resets and login help.' }
];

const seedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        // Optional: Clear existing categories before seeding to avoid duplicates
        await Category.deleteMany();

        await Category.insertMany(defaultCategories);
        console.log('✅ Categories successfully seeded!');

        process.exit();
    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        process.exit(1);
    }
};

seedCategories();