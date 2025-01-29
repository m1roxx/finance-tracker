const request = require('supertest');
const app = require('../../app');
const User = require('../models/User');
const { setupDB, closeDB } = require('./setup');

describe('User Registration', () => {
    beforeAll(async () => {
        await setupDB();
    });

    afterAll(async () => {
        await closeDB();
    });

    beforeEach(async () => {
        await User.deleteMany({});
    });

    test('Valid Registration - Success', async () => {
        const response = await request(app)
            .post('/api/users/register')
            .send({
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('message', 'User registered successfully');
    });

    test('Duplicate Email - Error', async () => {
        await User.create({
            email: 'test@example.com',
            password: 'password123'
        });

        const response = await request(app)
            .post('/api/users/register')
            .send({
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123'
            });

        expect(response.statusCode).toBe(409);
        expect(response.body.message).toBe('Email is already in use');
    });

    test('Invalid Email Format - Error', async () => {
        const response = await request(app)
            .post('/api/users/register')
            .send({
                email: 'invalid-email',
                password: 'password123',
                confirmPassword: 'password123'
            });

        expect(response.statusCode).toBe(400);
    });

    test('Missing Password - Error', async () => {
        const response = await request(app)
            .post('/api/users/register')
            .send({
                email: 'test@example.com',
                confirmPassword: 'password123'
            });

        expect(response.statusCode).toBe(400);
    });
});