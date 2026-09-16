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

async function seedFullData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({ isArchived: { $ne: true } });
    if (users.length === 0) {
      console.log('No users found in database.');
      process.exit(0);
    }

    const admin = users.find(u => u.role === 'admin' || u.role === 'superadmin') || users[0];

    const enterpriseTasks = [
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
      {
        title: 'Build Real-Time Socket.io Workspace Notifications',
        description: 'Implement WebSocket channels for instant assignment updates, task status changes, and team comments.',
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        assignedTo: users[6 % users.length]._id,
        assignedBy: admin._id,
      },
      {
        title: 'Configure Automated CI/CD Pipeline with GitHub Actions',
        description: 'Automate Jest unit test suite execution, Next.js production build checks, and Docker image deployment.',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        assignedTo: users[0]._id,
        assignedBy: admin._id,
      },
      {
        title: 'Optimize Front-End Bundle Size & Asset Compression',
        description: 'Use Next.js dynamic imports, tree-shaking, WebP image optimization, and Gzip/Brotli compression.',
        status: 'completed',
        priority: 'low',
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        assignedTo: users[1 % users.length]._id,
        assignedBy: admin._id,
      },
      {
        title: 'Implement Dark Mode Accessibility Theme Controls',
        description: 'Add WCAG AAA compliant color contrast tokens and smooth CSS transition themes across all dashboard widgets.',
        status: 'todo',
        priority: 'low',
        dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        assignedTo: users[2 % users.length]._id,
        assignedBy: admin._id,
      },
      {
        title: 'Audit User Data Compliance for DPDP Act 2023',
        description: 'Ensure user right to data erasure and export features comply with Indian Digital Personal Data Protection Act.',
        status: 'in_progress',
        priority: 'critical',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        assignedTo: users[3 % users.length]._id,
        assignedBy: admin._id,
      },
      {
        title: 'Develop Enterprise Analytics & Performance Metrics Reports',
        description: 'Build interactive charts showing team task velocity, sprint burn-down rates, and completion stats.',
        status: 'todo',
        priority: 'high',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        assignedTo: users[4 % users.length]._id,
        assignedBy: admin._id,
      },
    ];

    await Task.deleteMany({});
    const inserted = await Task.insertMany(enterpriseTasks);
    console.log(`Successfully seeded ${inserted.length} enterprise tasks across ${users.length} team members!`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedFullData();
