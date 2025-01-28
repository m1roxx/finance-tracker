const express = require('express');
const { registerUser, loginUser, getUser, verify2FACode, enable2FA } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-2fa', authMiddleware, verify2FACode);
router.post('/enable-2fa', authMiddleware, enable2FA);
router.get('/me', authMiddleware, getUser);

module.exports = router;