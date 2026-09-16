import { FAST_TRACK_DATA, FastTrackEntry } from '../constants/fastTrackData';
import Task from '../models/Task';
import User from '../models/User';
import Holiday from '../models/Holiday';
import Attendance from '../models/Attendance';
import Leave from '../models/Leave';
import mongoose from 'mongoose';

export interface FastTrackResult {
  hit: true;
  answer: string;
  matchedIntentId: string;
  source: 'FAST_TRACK_CACHE_HIT';
}

/**
 * Matches user query against the Fast Track semantic cache using token overlap scoring.
 * It first checks for highly-dynamic live database intents (Tasks, Members, Holidays, Attendance, Leaves).
 * If no live intent matches, it falls back to checking the static FAST_TRACK_DATA.
 * 
 * @param userQuery The raw user message
 * @param userRole The verified role from JWT (e.g., 'admin', 'employee')
 * @param userId The user's ID to fetch personalized dynamic cache entries (e.g., tasks)
 * @returns FastTrackResult if matched and authorized, otherwise null.
 */
export async function matchFastTrack(userQuery: string, userRole: string, userId: string | mongoose.Types.ObjectId): Promise<FastTrackResult | null> {
  if (!userQuery || !userRole) return null;

  // 1. Normalize input
  const normalizedQuery = userQuery.toLowerCase().trim().replace(/[^\w\s]/g, '');
  if (!normalizedQuery) return null;

  const queryTokens = new Set(normalizedQuery.split(/\s+/).filter(Boolean));
  
  const hasAny = (keywords: string[]) => keywords.some(k => queryTokens.has(k));
  const hasAll = (keywords: string[]) => keywords.every(k => queryTokens.has(k));

  const formatPhone = (mobile?: string, countryCode?: string): string => {
    if (!mobile) return 'N/A';
    let cleaned = String(mobile).trim();
    if (cleaned.startsWith('+')) return cleaned;
    const cc = (countryCode || '91').replace(/\D/g, '');
    return `+${cc} ${cleaned}`;
  };

  // =========================================================================
  // LIVE DATABASE INTENTS (Fast Path bypassing LLM)
  // =========================================================================

  // Helper date formatter
  const todayObj = new Date();
  const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

  // A. SINGLE EMPLOYEE 360-DEGREE PROFILE LOOKUP
  try {
    const allUsers = await User.find().lean();
    let matchedUser: any = null;

    // Check for exact full name or first name match in query
    for (const u of allUsers) {
      const fullName = (u.name || '').toLowerCase().trim();
      const fName = (u.firstName || fullName.split(' ')[0] || '').toLowerCase().trim();
      const lName = (u.lastName || '').toLowerCase().trim();

      if (fullName && fullName.length > 2 && normalizedQuery.includes(fullName)) {
        matchedUser = u;
        break;
      }
      if (fName && fName.length > 2 && normalizedQuery.split(/\s+/).includes(fName)) {
        matchedUser = u;
        break;
      }
      if (lName && lName.length > 2 && normalizedQuery.split(/\s+/).includes(lName)) {
        matchedUser = u;
        break;
      }
    }

    if (matchedUser && (hasAny(['detail', 'details', 'about', 'info', 'profile', 'who', 'contact', 'phone', 'number', 'task', 'tasks', 'present', 'status']) || normalizedQuery.split(' ').length <= 4)) {
      const uId = matchedUser._id;
      const tasks = await Task.find({ assignedTo: uId }).lean();
      const todayAtt = await Attendance.findOne({ employeeId: uId, attendanceDate: todayStr }).lean();
      const activeLeave = await Leave.findOne({
        employeeId: uId,
        status: 'Approved',
        startDate: { $lte: todayObj },
        endDate: { $gte: todayObj }
      }).lean();

      let answer = `👤 **Employee Profile: ${matchedUser.name}**\n\n`;
      answer += `📌 **Professional Information:**\n`;
      answer += `- **Designation:** ${matchedUser.designation || 'Employee'}\n`;
      answer += `- **Department:** ${matchedUser.department || 'General'}\n`;
      answer += `- **Role:** ${matchedUser.role || 'member'}\n\n`;

      answer += `📞 **Contact Details:**\n`;
      answer += `- 📱 **Mobile Number:** ${formatPhone(matchedUser.mobileNumber, matchedUser.countryCode)}\n`;
      if (matchedUser.alternateNumber) {
        answer += `- 📞 **Alternate Number:** ${formatPhone(matchedUser.alternateNumber, matchedUser.countryCode)}\n`;
      }
      answer += `- 📧 **Email Address:** ${matchedUser.email}\n`;
      if (matchedUser.permanentAddress || matchedUser.currentAddress) {
        answer += `- 🏠 **Address:** ${matchedUser.permanentAddress || matchedUser.currentAddress}, ${matchedUser.country || 'India'}\n`;
      }
      answer += `\n`;

      answer += `🕒 **Today's Status (${todayStr}):**\n`;
      if (activeLeave) {
        answer += `- 🌴 **Status:** On Leave (${(activeLeave as any).leaveType})\n\n`;
      } else if (todayAtt) {
        const checkIn = (todayAtt as any).checkInTime ? new Date((todayAtt as any).checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
        answer += `- ✅ **Status:** ${(todayAtt as any).attendanceStatus} (Checked in at ${checkIn})\n\n`;
      } else {
        answer += `- ⏳ **Status:** Not checked in yet today\n\n`;
      }

      answer += `📋 **Assigned Tasks (${tasks.length}):**\n`;
      if (tasks.length === 0) {
        answer += `- *No active tasks assigned to ${matchedUser.name}.*\n`;
      } else {
        tasks.forEach((t: any, idx: number) => {
          const statusBadge = t.status === 'completed' ? '✅ Completed' : (t.status === 'in_progress' ? '🔄 In Progress' : '⏳ To Do');
          answer += `${idx + 1}. **${t.title}** - ${statusBadge} (Priority: ${t.priority})\n`;
        });
      }

      return { hit: true, answer, matchedIntentId: 'live_single_employee_detail', source: 'FAST_TRACK_CACHE_HIT' };
    }
  } catch (e) {
    console.error('Error fetching single employee details:', e);
  }

  // B. EMPLOYEE CONTACT & PHONE DIRECTORY INTENT
  if ((hasAny(['phone', 'contact', 'mobile', 'number', 'contacts', 'numbers', 'call']) && hasAny(['employee', 'employees', 'member', 'members', 'staff', 'team', 'all', 'everyone', 'who', 'list'])) || hasAll(['phone', 'numbers']) || hasAll(['contact', 'numbers']) || hasAll(['employee', 'numbers'])) {
    try {
      const users = await User.find({ isVerified: true }).select('name email mobileNumber countryCode alternateNumber designation department').lean();
      let answer = `📞 **Employee Contact Directory (${users.length}):**\n\n`;
      users.forEach((u: any, idx: number) => {
        answer += `${idx + 1}. **${u.name}** (${u.designation || 'Employee'} - ${u.department || 'General'})\n`;
        answer += `   📱 **Mobile:** ${formatPhone(u.mobileNumber, u.countryCode)}\n`;
        if (u.alternateNumber) {
          answer += `   📞 **Alt:** ${formatPhone(u.alternateNumber, u.countryCode)}\n`;
        }
        answer += `   📧 **Email:** ${u.email}\n\n`;
      });
      return { hit: true, answer, matchedIntentId: 'live_employee_contacts', source: 'FAST_TRACK_CACHE_HIT' };
    } catch (e) {
      console.error('Error fetching live contact directory:', e);
    }
  }

  // C. EMPLOYEE TASK ASSIGNMENTS INTENT
  if ((hasAny(['assigned', 'assignment', 'assignments', 'working']) && hasAny(['task', 'tasks', 'who', 'employee', 'employees', 'all'])) || (hasAny(['who']) && hasAny(['assigned', 'working']) && hasAny(['task', 'tasks'])) || hasAll(['task', 'assignments'])) {
    try {
      const tasks = await Task.find().populate('assignedTo', 'name designation department').lean();
      const users = await User.find({ isVerified: true }).select('name designation department').lean();

      let answer = `📋 **Employee Task Assignments Overview:**\n\n`;
      
      users.forEach((u: any) => {
        const uTasks = tasks.filter((t: any) => t.assignedTo && (t.assignedTo._id?.toString() === u._id.toString() || t.assignedTo.toString() === u._id.toString()));
        answer += `👤 **${u.name}** (${u.designation || 'Employee'}): ${uTasks.length} Task(s)\n`;
        if (uTasks.length === 0) {
          answer += `   - *No assigned tasks*\n`;
        } else {
          uTasks.forEach((t: any, idx: number) => {
            const statusBadge = t.status === 'completed' ? '✅ Completed' : (t.status === 'in_progress' ? '🔄 In Progress' : '⏳ To Do');
            answer += `   ${idx + 1}. **${t.title}** - ${statusBadge} (Priority: ${t.priority})\n`;
          });
        }
        answer += `\n`;
      });

      return { hit: true, answer, matchedIntentId: 'live_all_assigned_tasks', source: 'FAST_TRACK_CACHE_HIT' };
    } catch (e) {
      console.error('Error fetching employee task assignments:', e);
    }
  }

  // D. TODAY'S PRESENT EMPLOYEES & ATTENDANCE INTENT
  if ((hasAny(['who']) && hasAny(['present', 'here', 'office', 'in'])) || (hasAny(['today']) && hasAny(['attendance', 'present', 'who', 'list'])) || hasAll(['present', 'employees']) || hasAll(['today', 'present'])) {
    try {
      const users = await User.find({ isVerified: true }).select('name designation department').lean();
      const todayAtt = await Attendance.find({ attendanceDate: todayStr }).lean();
      const activeLeaves = await Leave.find({
        status: 'Approved',
        startDate: { $lte: todayObj },
        endDate: { $gte: todayObj }
      }).lean();

      const presentUserIds = new Set(todayAtt.map((a: any) => a.employeeId?.toString()));
      const leaveUserIds = new Set(activeLeaves.map((l: any) => l.employeeId?.toString()));

      let answer = `🕒 **Today's Employee Attendance Status (${todayStr}):**\n\n`;

      let presentCount = 0;
      let presentText = `🟢 **Present Today:**\n`;
      todayAtt.forEach((a: any) => {
        const u = users.find((usr: any) => usr._id.toString() === a.employeeId?.toString());
        const name = u ? u.name : (a.employeeName || 'Employee');
        const inTime = a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
        presentText += `- **${name}** - Checked in at ${inTime} (${a.attendanceStatus})\n`;
        presentCount++;
      });
      if (presentCount === 0) presentText += `- *No employees checked in yet today.*\n`;

      let leaveCount = 0;
      let leaveText = `\n🌴 **On Leave / WFH Today:**\n`;
      activeLeaves.forEach((l: any) => {
        const u = users.find((usr: any) => usr._id.toString() === l.employeeId?.toString());
        const name = u ? u.name : (l.employeeName || 'Employee');
        leaveText += `- **${name}** - ${l.leaveType} (${l.totalDays} days)\n`;
        leaveCount++;
      });
      if (leaveCount === 0) leaveText += `- *No employees on approved leave today.*\n`;

      let absentText = `\n⏳ **Not Checked In Yet:**\n`;
      let absentCount = 0;
      users.forEach((u: any) => {
        const uId = u._id.toString();
        if (!presentUserIds.has(uId) && !leaveUserIds.has(uId)) {
          absentText += `- **${u.name}** (${u.designation || 'Employee'})\n`;
          absentCount++;
        }
      });
      if (absentCount === 0) absentText += `- *All employees are present or on leave.*\n`;

      answer += presentText + leaveText + absentText;
      return { hit: true, answer, matchedIntentId: 'live_present_today', source: 'FAST_TRACK_CACHE_HIT' };
    } catch (e) {
      console.error('Error fetching today present employees:', e);
    }
  }

  // 1. My Tasks
  if ((hasAny(['my', 'pending']) && hasAny(['task', 'tasks', 'todo'])) || (hasAny(['what']) && hasAny(['tasks']))) {
    try {
      const tasks = await Task.find({ assignedTo: userId }).limit(20).lean();
      let answer = `**Your Pending Tasks:**\n\n`;
      if (tasks.length === 0) answer = `You currently have no tasks assigned to you.`;
      else {
        tasks.forEach((t: any, idx: number) => {
          answer += `${idx + 1}. **${t.title}** - Status: *${t.status}* (Priority: ${t.priority})\n`;
        });
      }
      return { hit: true, answer, matchedIntentId: 'live_user_tasks', source: 'FAST_TRACK_CACHE_HIT' };
    } catch(e) { console.error('Error fetching live tasks:', e); }
  }

  // 2. Members/Employees
  if ((hasAny(['who', 'show', 'list']) && hasAny(['members', 'employees', 'team', 'staff'])) || hasAll(['all', 'employees'])) {
    try {
      const users = await User.find({ role: { $ne: 'superadmin' } }).select('name email mobileNumber countryCode designation department').lean();
      let answer = `**Company Employee Directory:**\n\n`;
      users.forEach((u: any) => {
        answer += `- **${u.name}** (${u.designation || 'Employee'}) - ${u.department || 'General'} | 📱 +${u.countryCode || '91'} ${u.mobileNumber || 'N/A'}\n`;
      });
      return { hit: true, answer, matchedIntentId: 'live_employees', source: 'FAST_TRACK_CACHE_HIT' };
    } catch(e) { console.error('Error fetching live users:', e); }
  }

  // 3. Holidays
  if (hasAny(['holiday', 'holidays']) || (hasAny(['public', 'company']) && hasAny(['holiday', 'calendar']))) {
    try {
      const holidays = await Holiday.find({ status: { $ne: 'Cancelled' } }).sort({ holidayDate: 1 }).limit(10).lean();
      let answer = `**Upcoming Company Holidays:**\n\n`;
      if (holidays.length === 0) answer = `There are no upcoming holidays scheduled at the moment.`;
      else {
        holidays.forEach((h: any, idx: number) => {
          const date = new Date(h.holidayDate).toLocaleDateString();
          answer += `${idx + 1}. **${h.holidayName}** - ${date} (${h.holidayType})\n`;
        });
      }
      return { hit: true, answer, matchedIntentId: 'live_holidays', source: 'FAST_TRACK_CACHE_HIT' };
    } catch(e) { console.error('Error fetching live holidays:', e); }
  }

  // 4. Attendance
  if (hasAny(['attendance', 'present', 'log']) || (hasAny(['my']) && hasAny(['check', 'in', 'out', 'attendance']))) {
    try {
      const attendances = await Attendance.find({ employeeId: userId }).sort({ attendanceDate: -1 }).limit(5).lean();
      let answer = `**Your Recent Attendance Log:** 🕒\n\n`;
      if (attendances.length === 0) answer += `No recent attendance records found.`;
      else {
        attendances.forEach((a: any) => {
          const inTime = a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
          const outTime = a.checkOutTime ? new Date(a.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
          answer += `- **${a.attendanceDate}**: ${a.attendanceStatus} (In: ${inTime} | Out: ${outTime})\n`;
        });
      }
      return { hit: true, answer, matchedIntentId: 'live_attendance', source: 'FAST_TRACK_CACHE_HIT' };
    } catch(e) { console.error('Error fetching live attendance:', e); }
  }

  // 5. Leaves
  if ((hasAny(['my', 'recent', 'status']) && hasAny(['leave', 'leaves', 'pto'])) || hasAll(['my', 'leaves'])) {
    try {
      const leaves = await Leave.find({ employeeId: userId }).sort({ createdAt: -1 }).limit(5).lean();
      let answer = `**Your Recent Leave Requests:** 🌴\n\n`;
      if (leaves.length === 0) answer += `You haven't applied for any leaves recently.`;
      else {
        leaves.forEach((l: any) => {
          const statusIcon = l.status === 'Approved' ? '✅' : (l.status === 'Rejected' ? '❌' : '⏳');
          const sDate = new Date(l.startDate).toLocaleDateString();
          const eDate = new Date(l.endDate).toLocaleDateString();
          answer += `- **${l.leaveType}** (${sDate} to ${eDate})\n  Status: ${statusIcon} **${l.status}** (${l.totalDays} days)\n`;
        });
      }
      return { hit: true, answer, matchedIntentId: 'live_leaves', source: 'FAST_TRACK_CACHE_HIT' };
    } catch(e) { console.error('Error fetching live leaves:', e); }
  }

  // =========================================================================
  // STATIC FALLBACK MATCHING (for FAQs like WFH policy, IT support)
  // =========================================================================

  const MATCH_THRESHOLD = 0.70; // Slightly lowered to be more forgiving
  let bestMatch: any = null;
  let highestScore = 0;

  for (const entry of FAST_TRACK_DATA) {
    if (!entry.intentKeywords || entry.intentKeywords.length === 0) continue;

    let overlapCount = 0;
    for (const keyword of entry.intentKeywords) {
      if (queryTokens.has(keyword.toLowerCase())) {
        overlapCount++;
      }
    }

    const score = overlapCount > 0 ? (overlapCount / Math.min(queryTokens.size, entry.intentKeywords.length)) : 0;
    const finalScore = score + (overlapCount * 0.1);

    if (finalScore > highestScore) {
      highestScore = finalScore;
      bestMatch = entry;
    }
  }

  if (highestScore >= MATCH_THRESHOLD && bestMatch) {
    if (bestMatch.requiresRole && bestMatch.requiresRole !== 'any') {
      if (bestMatch.requiresRole !== userRole) {
        return null; 
      }
    }
    return {
      hit: true,
      answer: bestMatch.answer,
      matchedIntentId: bestMatch.id || bestMatch.intentId,
      source: 'FAST_TRACK_CACHE_HIT'
    };
  }

  return null; // Fall through to LLM
}
