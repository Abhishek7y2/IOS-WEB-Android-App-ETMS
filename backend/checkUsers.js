const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function checkUsers() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-employee-task-manager';
    await mongoose.connect(mongoUri);

    const users = await User.find({}).select('name email role designation createdAt');
    console.log('ACTIVE_USERS:', JSON.stringify(users, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Error fetching users:', err);
    process.exit(1);
  }
}

checkUsers();
