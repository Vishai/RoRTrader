import { io, Socket } from 'socket.io-client';

export interface WebSocketConfig {
  url?: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionDelay?: number;
  reconnectionAttempts?: number;
  auth?: Record<string, any>;
}

export type WebSocketEventHandler = (data: any) => void;

// WebSocket Service for real-time communication
export class WebSocketService {
  private static instance: WebSocketService | null = null;
  private socket: Socket | null = null;
  private eventHandlers: Map<string, Set<WebSocketEventHandler>> = new Map();
  private connected: boolean = false;
  private config: WebSocketConfig = {
    url: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001',
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  };

  // Singleton pattern
  static getInstance(): WebSocketService {
    if (!this.instance) {
      this.instance = new WebSocketService();
    }
    return this.instance;
  }

  // Initialize WebSocket connection
  initialize(config?: WebSocketConfig): void {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    this.config = { ...this.config, ...config };

    this.socket = io(this.config.url!, {
      autoConnect: this.config.autoConnect,
      reconnection: this.config.reconnection,
      reconnectionDelay: this.config.reconnectionDelay,
      reconnectionAttempts: this.config.reconnectionAttempts,
      auth: this.config.auth,
      transports: ['websocket', 'polling'],
    });

    this.setupEventListeners();
  }

  // Setup core event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected:', this.socket!.id);
      this.connected = true;
      this.emit('connected', { socketId: this.socket!.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.connected = false;
      this.emit('disconnected', { reason });
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', { error });
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
      this.emit('reconnected', { attemptNumber });
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('WebSocket reconnection error:', error);
      this.emit('reconnect_error', { error });
    });

    this.socket.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed');
      this.emit('reconnect_failed', {});
    });
  }

  // Subscribe to an event
  on(event: string, handler: WebSocketEventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
      
      // Register with socket.io if not a local event
      if (this.socket && !this.isLocalEvent(event)) {
        this.socket.on(event, (data) => {
          this.emit(event, data);
        });
      }
    }

    this.eventHandlers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.eventHandlers.delete(event);
          if (this.socket && !this.isLocalEvent(event)) {
            this.socket.off(event);
          }
        }
      }
    };
  }

  // Emit an event locally (trigger registered handlers)
  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  // Send a message to the server
  send(event: string, data?: any, ack?: (response: any) => void): void {
    if (!this.socket || !this.connected) {
      console.warn('WebSocket not connected. Message not sent:', event);
      return;
    }

    if (ack) {
      this.socket.emit(event, data, ack);
    } else {
      this.socket.emit(event, data);
    }
  }

  // Request-response pattern
  async request<T = any>(event: string, data?: any, timeout: number = 5000): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.connected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const timer = setTimeout(() => {
        reject(new Error(`Request timeout for event: ${event}`));
      }, timeout);

      this.socket.emit(event, data, (response: any) => {
        clearTimeout(timer);
        
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.data || response);
        }
      });
    });
  }

  // Join a room
  joinRoom(room: string): void {
    this.send('join_room', { room });
  }

  // Leave a room
  leaveRoom(room: string): void {
    this.send('leave_room', { room });
  }

  // Subscribe to bot updates
  subscribeToBotUpdates(botId: string): () => void {
    this.joinRoom(`bot:${botId}`);
    return () => this.leaveRoom(`bot:${botId}`);
  }

  // Subscribe to webhook logs
  subscribeToWebhookLogs(botId: string): () => void {
    this.joinRoom(`webhooks:${botId}`);
    return () => this.leaveRoom(`webhooks:${botId}`);
  }

  // Subscribe to trade updates
  subscribeToTradeUpdates(botId: string): () => void {
    this.joinRoom(`trades:${botId}`);
    return () => this.leaveRoom(`trades:${botId}`);
  }

  // Subscribe to system alerts
  subscribeToSystemAlerts(): () => void {
    this.joinRoom('system:alerts');
    return () => this.leaveRoom('system:alerts');
  }

  // Check if event is local (not sent to server)
  private isLocalEvent(event: string): boolean {
    const localEvents = [
      'connected',
      'disconnected',
      'error',
      'reconnected',
      'reconnect_error',
      'reconnect_failed',
    ];
    return localEvents.includes(event);
  }

  // Get connection status
  isConnected(): boolean {
    return this.connected && this.socket?.connected === true;
  }

  // Disconnect from WebSocket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventHandlers.clear();
    this.connected = false;
  }

  // Reconnect to WebSocket
  reconnect(): void {
    if (this.socket) {
      this.socket.connect();
    } else {
      this.initialize();
    }
  }

  // Get socket ID
  getSocketId(): string | null {
    return this.socket?.id || null;
  }
}

// Export singleton instance
export const wsService = WebSocketService.getInstance();

// Convenience methods
export const initializeWebSocket = (config?: WebSocketConfig) => wsService.initialize(config);
export const disconnectWebSocket = () => wsService.disconnect();
export const isWebSocketConnected = () => wsService.isConnected();