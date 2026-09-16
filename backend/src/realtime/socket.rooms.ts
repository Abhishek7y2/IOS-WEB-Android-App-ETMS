import { AuthenticatedSocket } from './socket.auth';

export const setupSocketRooms = (socket: AuthenticatedSocket) => {
  const { userId, workspaceId } = socket.data;

  if (userId) {
    socket.join(`user:${userId}`);
    console.log(`Socket [${socket.id}] joined user room: user:${userId}`);
  }

  const role = (socket.data as any).role;
  if (role) {
    socket.join(`role:${role}`);
    console.log(`Socket [${socket.id}] joined role room: role:${role}`);
  }

  const orgId = workspaceId || (socket.data as any).organizationId || 'main';
  const orgRoom = orgId.startsWith('org:') ? orgId : `org:${orgId}`;
  socket.join(orgRoom);
  console.log(`Socket [${socket.id}] joined org room: ${orgRoom}`);
};
