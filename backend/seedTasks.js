const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['todo', 'in_progress', 'completed', 'overdue', 'cancelled'], default: 'todo' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical', 'urgent'], default: 'medium' },
  dueDate: { type: Date, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({ isArchived: { $ne: true } });
    if (users.length === 0) {
      console.log('No users found in database.');
      process.exit(0);
    }

    console.log(`Found ${users.length} users in database.`);
    const admin = users.find(u => u.role === 'admin' || u.role === 'superadmin') || users[0];

    const initialTasks = [
      {
        title: 'Implement OAuth 2.0 & SSO Authentication Flow',
        description: 'Configure OAuth 2.0 social sign-in endpoints and JWT token refresh middleware for enterprise single sign-on.',
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        assignedTo: users[0]._id,
        assignedBy: admin._id,
      },
      {
        title: 'Design Responsive Enterprise Task Manager UI',
        description: 'Build glassmorphic date filters, dark-mode toggle components, and dashboard metrics cards with Tailwind CSS.',
        status: 'completed',
        priority: 'high',
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        assignedTo: users[1 % users.length]._id,
        assignedBy: admin._id,
      },
      {
        title: 'Setup MongoDB Atlas Indexing & Query Optimizations',
        description: 'Add compound indexes on assignedTo, status, and createdAt fields to optimize query execution speed.',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        assignedTo: users[2 % users.length]._id,
        assignedBy: admin._id,
      },
      {
        title: 'Integrate Gemini 1.5 RAG Document Knowledge Base',
        description: 'Configure PDF text extraction, document vector embeddings, and real-time SSE token streaming for AI assistant.',
        status: 'in_progress',
        priority: 'critical',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        assignedTo: users[3 % users.length]._id,
        assignedBy: admin._id,
      },
      {
        title: 'Conduct Security Audit & Penetration Testing',
        description: 'Audit CORS headers, XSS sanitization middleware, Bcrypt salt iterations, and HTTP-only cookie security.',
        status: 'todo',
        priority: 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        assignedTo: users[4 % users.length]._id,
        assignedBy: admin._id,
      },
      {
        title: 'Publish Mobile Expo App for iOS & Android Devices',
        description: 'Configure Expo SecureStore JWT auth persistence, push notification handlers, and biometric authentication.',
        status: 'completed',
        priority: 'medium',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        assignedTo: users[5 % users.length]._id,
        assignedBy: admin._id,
      },
    ];

    // Clear existing tasks and seed fresh tasks
    await Task.deleteMany({});
    const inserted = await Task.insertMany(initialTasks);
    console.log(`Successfully seeded ${inserted.length} enterprise tasks in MongoDB!`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedData();
