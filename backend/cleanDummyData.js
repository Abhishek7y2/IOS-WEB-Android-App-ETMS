const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const TaskSchema = new mongoose.Schema({}, { strict: false });
const UserSchema = new mongoose.Schema({}, { strict: false });

const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function cleanData() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-employee-task-manager';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // 1. Delete all dummy tasks
    const taskDeleteResult = await Task.deleteMany({});
    console.log(`Deleted ${taskDeleteResult.deletedCount} tasks.`);

    // 2. Delete dummy users (keep main admin account if needed or purge all dummy users)
    // Keep real registered users or keep primary admin (abhishek7y2@gmail.com)
    const primaryAdminEmail = 'abhishek7y2@gmail.com';
    const userDeleteResult = await User.deleteMany({ email: { $ne: primaryAdminEmail } });
    console.log(`Deleted ${userDeleteResult.deletedCount} dummy users (retained main admin: ${primaryAdminEmail}).`);

    // Verify remaining users
    const remainingUsers = await User.find({});
    console.log('Remaining Users in Database:', remainingUsers.map(u => ({ id: u._id, email: u.email, name: u.name, role: u.role })));

    console.log('Dummy tasks and dummy users cleaned up successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning dummy data:', error);
    process.exit(1);
  }
}

cleanData();
