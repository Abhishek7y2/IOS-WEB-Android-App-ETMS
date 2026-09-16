import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import Message from './src/models/Message';
import Conversation from './src/models/Conversation';
import Announcement from './src/models/Announcement';

dotenv.config();

async function resetAnalytics() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    const m = await Message.deleteMany({});
    const c = await Conversation.deleteMany({});
    const a = await Announcement.deleteMany({});

    console.log(`Deleted ${m.deletedCount} messages, ${c.deletedCount} conversations, ${a.deletedCount} announcements.`);
  } catch (error) {
    console.error('Error resetting analytics:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

resetAnalytics();
