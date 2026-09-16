import { Server } from 'socket.io';
import { EventType, EventEnvelope } from './event.types';

let ioInstance: Server | null = null;

export const setSocketServerInstance = (io: Server) => {
  ioInstance = io;
};

export interface EventMetaOptions {
  actorId?: string;
  organizationId?: string;
}

export const publishEvent = <T = any>(
  event: EventType,
  data: T,
  targetRooms: string | string[] = 'org:main',
  options?: EventMetaOptions
) => {
  if (!ioInstance) {
    console.warn(`[Socket.IO Publisher] Warning: IO instance not initialized when publishing event: ${event}`);
    return;
  }

  const envelope: EventEnvelope<T> = {
    eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    event,
    version: 1,
    timestamp: new Date().toISOString(),
    organizationId: options?.organizationId || 'main',
    actorId: options?.actorId,
    data,
  };

  const rooms = Array.isArray(targetRooms) ? targetRooms : [targetRooms];

  rooms.forEach((room) => {
    ioInstance!.to(room).emit('realtime.event', envelope);
    ioInstance!.to(room).emit(event, envelope);
    console.log(`[Socket.IO Broadcast] Event '${event}' [${envelope.eventId}] (actor: ${envelope.actorId || 'system'}) sent to room '${room}'`);
  });
};
