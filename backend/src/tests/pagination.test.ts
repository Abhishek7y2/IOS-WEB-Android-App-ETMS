import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../models/User';
import { signToken } from '../utils/jwt';

let mongoServer: MongoMemoryServer;
let adminToken: string;
let memberToken: string;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    await mongoose.connect(uri);

    // Create a bunch of users
    const usersToCreate = [];
    for(let i=0; i<15; i++) {
        usersToCreate.push({
            name: `User ${i}`,
            email: `user${i}@example.com`,
            password: 'hashedPassword',
            role: 'member',
            mobileNumber: `900000000${i.toString().padStart(2, '0')}`,
            countryCode: '+91'
        });
    }
    await User.insertMany(usersToCreate);

    const admin = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'hashedPassword',
        role: 'admin',
        mobileNumber: '8000000000',
        countryCode: '+91'
    });

    const member = await User.findOne({ email: 'user0@example.com' });

    adminToken = signToken({ id: admin._id, email: admin.email });
    memberToken = signToken({ id: member?._id, email: member?.email });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Pagination Tests - /api/auth/users', () => {
    it('PAG-001: ?page=1&limit=10 - Expected: maximum 10 users returned', async () => {
        const res = await request(app)
            .get('/api/auth/users?page=1&limit=10')
            .set('Authorization', `Bearer ${adminToken}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.data.users.length).toBe(10);
        expect(res.body.data.pagination.page).toBe(1);
    });

    it('PAG-002: ?page=2&limit=10 - Expected: different page of results', async () => {
        const res = await request(app)
            .get('/api/auth/users?page=2&limit=10')
            .set('Authorization', `Bearer ${adminToken}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.data.users.length).toBe(6); // 15 members + 1 admin = 16 total. page 1 has 10, page 2 has 6
        expect(res.body.data.pagination.page).toBe(2);
    });

    it('PAG-003: No pagination parameters - Expected: safe default', async () => {
        const res = await request(app)
            .get('/api/auth/users')
            .set('Authorization', `Bearer ${adminToken}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.data.users.length).toBe(16); // limit defaults to 50, so all 16 returned
        expect(res.body.data.pagination.limit).toBe(50);
    });

    it('PAG-004: limit=100000 - Expected: server enforces maximum limit', async () => {
        const res = await request(app)
            .get('/api/auth/users?limit=100000')
            .set('Authorization', `Bearer ${adminToken}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.data.pagination.limit).toBe(100);
    });

    it('PAG-005 & PAG-006: limit=-1, page=-1 - Expected: safe default behavior', async () => {
        const res = await request(app)
            .get('/api/auth/users?page=-1&limit=-1')
            .set('Authorization', `Bearer ${adminToken}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.data.pagination.page).toBe(1);
        expect(res.body.data.pagination.limit).toBe(1); // Min limit is 1
    });

    it('PAG-007: Non-admin attempts endpoint - Expected: authorization enforced (allow members)', async () => {
        const res = await request(app)
            .get('/api/auth/users')
            .set('Authorization', `Bearer ${memberToken}`);
        
        expect(res.statusCode).toBe(200);
    });

    it('PAG-008: Verify total count', async () => {
        const res = await request(app)
            .get('/api/auth/users?limit=5')
            .set('Authorization', `Bearer ${adminToken}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.data.pagination.total).toBe(16);
        expect(res.body.data.pagination.totalPages).toBe(4); // 16 / 5 = 3.2 -> ceil -> 4
    });
});
