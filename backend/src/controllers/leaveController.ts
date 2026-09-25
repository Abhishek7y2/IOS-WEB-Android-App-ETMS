import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { leaveService } from '../services/leaveService';

export async function applyLeave(req: AuthRequest, res: Response) {
  try {
    const leave = await leaveService.applyLeave(req.body, req.user);
    return res.status(201).json({ success: true, data: leave });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({ success: false, message: error.message || 'Server error' });
  }
}

export async function getLeaves(req: AuthRequest, res: Response) {
  try {
    const leaves = await leaveService.getLeaves(req.query, req.user);
    return res.status(200).json({ success: true, data: leaves });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({ success: false, message: error.message || 'Server error' });
  }
}

export async function getLeaveById(req: AuthRequest, res: Response) {
  try {
    const leave = await leaveService.getLeaveById(req.params.id, req.user);
    return res.status(200).json({ success: true, data: leave });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({ success: false, message: error.message || 'Server error' });
  }
}

export async function updateLeaveStatus(req: AuthRequest, res: Response) {
  try {
    const { status, rejectionReason } = req.body;
    const leave = await leaveService.updateLeaveStatus(req.params.id, status, rejectionReason, req.user);
    return res.status(200).json({ success: true, data: leave });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({ success: false, message: error.message || 'Server error' });
  }
}

export async function deleteLeave(req: AuthRequest, res: Response) {
  try {
    await leaveService.deleteLeave(req.params.id, req.user);
    return res.status(200).json({ success: true, message: 'Leave deleted successfully' });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({ success: false, message: error.message || 'Server error' });
  }
}

export async function getLeaveBalance(req: AuthRequest, res: Response) {
  try {
    const balance = await leaveService.getLeaveBalance(req.query.employeeId, req.query.year, req.user);
    return res.status(200).json({ success: true, data: balance });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({ success: false, message: error.message || 'Server error' });
  }
}

export async function getLeaveStats(req: AuthRequest, res: Response) {
  try {
    const stats = await leaveService.getLeaveStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({ success: false, message: error.message || 'Server error' });
  }
}

export async function updateLeaveBalance(req: AuthRequest, res: Response) {
  try {
    const { employeeId } = req.params;
    const { year, newBalances } = req.body;
    
    // newBalances should be an array of { leaveType, total }
    if (!employeeId || !year || !Array.isArray(newBalances)) {
      return res.status(400).json({ success: false, message: 'employeeId, year, and newBalances array are required' });
    }

    const updatedBalance = await leaveService.updateLeaveBalance(employeeId, year, newBalances, req.user);
    return res.status(200).json({ success: true, data: updatedBalance });
  } catch (error: any) {
    console.error('Update leave balance error:', error);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
}
