import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { attendanceService } from '../services/attendanceService';

export async function checkIn(req: AuthRequest, res: Response) {
  try {
    const record = await attendanceService.checkIn(req.body, req.user);
    return res.status(200).json({ success: true, data: record });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({ success: false, message: error.message || 'Server error' });
  }
}

export async function checkOut(req: AuthRequest, res: Response) {
  try {
    const record = await attendanceService.checkOut(req.user);
    return res.status(200).json({ success: true, data: record });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({ success: false, message: error.message || 'Server error' });
  }
}

export async function markBreakStart(req: AuthRequest, res: Response) {
  try {
    const record = await attendanceService.markBreakStart(req.user);
    return res.status(200).json({ success: true, data: record });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({ success: false, message: error.message || 'Server error' });
  }
}

export async function markBreakEnd(req: AuthRequest, res: Response) {
  try {
    const record = await attendanceService.markBreakEnd(req.user);
    return res.status(200).json({ success: true, data: record });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({ success: false, message: error.message || 'Server error' });
  }
}

export async function getAttendance(req: AuthRequest, res: Response) {
  try {
    const records = await attendanceService.getAttendance(req.query, req.user);
    return res.status(200).json({ success: true, data: records });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({ success: false, message: error.message || 'Server error' });
  }
}

export async function updateAttendance(req: AuthRequest, res: Response) {
  try {
    const record = await attendanceService.updateAttendance(req.params.id, req.body, req.user);
    return res.status(200).json({ success: true, data: record });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({ success: false, message: error.message || 'Server error' });
  }
}

export async function getAnalytics(req: AuthRequest, res: Response) {
  try {
    const data = await attendanceService.getAnalytics();
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({ success: false, message: error.message || 'Server error' });
  }
}
