import mongoose from 'mongoose';
import { matchFastTrack } from '../src/utils/fastTrackMatcher';
import { FAST_TRACK_DATA } from '../src/constants/fastTrackData';

// Mock DB models with proper Mongoose chainable query mocks (.lean(), .select(), etc.)
const mockQuery = (val: any = []) => ({
  lean: jest.fn().mockResolvedValue(val),
  select: jest.fn().mockReturnThis(),
});

jest.mock('../src/models/Task', () => ({
  find: jest.fn().mockImplementation(() => mockQuery([])),
  countDocuments: jest.fn().mockResolvedValue(0)
}));
jest.mock('../src/models/User', () => ({
  find: jest.fn().mockImplementation(() => mockQuery([])),
  findOne: jest.fn().mockImplementation(() => mockQuery(null))
}));
jest.mock('../src/models/Holiday', () => ({
  find: jest.fn().mockImplementation(() => mockQuery([]))
}));
jest.mock('../src/models/Attendance', () => ({
  findOne: jest.fn().mockImplementation(() => mockQuery(null))
}));
jest.mock('../src/models/Leave', () => ({
  find: jest.fn().mockImplementation(() => mockQuery([])),
  findOne: jest.fn().mockImplementation(() => mockQuery(null))
}));

const mockUserId = new mongoose.Types.ObjectId().toString();

describe('Fast Track Semantic Cache (V2)', () => {
  
  it('should match an exact canonical question', async () => {
    const result = await matchFastTrack('What is the leave policy and how do I apply?', 'employee', mockUserId);
    expect(result).not.toBeNull();
    expect(result?.hit).toBe(true);
    expect(result?.matchedIntentId).toBe('leave_policy');
    expect(result?.source).toBe('FAST_TRACK_CACHE_HIT');
  });

  it('should match a paraphrased question with overlap score >= 0.6', async () => {
    const result = await matchFastTrack('where can I download my salary payslip?', 'employee', mockUserId);
    expect(result).not.toBeNull();
    expect(result?.matchedIntentId).toBe('payslip_download');
  });

  it('should return null for queries that do not match the threshold (No Match)', async () => {
    const result = await matchFastTrack('can you write a poem about my dog?', 'employee', mockUserId);
    expect(result).toBeNull();
  });

  it('should correctly block unauthorized roles for admin intents', async () => {
    const query = 'how do i broadcast an announcement in the admin panel';
    
    const employeeResult = await matchFastTrack(query, 'employee', mockUserId);
    expect(employeeResult).toBeNull();

    const adminResult = await matchFastTrack(query, 'admin', mockUserId);
    expect(adminResult).not.toBeNull();
    expect(adminResult?.matchedIntentId).toBe('admin_dashboard_help');
  });

  it('should ignore punctuation and case', async () => {
    const result = await matchFastTrack('   wHAt iS THE lEaVe pOlicy and how do I APply!?!...   ', 'employee', mockUserId);
    expect(result).not.toBeNull();
    expect(result?.matchedIntentId).toBe('leave_policy');
  });

  it('should return null for empty queries', async () => {
    expect(await matchFastTrack('', 'employee', mockUserId)).toBeNull();
    expect(await matchFastTrack('   ', 'employee', mockUserId)).toBeNull();
  });
});
