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

const taskTemplates = [
  {
    title: 'Implement OAuth 2.0 & SSO Authentication Flow',
    description: 'Configure OAuth 2.0 social sign-in endpoints and JWT token refresh middleware for enterprise single sign-on.',
    priority: 'high',
  },
  {
    title: 'Design Responsive Enterprise Task Manager UI',
    description: 'Build glassmorphic date filters, dark-mode toggle components, and dashboard metrics cards with Tailwind CSS.',
    priority: 'high',
  },
  {
    title: 'Setup MongoDB Atlas Indexing & Query Optimizations',
    description: 'Add compound indexes on assignedTo, status, and createdAt fields to optimize query execution speed.',
    priority: 'medium',
  },
  {
    title: 'Integrate Gemini 1.5 RAG Document Knowledge Base',
    description: 'Configure PDF text extraction, document vector embeddings, and real-time SSE token streaming for AI assistant.',
    priority: 'critical',
  },
  {
    title: 'Conduct Security Audit & Penetration Testing',
    description: 'Audit CORS headers, XSS sanitization middleware, Bcrypt salt iterations, and HTTP-only cookie security.',
    priority: 'high',
  },
  {
    title: 'Publish Mobile Expo App for iOS & Android Devices',
    description: 'Configure Expo SecureStore JWT auth persistence, push notification handlers, and biometric authentication.',
    priority: 'medium',
  },
  {
    title: 'Build Real-Time Socket.io Workspace Notifications',
    description: 'Implement WebSocket channels for instant assignment updates, task status changes, and team comments.',
    priority: 'high',
  },
  {
    title: 'Configure Automated CI/CD Pipeline with GitHub Actions',
    description: 'Automate Jest unit test suite execution, Next.js production build checks, and Docker image deployment.',
    priority: 'medium',
  },
  {
    title: 'Optimize Front-End Bundle Size & Asset Compression',
    description: 'Use Next.js dynamic imports, tree-shaking, WebP image optimization, and Gzip/Brotli compression.',
    priority: 'low',
  },
  {
    title: 'Implement Dark Mode Accessibility Theme Controls',
    description: 'Add WCAG AAA compliant color contrast tokens and smooth CSS transition themes across all dashboard widgets.',
    priority: 'low',
  },
  {
    title: 'Audit User Data Compliance for DPDP Act 2023',
    description: 'Ensure user right to data erasure and export features comply with Indian Digital Personal Data Protection Act.',
    priority: 'critical',
  },
  {
    title: 'Develop Enterprise Analytics & Performance Metrics Reports',
    description: 'Build interactive charts showing team task velocity, sprint burn-down rates, and completion stats.',
    priority: 'high',
  },
  {
    title: 'Refactor REST API Controllers with Clean Architecture',
    description: 'Decouple business logic into service layer repositories and enforce DTO validation with strict TypeScript interfaces.',
    priority: 'medium',
  },
  {
    title: 'Configure Redis Distributed Caching for Frequent Queries',
    description: 'Cache employee profiles, active team rosters, and read-heavy task summaries with a 10-minute TTL.',
    priority: 'high',
  },
  {
    title: 'Implement End-to-End Cypress Integration Test Suite',
    description: 'Write automated browser test specs covering login, task creation, status transition, and employee management.',
    priority: 'medium',
  },
  {
    title: 'Setup Centralized Cloud Logging & Alerting with Sentry',
    description: 'Integrate Sentry error boundary tracking on Next.js frontend and Winston log aggregators on Express backend.',
    priority: 'high',
  },
  {
    title: 'Create Microservices Docker Compose Environment',
    description: 'Containerize backend Node service, MongoDB replica set, and Redis instance for reproducible developer environments.',
    priority: 'medium',
  },
  {
    title: 'Build Dynamic Employee Attendance & Leave Tracking System',
    description: 'Implement clock-in geo-fencing, sick leave approval workflows, and monthly exportable payroll attendance sheets.',
    priority: 'high',
  },
  {
    title: 'Implement Real-Time Team Chat & Direct Messaging Channels',
    description: 'Develop WebRTC group audio channels, unread message badges, and media attachment upload in direct messages.',
    priority: 'critical',
  },
  {
    title: 'Perform Annual Architecture Review & Technical Debt Cleanup',
    description: 'Upgrade deprecated npm dependencies, eliminate redundant code paths, and document REST API endpoints in Swagger.',
    priority: 'low',
  },
];

const statuses = [
  'todo', 'todo', 'todo', 'todo', 'todo',
  'in_progress', 'in_progress', 'in_progress', 'in_progress', 'in_progress',
  'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed',
  'overdue', 'overdue', 'overdue',
];

async function seed20TasksPerUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({ isArchived: { $ne: true } });
    if (users.length === 0) {
      console.log('No users found in database.');
      process.exit(0);
    }

    console.log(`Found ${users.length} active users.`);
    const admin = users.find(u => u.role === 'admin' || u.role === 'superadmin') || users[0];

    // Clear existing tasks
    await Task.deleteMany({});
    console.log('Cleared existing tasks.');

    const allTasks = [];

    for (let u = 0; u < users.length; u++) {
      const user = users[u];

      for (let t = 0; t < 20; t++) {
        const template = taskTemplates[t % taskTemplates.length];
        const status = statuses[t % statuses.length];

        let dueDate;
        const now = Date.now();
        if (status === 'completed') {
          dueDate = new Date(now - (t + 1) * 24 * 60 * 60 * 1000);
        } else if (status === 'overdue') {
          dueDate = new Date(now - (t + 3) * 24 * 60 * 60 * 1000);
        } else if (status === 'in_progress') {
          dueDate = new Date(now + (t + 2) * 24 * 60 * 60 * 1000);
        } else {
          dueDate = new Date(now + (t + 5) * 24 * 60 * 60 * 1000);
        }

        allTasks.push({
          title: `${template.title} [Sprint ${Math.floor(t / 5) + 1}]`,
          description: `${template.description} Assigned specifically to ${user.name} (${user.designation || 'Specialist'}).`,
          status,
          priority: template.priority,
          dueDate,
          assignedTo: user._id,
          assignedBy: admin._id,
          isArchived: false,
          createdAt: new Date(now - (20 - t) * 3600 * 1000 * 6),
        });
      }
    }

    console.log(`Inserting ${allTasks.length} tasks (${users.length} users * 20 tasks each)...`);
    const insertResult = await Task.insertMany(allTasks);
    console.log(`Successfully seeded ${insertResult.length} tasks across ${users.length} users in MongoDB!`);

    const totalCount = await Task.countDocuments({});
    console.log(`Total tasks count in database: ${totalCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding tasks:', error);
    process.exit(1);
  }
}

seed20TasksPerUser();
