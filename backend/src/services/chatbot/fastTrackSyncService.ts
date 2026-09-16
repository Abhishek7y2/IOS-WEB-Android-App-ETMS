import FastTrack from '../../models/FastTrack';
import Task from '../../models/Task';
import Holiday from '../../models/Holiday';
import User from '../../models/User';
import Announcement from '../../models/Announcement';
import Leave from '../../models/Leave';
import Attendance from '../../models/Attendance';
import mongoose from 'mongoose';

/**
 * Synchronizes a user's tasks into the FastTrack database cache.
 */
export async function syncUserTasks(userId: string | mongoose.Types.ObjectId) {
  try {
    const tasks = await Task.find({ assignedTo: userId }).limit(20).lean();
    
    let answer = `**Your Pending Tasks:**\n\n`;
    if (tasks.length === 0) {
      answer = `You currently have no tasks assigned to you.`;
    } else {
      tasks.forEach((t: any, index: number) => {
        answer += `${index + 1}. **${t.title}** - Status: *${t.status}* (Priority: ${t.priority})\n`;
      });
    }

    await FastTrack.findOneAndUpdate(
      { intentId: 'dynamic_user_tasks', userId },
      {
        intentId: 'dynamic_user_tasks',
        userId,
        intentKeywords: ['task', 'tasks', 'my', 'pending', 'status', 'work', 'assigned', 'job', 'todo', 'to-do', 'doing'],
        canonicalQuestion: 'What are my tasks?',
        answer,
        requiresRole: 'any'
      },
      { upsert: true, new: true }
    );
    console.log(`[FASTTRACK SYNC] Synced tasks for user: ${userId}`);
  } catch (error) {
    console.error(`[FASTTRACK ERROR] Failed to sync tasks for user ${userId}:`, error);
  }
}

/**
 * Synchronizes company holidays into the FastTrack database cache.
 */
export async function syncHolidays() {
  try {
    const holidays = await Holiday.find({ status: { $ne: 'Cancelled' } }).sort({ holidayDate: 1 }).limit(10).lean();
    
    let answer = `**Upcoming Company Holidays:**\n\n`;
    if (holidays.length === 0) {
      answer = `There are no upcoming holidays scheduled at the moment.`;
    } else {
      holidays.forEach((h: any, index: number) => {
        const date = new Date(h.holidayDate).toLocaleDateString();
        answer += `${index + 1}. **${h.holidayName}** - ${date} (${h.holidayType})\n`;
      });
    }

    await FastTrack.findOneAndUpdate(
      { intentId: 'dynamic_holidays', userId: { $exists: false } },
      {
        intentId: 'dynamic_holidays',
        intentKeywords: ['holiday', 'holidays', 'calendar', 'off', 'festival', 'vacation', 'company holiday', 'public holiday'],
        canonicalQuestion: 'What are the upcoming holidays?',
        answer,
        requiresRole: 'any'
      },
      { upsert: true, new: true }
    );
    console.log(`[FASTTRACK SYNC] Synced holidays.`);
  } catch (error) {
    console.error(`[FASTTRACK ERROR] Failed to sync holidays:`, error);
  }
}

/**
 * Synchronizes the list of employees into the FastTrack database cache.
 */
export async function syncUsers() {
  try {
    const users = await User.find({ role: { $ne: 'superadmin' } }).select('name email designation department').lean();
    
    let answer = `**Company Employee Directory:**\n\n`;
    users.forEach((u: any, index: number) => {
      answer += `- **${u.name}** (${u.designation || 'Employee'}) - ${u.department || 'General'}\n`;
    });

    await FastTrack.findOneAndUpdate(
      { intentId: 'dynamic_employees', userId: { $exists: false } },
      {
        intentId: 'dynamic_employees',
        intentKeywords: ['employees', 'users', 'user', 'team', 'who', 'directory', 'staff', 'member', 'members', 'colleague', 'colleagues', 'people'],
        canonicalQuestion: 'Who are the employees?',
        answer,
        requiresRole: 'any'
      },
      { upsert: true, new: true }
    );
    console.log(`[FASTTRACK SYNC] Synced employee directory.`);
  } catch (error) {
    console.error(`[FASTTRACK ERROR] Failed to sync users:`, error);
  }
}

/**
 * Synchronizes the latest company announcements into the FastTrack database cache.
 */
