const { mockRequest, mockResponse } = require('./mocks');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { setupDB, closeDB } = require('./setup');

process.env.JWT_SECRET = 'test_secret';

describe('Auth Middleware', () => {
    let mockUser;

    beforeAll(async () => {
        await setupDB();
        mockUser = await User.create({
            email: 'auth@test.com',
            password: 'hashedPassword',
            twoFactorEnabled: false
        });
    });

    afterAll(async () => {
        await closeDB();
    });

    test('Valid Token - Success', async () => {
        const token = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET);
        const req = mockRequest({ headers: { authorization: `Bearer ${token}` } });
        const res = mockResponse();
        const next = jest.fn();

        await authMiddleware(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(req.user).toBeDefined();
    });

    test('Invalid Token - Error', async () => {
        const req = mockRequest({ headers: { authorization: 'Bearer invalidToken' } });
        const res = mockResponse();
        const next = jest.fn();

        await authMiddleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
    });
});