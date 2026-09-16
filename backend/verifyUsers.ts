import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

async function verifyAllUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update both emails to be verified
    const result = await User.updateMany(
      { email: { $in: ['abhishek7y4@gmail.com', 'abhishek7y2@gmail.com'] } },
      { isVerified: true }
    );

    console.log(`Updated ${result.modifiedCount} users to isVerified: true`);
  } catch (error) {
    console.error('Error verifying users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

verifyAllUsers();
