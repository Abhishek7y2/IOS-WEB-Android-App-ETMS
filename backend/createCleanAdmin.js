const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['member', 'admin', 'superadmin'], default: 'admin' },
  isVerified: { type: Boolean, default: true },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-employee-task-manager';
    await mongoose.connect(mongoUri);

    const email = 'abhishek7y2@gmail.com';
    const existing = await User.findOne({ email });

    if (existing) {
      console.log(`Admin user ${email} already exists.`);
    } else {
      const newAdmin = new User({
        name: 'Abhishek Sharma',
        email,
        password: 'Admin@123456',
        role: 'superadmin',
        isVerified: true,
      });
      await newAdmin.save();
      console.log(`Clean Primary SuperAdmin user created: ${email} / Admin@123456`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error creating clean admin user:', err);
    process.exit(1);
  }
}

createAdmin();
