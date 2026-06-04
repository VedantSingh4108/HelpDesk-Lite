const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');

dotenv.config();
connectDB();

const seedUsers = async () => {
    try {
        // 1. Wipe the current users so we have a clean slate
        await User.deleteMany();
        console.log('Cleared existing users...');

        // 2. Create an array of our 3 roles
        const users = [
            {
                name: 'Aakash Admin',
                email: 'admin@helpdesk.com',
                password: 'password123', // Keeping it simple for all three
                role: 'admin',
                department: 'IT Operations'
            },
            {
                name: 'Agent Sarah',
                email: 'agent@helpdesk.com',
                password: 'password123',
                role: 'support-agent',
                department: 'Technical Support'
            },
            {
                name: 'Vedant Employee',
                email: 'user@helpdesk.com',
                password: 'password123',
                role: 'end-user'
            }
        ];

        // 3. Insert them into the database (This triggers the Bcrypt hash for all of them!)
        await User.create(users);

        console.log('✅ All test users seeded successfully!');
        console.log('--- Credentials (Password is password123 for all) ---');
        console.log('Admin: admin@helpdesk.com');
        console.log('Agent: agent@helpdesk.com');
        console.log('User:  user@helpdesk.com');

        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

seedUsers();