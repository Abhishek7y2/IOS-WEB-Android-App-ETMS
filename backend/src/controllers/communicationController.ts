import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { communicationService } from '../services/communicationService';

export async function getEmployees(req: AuthRequest, res: Response) {
  try {
    const currentUserId = req.user?._id.toString() || '';
    const employees = await communicationService.getEmployees(currentUserId);
    return res.status(200).json({
      success: true,
      message: 'Employees retrieved successfully.',
      data: { employees },
    });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'An error occurred while fetching employees.',
      errors: [],
    });
  }
}

export async function getConversations(req: AuthRequest, res: Response) {
  try {
    const conversations = await communicationService.getConversations(req.query, req.user);
    return res.status(200).json({
      success: true,
      message: 'Conversations retrieved successfully.',
      data: { conversations },
    });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'An error occurred while fetching conversations.',
      errors: [],
    });
  }
}

export async function getConversationById(req: AuthRequest, res: Response) {
  try {
    const conversation = await communicationService.getConversationById(req.params.id, req.user);
    return res.status(200).json({
      success: true,
      message: 'Conversation retrieved successfully.',
      data: { conversation },
    });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'An error occurred while fetching the conversation.',
      errors: [],
    });
  }
}

export async function createConversation(req: AuthRequest, res: Response) {
  try {
    const result = await communicationService.createConversation(req.body, req.user);
    return res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
      data: result,
    });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'An error occurred while sending the message.',
      errors: [],
    });
  }
}

export async function updateConversation(req: AuthRequest, res: Response) {
  try {
    const conversation = await communicationService.updateConversation(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Conversation updated successfully.',
      data: { conversation },
    });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'An error occurred while updating the conversation.',
      errors: [],
    });
  }
}

export async function deleteConversation(req: AuthRequest, res: Response) {
  try {
    await communicationService.deleteConversation(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully.',
      data: {},
    });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'An error occurred while deleting the conversation.',
      errors: [],
    });
  }
}

export async function getMessages(req: AuthRequest, res: Response) {
  try {
    const messages = await communicationService.getMessages(req.params.conversationId, req.user);
    return res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully.',
      data: { messages },
    });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'An error occurred while fetching messages.',
      errors: [],
    });
  }
}

export async function sendMessage(req: AuthRequest, res: Response) {
  try {
    const message = await communicationService.sendMessage(req.params.conversationId, req.body, req.user);
    return res.status(201).json({
      success: true,
      message: 'Reply sent successfully.',
      data: { message },
    });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'An error occurred while sending the reply.',
      errors: [],
    });
  }
}

export async function getAnnouncements(req: AuthRequest, res: Response) {
  try {
    const announcements = await communicationService.getAnnouncements();
    return res.status(200).json({
      success: true,
      message: 'Announcements retrieved successfully.',
      data: { announcements },
    });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'An error occurred while fetching announcements.',
      errors: [],
    });
  }
}

export async function createAnnouncement(req: AuthRequest, res: Response) {
  try {
    const announcement = await communicationService.createAnnouncement(req.body, req.user);
    return res.status(201).json({
      success: true,
      message: 'Announcement published successfully.',
      data: { announcement },
    });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'An error occurred while creating the announcement.',
      errors: [],
    });
  }
}

export async function updateAnnouncement(req: AuthRequest, res: Response) {
  try {
    const announcement = await communicationService.updateAnnouncement(req.params.id, req.body, req.user);
    return res.status(200).json({
      success: true,
      message: 'Announcement updated successfully.',
      data: { announcement },
    });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'An error occurred while updating the announcement.',
      errors: [],
    });
  }
}

export async function togglePinAnnouncement(req: AuthRequest, res: Response) {
  try {
    const announcement = await communicationService.togglePinAnnouncement(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Announcement pin toggled successfully.',
      data: { announcement },
    });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'An error occurred while toggling pin.',
      errors: [],
    });
  }
}

export async function deleteAnnouncement(req: AuthRequest, res: Response) {
  try {
    await communicationService.deleteAnnouncement(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully.',
      data: {},
    });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'An error occurred while deleting the announcement.',
      errors: [],
    });
  }
}

export async function sendBroadcast(req: AuthRequest, res: Response) {
  try {
    const result = await communicationService.sendBroadcast(req.body, req.user);
    return res.status(201).json({
      success: true,
      message: 'Broadcast sent successfully.',
      data: result,
    });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'An error occurred while sending the broadcast.',
      errors: [],
    });
  }
}

export async function createGroup(req: AuthRequest, res: Response) {
  try {
    const conversation = await communicationService.createGroup(req.body, req.user);
    return res.status(201).json({
      success: true,
      message: 'Group created successfully.',
      data: { conversation },
    });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to create group.',
    });
  }
}

export async function getAnalytics(req: AuthRequest, res: Response) {
  try {
    const analytics = await communicationService.getAnalytics();
    return res.status(200).json({
      success: true,
      message: 'Analytics retrieved successfully.',
      data: { analytics },
    });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'An error occurred while fetching analytics.',
      errors: [],
    });
  }
}