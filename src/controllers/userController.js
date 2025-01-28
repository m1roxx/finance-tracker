const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../services/emailService');

// Registration
const registerUser = async (req, res) => {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email is already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (user.twoFactorEnabled) {
            const code = await generate2FACode(user);
            await sendVerificationEmail(user.email, code);

            const tempToken = jwt.sign(
                { id: user._id, email: user.email, requiresTwoFactor: true },
                process.env.JWT_SECRET,
                { expiresIn: '10m' }
            );

            return res.json({
                requiresTwoFactor: true,
                tempToken,
                message: 'Please check your email for verification code'
            });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, redirectUrl: '/settings' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUser = async (req, res) => {
    try {
        res.json({ id: req.user._id, email: req.user.email });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const enable2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.twoFactorEnabled = true;
        await user.save();
        res.json({ message: '2FA enabled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const generate2FACode = async (user) => {
    const code = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.twoFactorCode = code;
    user.twoFactorCodeExpires = expires;
    await user.save();

    return code;
};

const verify2FACode = async (req, res) => {
    const { code } = req.body;
    try {
        const user = await User.findById(req.user._id);

        if (!user.twoFactorCode || user.twoFactorCode !== code) {
            return res.status(401).json({ message: 'Invalid code' });
        }

        if (new Date() > user.twoFactorCodeExpires) {
            return res.status(401).json({ message: 'Code expired' });
        }

        user.twoFactorCode = null;
        user.twoFactorCodeExpires = null;
        await user.save();

        const token = jwt.sign(
            { id: user._id, email: user.email, twoFactorVerified: true },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { registerUser, loginUser, getUser, enable2FA, verify2FACode };