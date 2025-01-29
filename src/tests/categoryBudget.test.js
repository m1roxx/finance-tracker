const request = require('supertest');
const app = require('../../app');
const User = require('../models/User');
const CategoryBudget = require('../models/CategoryBudget');
const { setupDB, closeDB } = require('./setup');
const jwt = require('jsonwebtoken');

describe('Category Budget Controller', () => {
    let authToken;
    let testUser;

    beforeAll(async () => {
        await setupDB();

        testUser = await User.create({
            email: 'test@budget.com',
            password: 'password123'
        });

        authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET);
    });

    afterAll(async () => {
        await closeDB();
    });

    beforeEach(async () => {
        await CategoryBudget.deleteMany({});
    });

    test('Create/Update Budget - Success', async () => {
        const response = await request(app)
            .post('/api/budgets')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                categoryId: 'Food',
                plannedAmount: 500,
                month: '2024-01'
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('category', 'Food');
    });
});