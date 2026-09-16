import { io, Socket } from 'socket.io-client';
import { safeStorage } from './storage';
import { TOKEN_STORAGE_KEY } from './axios';
import { API_BASE_URL } from '../config/api';

const SOCKET_SERVER_URL = API_BASE_URL.replace(/\/api\/?$/, '');

class MobileSocketService {
  private socket: Socket | null = null;
  private listenersMap: Map<string, Set<(data: any) => void>> = new Map();
  private isConnecting: boolean = false;

  public async connect(): Promise<void> {
    if (this.socket?.connected || this.isConnecting) return;

    this.isConnecting = true;
    try {
      const token = await safeStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token || token.startsWith('mock_')) {
        this.isConnecting = false;
        return;
      }

      if (!this.socket) {
        this.socket = io(SOCKET_SERVER_URL, {
          transports: ['websocket', 'polling'],
          auth: { token },
          extraHeaders: { Authorization: `Bearer ${token}` },
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
          reconnectionDelayMax: 10000,
        });

        this.socket.on('connect', () => {
          console.log('[MobileSocket] Connected successfully. Socket ID:', this.socket?.id);
          this.isConnecting = false;
        });

        this.socket.on('disconnect', (reason) => {
          console.log('[MobileSocket] Disconnected:', reason);
        });

        this.socket.on('connect_error', (err) => {
          console.warn('[MobileSocket] Connection error:', err.message);
          this.isConnecting = false;
        });

        // Re-attach any listeners registered
        this.listenersMap.forEach((callbacks, eventName) => {
          callbacks.forEach((cb) => {
            this.socket?.off(eventName, cb);
            this.socket?.on(eventName, cb);
          });
        });
      } else {
        if (token) {
          this.socket.auth = { token };
        }
        this.socket.connect();
      }
    } catch (error) {
      console.error('[MobileSocket] Error during connect:', error);
    } finally {
      this.isConnecting = false;
    }
  }

  public disconnect(): void {
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

  public emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  public isConnected(): boolean {
    return Boolean(this.socket?.connected);
  }
}

export const socketService = new MobileSocketService();
