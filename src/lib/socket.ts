import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('Socket.IO connected:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket.IO disconnected');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
      });
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Join admin room to receive real-time updates
  joinAdminRoom(): void {
    if (this.socket) {
      this.socket.emit('join-admin');
    }
  }

  // Listen for user created events
  onUserCreated(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('user-created', callback);
    }
  }

  // Listen for user updated events
  onUserUpdated(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('user-updated', callback);
    }
  }

  // Listen for user deleted events
  onUserDeleted(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('user-deleted', callback);
    }
  }

  // Remove event listeners
  offUserCreated(callback?: (data: any) => void): void {
    if (this.socket) {
      this.socket.off('user-created', callback);
    }
  }

  offUserUpdated(callback?: (data: any) => void): void {
    if (this.socket) {
      this.socket.off('user-updated', callback);
    }
  }

  offUserDeleted(callback?: (data: any) => void): void {
    if (this.socket) {
      this.socket.off('user-deleted', callback);
    }
  }
}

export const socketService = new SocketService();
