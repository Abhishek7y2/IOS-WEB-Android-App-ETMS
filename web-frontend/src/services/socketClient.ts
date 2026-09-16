'use client';

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

class SocketClientManager {
  private socket: Socket | null = null;
  private listenersMap: Map<string, Set<(data: any) => void>> = new Map();

  public connect(token?: string) {
    if (this.socket?.connected) return;

    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') || localStorage.getItem('token') : null);
    if (!authToken) {
      return;
    }

    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        auth: { token: authToken },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      this.socket.on('connect', () => {
        console.log('[SocketClient] Connected to server:', this.socket?.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[SocketClient] Disconnected:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.warn('[SocketClient] Connection error:', error.message);
      });

      // Bind all dynamic listeners registered before or after connection
      this.listenersMap.forEach((callbacks, eventName) => {
        callbacks.forEach((cb) => {
          this.socket?.off(eventName, cb);
          this.socket?.on(eventName, cb);
        });
      });
    } else {
      this.socket.connect();
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public subscribe(event: string, callback: (envelope: any) => void): () => void {
    if (!this.listenersMap.has(event)) {
      this.listenersMap.set(event, new Set());
    }

    const callbacks = this.listenersMap.get(event)!;
    callbacks.add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }

    // Return cleanup function
    return () => {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listenersMap.delete(event);
      }
      if (this.socket) {
        this.socket.off(event, callback);
      }
    };
  }

  public emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketClient = new SocketClientManager();
