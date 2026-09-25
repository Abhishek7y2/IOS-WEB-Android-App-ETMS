import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../models/User';

// MOCK EXTERNAL SERVICES
jest.mock('../utils/twilio', () => ({
  sendSmsOtp: jest.fn().mockResolvedValue(true)
}));

jest.mock('../utils/mailer', () => ({
  sendEmailOtp: jest.fn().mockResolvedValue(true),
  sendWelcomeEmail: jest.fn().mockResolvedValue(true)
}));

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await User.deleteMany({});
});

import PhoneVerification from '../models/PhoneVerification';
import EmailVerification from '../models/EmailVerification';

describe('Mass Assignment Tests', () => {
    it('SEC-MASS-001: POST /api/auth/register - Should not self-promote to admin', async () => {
        // Pre-create verified OTP records to bypass the 400 validation error
        await PhoneVerification.create({ mobileNumber: '8888888888', countryCode: '+91', otp: '123456', verified: true, expiresAt: new Date(Date.now() + 3600000) });
        await EmailVerification.create({ email: 'mass-assignment@example.com', otp: '123456', verified: true, expiresAt: new Date(Date.now() + 3600000) });

        const payload = {
            email: 'mass-assignment@example.com',
            password: 'ValidPassword123!',
            firstName: 'Mass',
            lastName: 'Assignment',
            mobileNumber: '8888888888',
            countryCode: '+91',
            gender: 'Male',
            role: 'admin',
            isAdmin: true,
            isSuperAdmin: true
        };
        
        const res = await request(app).post('/api/auth/register').send(payload);
        console.log('Registration Response Status:', res.statusCode);
        console.log('Registration Response Body:', JSON.stringify(res.body, null, 2));
        
        // Assert the HTTP response
        expect(res.statusCode).toBe(201); // Assuming standard registration succeeds
        
        // Inspect the DB
        const createdUser = await User.findOne({ email: 'mass-assignment@example.com' }).select('+password');
        expect(createdUser).not.toBeNull();
        
        // Assert role did not elevate
        expect(createdUser?.role).toBe('member');
        
        // Assert password is encrypted
        expect(createdUser?.password).not.toBe('ValidPassword123!');
        expect(createdUser?.password).toMatch(/^\$2[aby]\$/); // bcrypt hash format
    });
});
