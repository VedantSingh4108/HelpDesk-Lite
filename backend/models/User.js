const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // 1. Bring in the Scrambler

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // This will now be automatically hashed
    role: {
        type: String,
        enum: ['end-user', 'support-agent', 'admin'],
        default: 'end-user'
    },
    department: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// 2. The "Pre-Save" Hook: Automatically hash the password before saving a new user
UserSchema.pre('save', async function (next) {
    // If the password hasn't been changed/added, move on
    if (!this.isModified('password')) {
        return next();
    }
    // Scramble it with a "salt" of 10 rounds
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// 3. The Matcher: Method to check if entered password matches the hashed password during login
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);