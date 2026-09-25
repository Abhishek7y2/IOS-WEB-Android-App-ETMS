const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

const userSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['member', 'admin', 'superadmin'], default: 'member' },
  isVerified: { type: Boolean, default: true },
  countryCode: { type: String, default: '+91' },
  mobileNumber: { type: String, default: '9876543210' },
  designation: { type: String, default: 'Software Engineer' },
  department: { type: String, default: 'Engineering' }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seedE2EUsers() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/enterprise_task_system';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB at', mongoUri);

  const deterministicUsers = [
    {
      name: 'Super Admin',
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@enterprise.test',
      passwordRaw: 'SuperAdmin@123',
      role: 'superadmin',
      isVerified: true,
      countryCode: '+91',
      mobileNumber: '9876543210',
      designation: 'CTO',
      department: 'Executive'
    },
    {
      name: 'Admin User',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@enterprise.test',
      passwordRaw: 'AdminPass@123',
      role: 'admin',
      isVerified: true,
      countryCode: '+91',
      mobileNumber: '9876543211',
      designation: 'Engineering Manager',
      department: 'Engineering'
    },
    {
      name: 'Rahul Sharma',
      firstName: 'Rahul',
      lastName: 'Sharma',
      email: 'member.a@enterprise.test',
      passwordRaw: 'MemberPass@123',
      role: 'member',
      isVerified: true,
      countryCode: '+91',
      mobileNumber: '9876543212',
      designation: 'Frontend Engineer',
      department: 'Engineering'
    },
    {
      name: 'Priya Singh',
      firstName: 'Priya',
      lastName: 'Singh',
      email: 'member.b@enterprise.test',
      passwordRaw: 'MemberPass@123',
      role: 'member',
      isVerified: true,
      countryCode: '+91',
      mobileNumber: '9876543213',
      designation: 'QA Engineer',
      department: 'QA'
    }
  ];

  for (const u of deterministicUsers) {
    const hashedPassword = await bcrypt.hash(u.passwordRaw, 10);
    await User.findOneAndUpdate(
      { email: u.email },
      {
        name: u.name,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        password: hashedPassword,
        role: u.role,
        isVerified: u.isVerified,
        countryCode: u.countryCode,
        mobileNumber: u.mobileNumber,
        designation: u.designation,
        department: u.department
      },
      { upsert: true, new: true }
    );
    console.log(`Ensured deterministic test user: ${u.email} (${u.role})`);
  }

  await mongoose.disconnect();
  console.log('Deterministic E2E users seeded successfully.');
}

if (require.main === module) {
  seedE2EUsers().catch((err) => {
    console.error('Failed to seed E2E users:', err);
    process.exit(1);
  });
}

module.exports = { seedE2EUsers };
