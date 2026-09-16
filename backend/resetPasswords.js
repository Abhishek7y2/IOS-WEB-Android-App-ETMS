const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

async function resetPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    const result = await mongoose.connection.collection('users').updateMany(
      {},
      {
        $set: {
          password: hashedPassword,
          isVerified: true,
          isBlocked: false,
        },
      }
    );

    console.log(`Successfully updated passwords for ${result.modifiedCount} users to 'Admin123!'`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to reset passwords:', err);
    process.exit(1);
  }
}

resetPasswords();
