const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

const designations = [
  'Senior Frontend Engineer',
  'Backend Systems Architect',
  'Full Stack Developer',
  'UI/UX Product Designer',
  'DevOps & Cloud Engineer',
  'QA Automation Specialist',
  'Data Engineer',
  'Security & Compliance Analyst',
  'Mobile App Engineer (React Native)',
  'Technical Product Manager',
  'Database Administrator',
  'AI & ML Engineer',
  'Site Reliability Engineer (SRE)',
  'Scrum Master',
  'Software Quality Analyst',
];

const firstNames = [
  'Aarav', 'Ananya', 'Rohan', 'Pooja', 'Vikram', 'Neha', 'Aditya', 'Sneha',
  'Karan', 'Kavita', 'Siddharth', 'Meera', 'Varun', 'Riya', 'Gaurav', 'Isha',
  'Manish', 'Divya', 'Rahul', 'Tanvi', 'Abhishek', 'Shreya', 'Amit', 'Swati',
  'Nikhil', 'Priti', 'Sanjay', 'Pooja', 'Rajesh', 'Alka', 'Deepak', 'Simran',
  'Harsh', 'Kriti', 'Arjun', 'Bhavna', 'Mayank', 'Geeta', 'Sachin', 'Jyoti',
  'Ashish', 'Mansi', 'Kunal', 'Archana', 'Vishal', 'Pallavi', 'Tushar', 'Sunita',
  'Yash', 'Ritu'
];

const lastNames = [
  'Sharma', 'Verma', 'Patel', 'Iyer', 'Singh', 'Gupta', 'Mehta', 'Reddy',
  'Nair', 'Joshi', 'Chopra', 'Malhotra', 'Bhatia', 'Deshmukh', 'Saxena', 'Kapoor',
  'Rao', 'Pandey', 'Mishra', 'Agarwal', 'Chatterjee', 'Banerjee', 'Bose', 'Dutta',
  'Kulkarni', 'Sengupta', 'Pillai', 'Menon', 'Goyal', 'Bansal', 'Thakur', 'Chauhan',
  'Yadav', 'Rawat', 'Tiwari', 'Shukla', 'Dubey', 'Tripathi', 'Goswami', 'Chakraborty',
  'Mukherjee', 'Das', 'Roy', 'Sen', 'Ghoshal', 'Bhattacharya', 'Sinha', 'Choudhury',
  'Majumdar', 'Paul'
];

async function seed50Members() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    const existingUsers = await mongoose.connection.collection('users').find({}).toArray();
    console.log(`Current existing users count: ${existingUsers.length}`);

    const newUsers = [];
    for (let i = 0; i < 50; i++) {
      const fName = firstNames[i % firstNames.length];
      const lName = lastNames[i % lastNames.length];
      const name = `${fName} ${lName}`;
      const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${i + 1}@company.com`;
      const mobileNumber = `98${String(10000000 + i + existingUsers.length).padStart(8, '0')}`;
      const designation = designations[i % designations.length];
      const gender = i % 2 === 0 ? 'Male' : 'Female';
      const role = i === 0 || i === 12 || i === 25 ? 'admin' : 'member';
      const avatarId = (i % 70) + 1;
      const avatarUrl = `https://i.pravatar.cc/150?img=${avatarId}`;

      newUsers.push({
        name,
        firstName: fName,
        lastName: lName,
        email,
        password: hashedPassword,
        role,
        designation,
        mobileNumber,
        countryCode: '+91',
        gender,
        qualification: 'B.Tech / MCA',
        isVerified: true,
        isBlocked: false,
        isArchived: false,
        profilePicture: avatarUrl,
        termsAndConditions: true,
        createdAt: new Date(Date.now() - (50 - i) * 3600 * 1000 * 4),
        updatedAt: new Date(),
      });
    }

    const insertResult = await mongoose.connection.collection('users').insertMany(newUsers);
    console.log(`Successfully created and seeded ${insertResult.insertedCount} mock members in MongoDB!`);

    const totalUsers = await mongoose.connection.collection('users').countDocuments({ isArchived: { $ne: true } });
    console.log(`Total active workspace members in database: ${totalUsers}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding 50 members:', error);
    process.exit(1);
  }
}

seed50Members();
