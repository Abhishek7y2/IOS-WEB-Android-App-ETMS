import { Request, Response } from 'express';
import Holiday from '../models/Holiday';
import { AuthRequest } from '../middleware/authMiddleware';

export async function createHoliday(req: AuthRequest, res: Response) {
  try {
    const { holidayName, holidayDate, location } = req.body;
    
    // Check for duplicates
    const existing = await Holiday.findOne({ holidayName, holidayDate, location });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Holiday with same name, date, and location already exists.' });
    }

    const holiday = new Holiday({
      ...req.body,
      createdBy: req.user?._id
    });
    
    await holiday.save();
    return res.status(201).json({ success: true, data: holiday });
  } catch (error: any) {
    console.error('Error creating holiday:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
}

export async function getHolidays(req: Request, res: Response) {
  try {
    const { year, month, holidayType, department, location, status, search, sort } = req.query;
    
    const query: any = {};
    
    // Filtering
    if (year) {
      const start = new Date(`${year}-01-01`);
      const end = new Date(`${year}-12-31`);
      query.holidayDate = { $gte: start, $lte: end };
    }
    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 0);
      query.holidayDate = { ...query.holidayDate, $gte: start, $lte: end };
    }
    if (holidayType) query.holidayType = holidayType;
    if (department) query.department = department;
    if (location) query.location = location;
    if (status) query.status = status;
    
    // Searching
    if (search) {
      query.$or = [
        { holidayName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Sorting
    let sortOption: any = { holidayDate: 1 };
    if (sort) {
      const [field, order] = (sort as string).split(':');
      sortOption = { [field]: order === 'desc' ? -1 : 1 };
    }

    const holidays = await Holiday.find(query).sort(sortOption);
    return res.status(200).json({ success: true, data: holidays });
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getHolidayById(req: Request, res: Response) {
  try {
    const holiday = await Holiday.findById(req.params.id);
    if (!holiday) return res.status(404).json({ success: false, message: 'Holiday not found' });
    return res.status(200).json({ success: true, data: holiday });
  } catch (error) {
    console.error('Error fetching holiday:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function updateHoliday(req: Request, res: Response) {
  try {
    const holiday = await Holiday.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!holiday) return res.status(404).json({ success: false, message: 'Holiday not found' });
    return res.status(200).json({ success: true, data: holiday });
  } catch (error: any) {
    console.error('Error updating holiday:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
}

export async function deleteHoliday(req: Request, res: Response) {
  try {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    if (!holiday) return res.status(404).json({ success: false, message: 'Holiday not found' });
    return res.status(200).json({ success: true, message: 'Holiday deleted successfully' });
  } catch (error) {
    console.error('Error deleting holiday:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getHolidayStats(req: Request, res: Response) {
  try {
    const totalHolidays = await Holiday.countDocuments();
    const optionalHolidays = await Holiday.countDocuments({ isOptional: true });
    
    const now = new Date();
    const upcomingHolidays = await Holiday.countDocuments({ holidayDate: { $gte: now } });
    const passedHolidays = await Holiday.countDocuments({ holidayDate: { $lt: now } });
    
    return res.status(200).json({
      success: true,
      data: {
        totalHolidays,
        optionalHolidays,
        upcomingHolidays,
        passedHolidays
      }
    });
  } catch (error) {
    console.error('Error fetching holiday stats:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
