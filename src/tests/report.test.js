const request = require('supertest');
const app = require('../../app');
const User = require('../models/User');
const Report = require('../models/Report');
const { setupDB, closeDB } = require('./setup');
const jwt = require('jsonwebtoken');

describe('Report Controller', () => {
    let userToken;
    let testUser;

    beforeAll(async () => {
        await setupDB();

        testUser = await User.create({
            email: 'test@report.com',
            password: 'password123'
        });

        userToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET);
    });

    afterAll(async () => {
        await closeDB();
    });

    beforeEach(async () => {
        await Report.deleteMany({});
    });

    test('Create Report - Invalid Month', async () => {
        const response = await request(app)
            .post('/api/reports')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ month: 'InvalidMonth', year: 2023 });

        expect(response.statusCode).toBe(400);
    });

    test('Get Report by Month - Success', async () => {
        await Report.create({
            userId: testUser._id,
            month: 'January',
            year: 2023,
            categories: {
                income: [{ category: 'Salary', actual: 1000 }],
                expense: [{ category: 'Rent', actual: 500 }]
            }
        });

        const response = await request(app)
            .get('/api/reports/January/2023')
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.categories.income).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ actual: 1000 })
            ])
        );
    });
});