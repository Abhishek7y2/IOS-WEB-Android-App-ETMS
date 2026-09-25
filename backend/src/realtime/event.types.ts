export type EventType =
  | 'task.created'
  | 'task.updated'
  | 'task.deleted'
  | 'task.assigned'
  | 'leave.created'
  | 'leave.approved'
  | 'leave.rejected'
  | 'attendance.checked_in'
  | 'attendance.checked_out'
  | 'announcement.created'
  | 'message.created'
  | 'notification.created'
  | 'auth.force_logout';

export interface EventEnvelope<T = any> {
  eventId: string;
  event: EventType;
  version: number;
  timestamp: string;
  organizationId?: string;
  actorId?: string;
  data: T;
}
