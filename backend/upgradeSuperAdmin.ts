import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

async function upgradeUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const emailToUpgrade = 'abhishek7y2@gmail.com';
    const user = await User.findOneAndUpdate(
      { email: emailToUpgrade },
      { role: 'superadmin', designation: 'CEO' },
      { new: true }
    );

    if (user) {
      console.log(`Successfully upgraded ${user.email} to Super Admin (Role: ${user.role}, Designation: ${user.designation})`);
    } else {
      console.log(`User with email ${emailToUpgrade} not found.`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

upgradeUser();
