import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { socketAuthMiddleware, AuthenticatedSocket } from './socket.auth';
import { setupSocketRooms } from './socket.rooms';
import { setSocketServerInstance } from './event.publisher';

export const initSocketIOServer = (httpServer: HttpServer): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication Middleware
  io.use(socketAuthMiddleware);

  // Connection Handler
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`⚡ Socket Client Connected: ${socket.id} (User: ${socket.data.userId})`);

    // Setup room joins
    setupSocketRooms(socket);

    // Join conversation rooms dynamically
    socket.on('join_conversation', (conversationId: string) => {
      if (conversationId) {
        socket.join(`conv:${conversationId}`);
        console.log(`Socket [${socket.id}] joined conversation room: conv:${conversationId}`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket Client Disconnected: ${socket.id} (Reason: ${reason})`);
    });
  });

  setSocketServerInstance(io);
  return io;
};
