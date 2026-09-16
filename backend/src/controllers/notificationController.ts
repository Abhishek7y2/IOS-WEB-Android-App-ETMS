import { Request, Response } from 'express';
import Notification from '../models/Notification';

/**
 * @description Retrieves all notifications for the currently logged-in user.
 * @logic 
 * - Fetches the last 50 notifications for the user.
 * - Sorts them so unread notifications appear first, followed by newest ones.
 * - Also returns the total count of unread notifications.
 */
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();
    
    // Fetch last 50 notifications, unread first, then sorted by date
    const notifications = await Notification.find({ recipientId: userId })
      .sort({ isRead: 1, createdAt: -1 })
      .limit(50);
      
    const unreadCount = await Notification.countDocuments({ recipientId: userId, isRead: false });

    res.status(200).json({
      notifications,
      unreadCount
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

/**
 * @description Marks a specific notification as read.
 * @logic 
 * - Finds the notification by ID and ensures it belongs to the current user.
 * - Updates `isRead` to true.
 */
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    res.status(200).json(notification);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
};

/**
 * @description Marks all unread notifications of the user as read.
 * @logic 
 * - Uses `updateMany` to efficiently update all matching documents in one query.
 */
export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();

    await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating notifications', error: error.message });
  }
};
