import { HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';

class SocketService {
  constructor() {
    this.connection = null;
    this.isConnecting = false;
    this.userListeners = new Set();
    this.orderListeners = new Set();
    this.menuListeners = new Set();
  }

  async startConnection() {
    if (this.connection && this.connection.state === 'Connected') {
      return this.connection;
    }
    if (this.isConnecting) return null;

    this.isConnecting = true;
    try {
      this.connection = new HubConnectionBuilder()
        .withUrl('/hubs/quickbite', {
          transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(LogLevel.Warning)
        .build();

      this.connection.on('UserUpdated', (user) => {
        this.userListeners.forEach((callback) => {
          try {
            callback(user);
          } catch (err) {
            console.error('Error in UserUpdated listener:', err);
          }
        });
      });

      this.connection.on('OrderUpdated', (order) => {
        this.orderListeners.forEach((callback) => {
          try {
            callback(order);
          } catch (err) {
            console.error('Error in OrderUpdated listener:', err);
          }
        });
      });

      this.connection.on('MenuUpdated', (restaurantId) => {
        this.menuListeners.forEach((callback) => {
          try {
            callback(restaurantId);
          } catch (err) {
            console.error('Error in MenuUpdated listener:', err);
          }
        });
      });

      await this.connection.start();
      console.log('✓ QuickBite Real-Time WebSockets Connected');
    } catch (err) {
      console.warn('WebSockets initial connection deferred:', err?.message || err);
    } finally {
      this.isConnecting = false;
    }

    return this.connection;
  }

  onUserUpdated(callback) {
    this.userListeners.add(callback);
    return () => this.userListeners.delete(callback);
  }

  onOrderUpdated(callback) {
    this.orderListeners.add(callback);
    return () => this.orderListeners.delete(callback);
  }

  onMenuUpdated(callback) {
    this.menuListeners.add(callback);
    return () => this.menuListeners.delete(callback);
  }

  async joinCustomerRoom(phone) {
    if (this.connection && this.connection.state === 'Connected' && phone) {
      try {
        await this.connection.invoke('JoinCustomerRoom', phone);
      } catch (err) {
        // quiet ignore
      }
    }
  }
}

export const socketService = new SocketService();
