import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';
import Task from './src/models/Task';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/employee-task-manager');
        console.log('Connected to MongoDB');

        // Delete existing seeded users so we can re-create them with the new password
        await User.deleteMany({ email: { $in: ['rahul.s@example.com', 'priya.s@example.com'] } });

        const employeesData = [
            {
                name: 'Rahul Sharma',
                firstName: 'Rahul',
                lastName: 'Sharma',
                email: 'rahul.s@example.com',
                mobileNumber: '9123456781',
                countryCode: '+91',
                gender: 'Male',
                password: 'employee@1',
                role: 'member',
                isVerified: true,
                status: 'active'
            },
            {
                name: 'Priya Singh',
                firstName: 'Priya',
                lastName: 'Singh',
                email: 'priya.s@example.com',
                mobileNumber: '9123456782',
                countryCode: '+91',
                gender: 'Female',
                password: 'employee@1',
                role: 'member',
                isVerified: true,
                status: 'active'
            }
        ];

        for (const data of employeesData) {
            let user = await User.findOne({ email: data.email });
            if (!user) {
                user = await User.create(data);
                console.log(`Created user: ${user.email} with password employee@1`);
            } else {
                console.log(`User already exists: ${user.email}`);
            }

            // Remove any existing tasks to avoid duplicates on re-run
            await Task.deleteMany({ assignedTo: user._id });

            // Create 4 tasks for this user with different priorities
            const tasksData = [
                {
                    title: 'Onboarding Documentation',
                    description: 'Complete all mandatory HR onboarding documents and sign policies.',
                    assignedTo: user._id,
                    assignedBy: user._id,
                    createdBy: user._id, // Assume self-assigned or system assigned
                    priority: 'high',
                    status: 'todo',
                    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
                },
                {
                    title: 'Setup Development Environment',
                    description: 'Install necessary IDEs, pull repositories, and ensure local build is successful.',
                    assignedTo: user._id,
                    assignedBy: user._id,
                    createdBy: user._id,
                    priority: 'critical',
                    status: 'in_progress',
                    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 1 day
                },
                {
                    title: 'Review System Architecture',
                    description: 'Read the system architecture documentation and familiarize yourself with the codebase.',
                    assignedTo: user._id,
                    assignedBy: user._id,
                    createdBy: user._id,
                    priority: 'medium',
                    status: 'todo',
                    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days
                },
                {
                    title: 'Submit Weekly Report',
                    description: 'Fill out the weekly progress report in the HR portal.',
                    assignedTo: user._id,
                    assignedBy: user._id,
                    createdBy: user._id,
                    priority: 'low',
                    status: 'completed',
                    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // yesterday
                }
            ];

            await Task.insertMany(tasksData);
            console.log(`Created 4 tasks for user: ${user.email}`);
        }

        console.log('Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