export async function syncAnnouncements() {
  try {
    const announcements = await Announcement.find({ 
      $or: [{ expiryDate: { $gte: new Date() } }, { expiryDate: null }]
    }).sort({ isPinned: -1, publishDate: -1 }).limit(5).lean();
    
    let answer = `**Latest Company Announcements:** 📢\n\n`;
    if (announcements.length === 0) {
      answer += `There are no active announcements right now.`;
    } else {
      announcements.forEach((a: any) => {
        const priorityIcon = a.priority === 'urgent' ? '🚨' : (a.priority === 'high' ? '🔴' : '🔵');
        const pinned = a.isPinned ? '📌 ' : '';
        answer += `- ${pinned}**${a.title}** ${priorityIcon} (by ${a.authorName})\n  *${a.description}*\n\n`;
      });
    }

    await FastTrack.findOneAndUpdate(
      { intentId: 'dynamic_announcements', userId: { $exists: false } },
      {
        intentId: 'dynamic_announcements',
        intentKeywords: ['announcement', 'announcements', 'news', 'update', 'updates', 'notice', 'broadcast', 'important', 'message', 'messages'],
        canonicalQuestion: 'What are the latest announcements?',
        answer,
        requiresRole: 'any'
      },
      { upsert: true, new: true }
    );
    console.log(`[FASTTRACK SYNC] Synced announcements.`);
  } catch (error) {
    console.error(`[FASTTRACK ERROR] Failed to sync announcements:`, error);
  }
}

/**
 * Synchronizes a user's recent leaves into the FastTrack database cache.
 */
export async function syncUserLeaves(userId: string | mongoose.Types.ObjectId) {
  try {
    const leaves = await Leave.find({ employeeId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    let answer = `**Your Recent Leave Requests:** 🌴\n\n`;
    if (leaves.length === 0) {
      answer += `You haven't applied for any leaves recently.`;
    } else {
      leaves.forEach((l: any) => {
        const statusIcon = l.status === 'Approved' ? '✅' : (l.status === 'Rejected' ? '❌' : '⏳');
        const sDate = new Date(l.startDate).toLocaleDateString();
        const eDate = new Date(l.endDate).toLocaleDateString();
        answer += `- **${l.leaveType}** (${sDate} to ${eDate})\n  Status: ${statusIcon} **${l.status}** (${l.totalDays} days)\n`;
      });
    }

    await FastTrack.findOneAndUpdate(
      { intentId: 'dynamic_user_leaves', userId },
      {
        intentId: 'dynamic_user_leaves',
        userId,
        intentKeywords: ['leave', 'leaves', 'my leave', 'status', 'vacation', 'sick leave', 'casual leave', 'time off', 'pto', 'holiday'],
        canonicalQuestion: 'What is my leave status?',
        answer,
        requiresRole: 'any'
      },
      { upsert: true, new: true }
    );
    console.log(`[FASTTRACK SYNC] Synced leaves for user: ${userId}`);
  } catch (error) {
    console.error(`[FASTTRACK ERROR] Failed to sync leaves for user ${userId}:`, error);
  }
}

/**
 * Synchronizes a user's latest attendance into the FastTrack database cache.
 */
export async function syncUserAttendance(userId: string | mongoose.Types.ObjectId) {
  try {
    const attendances = await Attendance.find({ employeeId: userId })
      .sort({ attendanceDate: -1 })
      .limit(5)
      .lean();
    
    let answer = `**Your Recent Attendance Log:** 🕒\n\n`;
    if (attendances.length === 0) {
      answer += `No recent attendance records found.`;
    } else {
      attendances.forEach((a: any) => {
        const inTime = a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
        const outTime = a.checkOutTime ? new Date(a.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
        answer += `- **${a.attendanceDate}**: ${a.attendanceStatus} (In: ${inTime} | Out: ${outTime})\n`;
      });
    }

    await FastTrack.findOneAndUpdate(
      { intentId: 'dynamic_user_attendance', userId },
      {
        intentId: 'dynamic_user_attendance',
        userId,
        intentKeywords: ['attendance', 'present', 'absent', 'check in', 'check out', 'log', 'today attendance', 'time', 'checked in', 'checked out'],
        canonicalQuestion: 'What is my attendance log?',
        answer,
        requiresRole: 'any'
      },
      { upsert: true, new: true }
    );
    console.log(`[FASTTRACK SYNC] Synced attendance for user: ${userId}`);
  } catch (error) {
    console.error(`[FASTTRACK ERROR] Failed to sync attendance for user ${userId}:`, error);
  }
}
