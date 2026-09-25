import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';

beforeAll(async () => {
    // Optionally connect to test db here if not already handled
});

afterAll(async () => {
    await mongoose.connection.close();
});

jest.setTimeout(20000);

describe('Authentication API Tests', () => {
    it('POST /api/auth/register - Should reject weak password', async () => {
        const res = await request(app).post('/api/auth/register').send({
            email: 'test@gmail.com',
            password: 'password',
            firstName: 'John',
            lastName: 'Doe',
            mobileNumber: '9999999999',
            countryCode: '+91',
            gender: 'Male'
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/register - Mass Assignment (role: admin)', async () => {
        const res = await request(app).post('/api/auth/register').send({
            email: 'admin_test@gmail.com',
            password: 'StrongPassword123!',
            firstName: 'Admin',
            lastName: 'User',
            mobileNumber: '9999999991',
            countryCode: '+91',
            gender: 'Male',
            role: 'admin'
        });
        // Might be 400 or it might sanitize and return 201 with member role
        // For mass assignment, it shouldn't elevate privileges
    });

    it('POST /api/auth/login - NoSQL Injection attempt', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: { "$gt": "" },
            password: 'password123'
        });
        expect(res.statusCode).toBe(400); // Should be rejected by validation
    });

    it('GET /api/auth/users - Missing authentication', async () => {
        const res = await request(app).get('/api/auth/users');
        expect(res.statusCode).toBe(401);
    });
});
