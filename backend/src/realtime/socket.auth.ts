import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-12345';

export interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    role: string;
    email?: string;
    workspaceId: string;
  };
}

export const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
      socket.handshake.query?.token;

    if (!token) {
      return next(new Error('Authentication error: Token required'));
    }

    const decoded = jwt.verify(token as string, JWT_SECRET) as any;
    const userId = decoded.id || decoded.userId || decoded._id;

    if (!userId) {
      return next(new Error('Authentication error: Invalid payload'));
    }

    socket.data.userId = String(userId);
    socket.data.role = decoded.role || 'user';
    socket.data.email = decoded.email || '';
    socket.data.workspaceId = decoded.workspaceId || 'org:main';

    next();
  } catch (error: any) {
    next(new Error(`Authentication error: ${error.message || 'Unauthorized'}`));
  }
};
