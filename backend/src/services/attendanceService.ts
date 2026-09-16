import Attendance from '../models/Attendance';
import { publishEvent } from '../realtime/event.publisher';

const OFFICE_START_HOUR = 9;
const OFFICE_END_HOUR = 18;
const HALF_DAY_THRESHOLD = 4;
const STANDARD_HOURS = 8;

const getTodayDateStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export class AttendanceService {
  async checkIn(dto: { workMode?: string; location?: string }, user: any) {
    const employeeId = user?._id;
    const dateStr = getTodayDateStr();
    const { workMode, location } = dto;

    let record = await Attendance.findOne({ employeeId, attendanceDate: dateStr });
    if (record) {
      if (record.checkInTime) {
        throw { status: 400, message: 'Already checked in today.' };
      }
      record.checkInTime = new Date();
      record.workMode = workMode || 'Office';
      record.location = location;
      record.attendanceStatus = 'Present';
    } else {
      record = new Attendance({
        employeeId,
        employeeName: user?.name || `${user?.firstName} ${user?.lastName}`,
        department: (user as any)?.department || 'Unassigned',
        designation: (user as any)?.designation || 'Employee',
        attendanceDate: dateStr,
        checkInTime: new Date(),
        workMode: workMode || 'Office',
        location,
        attendanceStatus: 'Present',
      });
    }

    const checkIn = new Date(record.checkInTime!);
    const expectedStart = new Date(checkIn);
    expectedStart.setHours(OFFICE_START_HOUR, 0, 0, 0);

    if (checkIn > expectedStart) {
      record.isLate = true;
      record.attendanceStatus = 'Late';
      record.lateByMinutes = Math.floor((checkIn.getTime() - expectedStart.getTime()) / 60000);
    }

    await record.save();

    const targetRooms = [`user:${employeeId}`, 'role:admin', 'role:superadmin', 'role:HR'];

    // Database First, Event Second: Publish real-time Socket event to authorized audience only
    publishEvent('attendance.checked_in', { recordId: record._id, record }, targetRooms, {
      actorId: user?._id?.toString(),
      organizationId: user?.organizationId || 'main',
    });

    return record;
  }

  async checkOut(user: any) {
    const employeeId = user?._id;
    const dateStr = getTodayDateStr();

    const record = await Attendance.findOne({ employeeId, attendanceDate: dateStr });
    if (!record || !record.checkInTime) {
      throw { status: 400, message: 'Not checked in today.' };
    }
    if (record.checkOutTime) {
      throw { status: 400, message: 'Already checked out.' };
    }

    record.checkOutTime = new Date();

    const expectedEnd = new Date(record.checkOutTime);
    expectedEnd.setHours(OFFICE_END_HOUR, 0, 0, 0);
    if (record.checkOutTime < expectedEnd) {
      record.leftEarly = true;
      record.earlyDepartureMinutes = Math.floor((expectedEnd.getTime() - record.checkOutTime.getTime()) / 60000);
    }

    let workMs = record.checkOutTime.getTime() - record.checkInTime.getTime();
    if (record.breakStart && record.breakEnd) {
      const breakMs = record.breakEnd.getTime() - record.breakStart.getTime();
      workMs -= breakMs;
      record.breakDuration = parseFloat((breakMs / 3600000).toFixed(2));
    }

    record.totalWorkingHours = parseFloat((workMs / 3600000).toFixed(2));

    if (record.totalWorkingHours < HALF_DAY_THRESHOLD) {
      record.attendanceStatus = 'Half Day';
    } else if (record.totalWorkingHours > STANDARD_HOURS) {
      record.overtimeHours = parseFloat((record.totalWorkingHours - STANDARD_HOURS).toFixed(2));
    }

    await record.save();

    const targetRooms = [`user:${employeeId}`, 'role:admin', 'role:superadmin', 'role:HR'];

    // Database First, Event Second: Publish real-time Socket event to authorized audience only
    publishEvent('attendance.checked_out', { recordId: record._id, record }, targetRooms, {
      actorId: user?._id?.toString(),
      organizationId: user?.organizationId || 'main',
    });

    return record;
  }

  async markBreakStart(user: any) {
    const record = await Attendance.findOne({ employeeId: user?._id, attendanceDate: getTodayDateStr() });
    if (!record || !record.checkInTime || record.checkOutTime) {
      throw { status: 400, message: 'Invalid attendance state.' };
    }
    if (record.breakStart) throw { status: 400, message: 'Break already started.' };

    record.breakStart = new Date();
    await record.save();
    return record;
  }

  async markBreakEnd(user: any) {
    const record = await Attendance.findOne({ employeeId: user?._id, attendanceDate: getTodayDateStr() });
    if (!record || !record.breakStart || record.breakEnd) {
      throw { status: 400, message: 'Invalid break state.' };
    }

    record.breakEnd = new Date();
    record.breakDuration = parseFloat(((record.breakEnd.getTime() - record.breakStart.getTime()) / 3600000).toFixed(2));

    await record.save();
    return record;
  }

  async getAttendance(queryParams: any, user: any) {
    const { year, month, date, department, status, search, workMode } = queryParams;
    const userRole = user?.role as string;
    const isAdmin = userRole === 'admin' || userRole === 'Admin' || userRole === 'HR';

    const query: any = {};
    if (!isAdmin) {
      query.employeeId = user?._id;
    }

    if (date) query.attendanceDate = date;
    else if (year && month) {
      query.attendanceDate = { $regex: `^${year}-${String(month).padStart(2, '0')}` };
    }

    if (department && isAdmin) query.department = department;
    if (status) query.attendanceStatus = status;
    if (workMode) query.workMode = workMode;
    if (search && isAdmin) {
      query.$or = [{ employeeName: { $regex: search, $options: 'i' } }];
    }

    return Attendance.find(query).sort({ attendanceDate: -1, checkInTime: -1 });
  }

  async updateAttendance(id: string, body: any, user: any) {
    const userRole = user?.role as string;
    const isAdmin = userRole === 'admin' || userRole === 'Admin' || userRole === 'HR';
    if (!isAdmin) throw { status: 403, message: 'Forbidden' };

    const record = await Attendance.findByIdAndUpdate(id, body, { new: true });
    if (!record) throw { status: 404, message: 'Not found' };

    return record;
  }

  async getAnalytics() {
    const dateStr = getTodayDateStr();

    const presentCount = await Attendance.countDocuments({ attendanceDate: dateStr, attendanceStatus: { $in: ['Present', 'Late'] } });
    const wfhCount = await Attendance.countDocuments({ attendanceDate: dateStr, workMode: 'Work From Home' });
    const lateCount = await Attendance.countDocuments({ attendanceDate: dateStr, isLate: true });

    const allToday = await Attendance.find({ attendanceDate: dateStr });
    let totalHrs = 0;
    let counted = 0;
    allToday.forEach((r) => {
      if (r.totalWorkingHours) {
        totalHrs += r.totalWorkingHours;
        counted++;
      }
    });

    return {
      presentToday: presentCount,
      wfhToday: wfhCount,
      lateToday: lateCount,
      avgHours: counted ? parseFloat((totalHrs / counted).toFixed(2)) : 0,
    };
  }
}

export const attendanceService = new AttendanceService();
