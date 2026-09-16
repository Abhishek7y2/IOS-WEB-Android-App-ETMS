import { Response } from 'express';
import User from '../models/User';
import Task from '../models/Task';
import Leave from '../models/Leave';
import Attendance from '../models/Attendance';
import { AuthRequest } from '../middleware/authMiddleware';

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?._id;
    const user = await User.findById(userId).select('-password -verificationOtp -resetPasswordOtp -loginOtp');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get some basic stats for the activity tab
    const [taskCount, activeLeaves, attendanceCount] = await Promise.all([
      Task.countDocuments({ assigneeId: userId }),
      Leave.countDocuments({ employeeId: userId, status: 'Approved', startDate: { $gte: new Date() } }),
      Attendance.countDocuments({ employeeId: userId })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        user,
        stats: {
          taskCount,
          activeLeaves,
          attendanceCount
        }
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function updatePreferences(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?._id;
    const { notificationPreferences } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { notificationPreferences } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function updatePassword(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required' });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save(); // pre-save hook handles hashing

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getAdminTeam(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const team = await User.find({ role: 'member' }).select('name email designation department isVerified');
    return res.status(200).json({ success: true, data: team });
  } catch (error) {
    console.error('Error fetching admin team:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * @description DPDP Act 2023 Compliance: Exports all personal data, tasks, leaves, and attendance associated with the user.
 */
export async function exportUserData(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findById(userId).select('-password -verificationOtp -resetPasswordOtp -loginOtp -phoneChangeOtp -emailChangeOtp');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [tasks, leaves, attendance] = await Promise.all([
      Task.find({ $or: [{ assignedTo: userId }, { assignedBy: userId }] }),
      Leave.find({ employeeId: userId }),
      Attendance.find({ employeeId: userId }),
    ]);

    const exportPayload = {
      exportTimestamp: new Date().toISOString(),
      complianceStandard: 'DPDP Act 2023 (India)',
      profile: user,
      activity: {
        tasks,
        leaves,
        attendance,
      },
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=my-personal-data-${userId}.json`);
    return res.status(200).json({ success: true, data: exportPayload });
  } catch (error) {
    console.error('profileController.ts: exportUserData error:', error);
    return res.status(500).json({ success: false, message: 'Failed to export user data' });
  }
}
