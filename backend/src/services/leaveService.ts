import Leave from '../models/Leave';
import LeaveBalance from '../models/LeaveBalance';
import User from '../models/User';
import Notification from '../models/Notification';
import { sendLeaveApprovalEmail, sendLeaveRejectionEmail } from '../utils/mailer';
import { publishEvent } from '../realtime/event.publisher';

export interface ApplyLeaveDTO {
  leaveType: string;
  startDate: Date | string;
  endDate: Date | string;
  totalDays: number;
  halfDay?: boolean;
  halfDaySession?: string;
  reason: string;
  attachment?: string;
}

export class LeaveService {
  async applyLeave(dto: ApplyLeaveDTO, user: any) {
    const employeeId = user?._id;
    const userRole = user?.role as string;
    const userDesignation = (user as any)?.designation as string;

    if (userRole === 'superadmin' || userRole === 'SuperAdmin' || userDesignation === 'CEO') {
      throw { status: 403, message: 'Super Admin (CEO) is not allowed to apply for leaves.' };
    }

    const { leaveType, startDate, endDate, totalDays, halfDay, halfDaySession, reason, attachment } = dto;

    const existingLeave = await Leave.findOne({
      employeeId,
      status: { $in: ['Pending', 'Approved'] },
      $or: [{ startDate: { $lte: endDate }, endDate: { $gte: startDate } }],
    });

    if (existingLeave) {
      throw { status: 400, message: 'You already have a leave request during this period.' };
    }

    const leave = new Leave({
      employeeId,
      employeeName: user?.name || user?.firstName + ' ' + user?.lastName,
      department: (user as any)?.department || 'Unassigned',
      designation: (user as any)?.designation || 'Employee',
      leaveType,
      startDate,
      endDate,
      totalDays,
      halfDay,
      halfDaySession,
      reason,
      attachment,
      status: 'Pending',
    });

    await leave.save();

    const targetRooms = [`user:${employeeId}`, 'role:admin', 'role:superadmin', 'role:HR'];

    // Database First, Event Second: Publish real-time Socket event to authorized audience only
    publishEvent('leave.created', { leaveId: leave._id, leave }, targetRooms, {
      actorId: user?._id?.toString(),
      organizationId: user?.organizationId || 'main',
    });

    const admins = await User.find({
      $or: [
        { role: { $in: ['admin', 'Admin', 'HR', 'superadmin', 'SuperAdmin'] } },
        { designation: { $in: ['Admin', 'Project Manager', 'CEO', 'HR Manager'] } },
      ],
    });
    const employeeName =
      user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Employee');
    const notifications = admins.map((admin) => ({
      recipientId: admin._id,
      senderId: employeeId,
      senderName: employeeName,
      type: 'system',
      message: `New leave request from ${employeeName} for ${totalDays} day(s).`,
      isRead: false,
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return leave;
  }

  async getLeaves(queryParams: any, user: any) {
    const { year, month, leaveType, status, search, department } = queryParams;
    const query: any = {};

    const userRole = user?.role as string;
    if (userRole !== 'admin' && userRole !== 'Admin' && userRole !== 'HR' && userRole !== 'superadmin') {
      query.employeeId = user?._id;
    }

    if (department) query.department = department;
    if (leaveType) query.leaveType = leaveType;
    if (status) query.status = status;

    if (year) {
      const start = new Date(`${year}-01-01`);
      const end = new Date(`${year}-12-31`);
      query.startDate = { $gte: start, $lte: end };
    }

    if (search) {
      query.$or = [
        { employeeName: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } },
      ];
    }

    return Leave.find(query).sort({ createdAt: -1 });
  }

  async getLeaveById(id: string, user: any) {
    const leave = await Leave.findById(id);
    if (!leave) throw { status: 404, message: 'Leave not found' };

    const userRole = user?.role as string;
    if (
      leave.employeeId.toString() !== user?._id?.toString() &&
      userRole !== 'admin' &&
      userRole !== 'Admin' &&
      userRole !== 'HR' &&
      userRole !== 'superadmin'
    ) {
      throw { status: 403, message: 'Unauthorized' };
    }

    return leave;
  }

  async updateLeaveStatus(id: string, status: string, rejectionReason: string | undefined, user: any) {
    const leave = await Leave.findById(id);
    if (!leave) throw { status: 404, message: 'Leave not found' };

    const userRole = user?.role as string;
    const userDesignation = (user as any)?.designation as string;
    const isAdmin =
      userRole === 'admin' ||
      userRole === 'Admin' ||
      userRole === 'HR' ||
      userRole === 'superadmin' ||
      userRole === 'SuperAdmin' ||
      userDesignation === 'Admin' ||
      userDesignation === 'Project Manager' ||
      userDesignation === 'CEO';

    if (!isAdmin && status !== 'Withdrawn' && status !== 'Cancelled') {
      throw { status: 403, message: 'Only admins can approve/reject leaves' };
    }

    if (!isAdmin && leave.employeeId.toString() !== user?._id?.toString()) {
      throw { status: 403, message: 'Unauthorized' };
    }

    leave.status = status;
    if (rejectionReason) leave.rejectionReason = rejectionReason;
    if (isAdmin) {
      leave.approverName =
        user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Administrator');
      leave.approvedDate = new Date();
    }

    if (status === 'Approved') {
      let balance = await LeaveBalance.findOne({ employeeId: leave.employeeId, year: new Date().getFullYear() });
      if (!balance) {
        balance = new LeaveBalance({
          employeeId: leave.employeeId,
          year: new Date().getFullYear(),
          balances: [
            { leaveType: 'Sick Leave', total: 10, used: 0, remaining: 10 },
            { leaveType: 'Casual Leave', total: 10, used: 0, remaining: 10 },
            { leaveType: 'Earned Leave', total: 15, used: 0, remaining: 15 },
            { leaveType: leave.leaveType, total: 10, used: 0, remaining: 10 },
          ],
        });
      }

      const typeBalance = balance.balances.find((b: any) => b.leaveType === leave.leaveType);
      if (typeBalance) {
        leave.leaveBalanceBefore = typeBalance.remaining;
        typeBalance.used += leave.totalDays;
        typeBalance.remaining = typeBalance.total - typeBalance.used;
        leave.leaveBalanceAfter = typeBalance.remaining;
      } else {
        balance.balances.push({
          leaveType: leave.leaveType,
          total: 10,
          used: leave.totalDays,
          remaining: 10 - leave.totalDays,
        });
        leave.leaveBalanceBefore = 10;
        leave.leaveBalanceAfter = 10 - leave.totalDays;
      }
      await balance.save();
    }

    await leave.save();

    const targetRooms = [`user:${leave.employeeId}`, 'role:admin', 'role:superadmin', 'role:HR'];

    // Database First, Event Second: Publish real-time Socket event to authorized audience only
    const eventName = status === 'Approved' ? 'leave.approved' : status === 'Rejected' ? 'leave.rejected' : 'leave.created';
    publishEvent(eventName, { leaveId: leave._id, leave, status }, targetRooms, {
      actorId: user?._id?.toString(),
      organizationId: user?.organizationId || 'main',
    });

    if (status === 'Approved') {
      const employee = await User.findById(leave.employeeId);
      if (employee && employee.email) {
        const approverName = leave.approverName || 'an Administrator';
        const formattedStart = new Date(leave.startDate).toLocaleDateString();
        const formattedEnd = new Date(leave.endDate).toLocaleDateString();

        sendLeaveApprovalEmail(
          employee.email,
          leave.employeeName,
          approverName,
          leave.leaveType,
          formattedStart,
          formattedEnd,
          leave.totalDays
        ).catch((err) => {
          console.error('Failed to send leave approval email:', err);
        });
      }
    } else if (status === 'Rejected') {
      const employee = await User.findById(leave.employeeId);
      if (employee && employee.email) {
        const approverName = leave.approverName || 'an Administrator';
        const formattedStart = new Date(leave.startDate).toLocaleDateString();
        const formattedEnd = new Date(leave.endDate).toLocaleDateString();

        sendLeaveRejectionEmail(
          employee.email,
          leave.employeeName,
          approverName,
          leave.leaveType,
          formattedStart,
          formattedEnd,
          leave.totalDays,
          leave.rejectionReason || 'No specific reason provided.'
        ).catch((err) => {
          console.error('Failed to send leave rejection email:', err);
        });
      }
    }

    if (status === 'Approved' || status === 'Rejected') {
      const approverName = user?.name || user?.firstName + ' ' + user?.lastName;
      await Notification.create({
        recipientId: leave.employeeId,
        senderId: user?._id,
        senderName: approverName,
        type: 'system',
        message: `Your leave request for ${leave.totalDays} day(s) has been ${status.toLowerCase()} by ${approverName}.`,
        isRead: false,
      });
    }

    return leave;
  }

  async deleteLeave(id: string, user: any) {
    const userRole = user?.role as string;
    const userDesignation = (user as any)?.designation as string;
    const isAdmin =
      userRole === 'admin' ||
      userRole === 'Admin' ||
      userRole === 'HR' ||
      userRole === 'superadmin' ||
      userRole === 'SuperAdmin' ||
      userDesignation === 'Admin' ||
      userDesignation === 'Project Manager' ||
      userDesignation === 'CEO';

    if (!isAdmin) throw { status: 403, message: 'Forbidden' };

    const leave = await Leave.findByIdAndDelete(id);
    if (!leave) throw { status: 404, message: 'Leave not found' };

    return leave;
  }

  async getLeaveBalance(requestedEmployeeId: any, requestedYear: any, user: any) {
    const employeeId = requestedEmployeeId || user?._id;
    const year = requestedYear || new Date().getFullYear();

    let balance = await LeaveBalance.findOne({ employeeId, year });
    if (!balance) {
      balance = new LeaveBalance({
        employeeId,
        year,
        balances: [
          { leaveType: 'Sick Leave', total: 10, used: 0, remaining: 10 },
          { leaveType: 'Casual Leave', total: 10, used: 0, remaining: 10 },
          { leaveType: 'Earned Leave', total: 15, used: 0, remaining: 15 },
        ],
      });
      await balance.save();
    }

    return balance;
  }

  async getLeaveStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const onLeaveToday = await Leave.countDocuments({
      status: 'Approved',
      startDate: { $lte: today },
      endDate: { $gte: today },
    });

    const pendingRequests = await Leave.countDocuments({ status: 'Pending' });
    const approvedLeaves = await Leave.countDocuments({ status: 'Approved' });
    const rejectedLeaves = await Leave.countDocuments({ status: 'Rejected' });

    return {
      onLeaveToday,
      pendingRequests,
      approvedLeaves,
      rejectedLeaves,
    };
  }
}

export const leaveService = new LeaveService();
