const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    twoFactorSecret: { type: String },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorCode: { type: String },
    twoFactorCodeExpires: { type: Date },
    activeToken: String
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;