import { RealtimeChannel, RealtimeClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type RealtimeEventHandler = (payload: any) => void;
type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'reconnecting';

class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private eventHandlers: Map<string, RealtimeEventHandler[]> = new Map();
  private connectionStatus: ConnectionStatus = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 30000; // Max 30 seconds
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private statusChangeCallbacks: ((status: ConnectionStatus) => void)[] = [];

  constructor() {
    this.setupConnectionListeners();
  }

  private setupConnectionListeners() {
    // Listen to connection state changes
    supabase.realtime.onOpen(() => {
      console.log('Supabase Realtime connection opened');
      this.updateConnectionStatus('connected');
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      this.startHeartbeat();
    });

    supabase.realtime.onClose(() => {
      console.log('Supabase Realtime connection closed');
      this.updateConnectionStatus('disconnected');
      this.stopHeartbeat();
      this.handleReconnection();
    });

    supabase.realtime.onError((error) => {
      console.error('Supabase Realtime connection error:', error);
      this.updateConnectionStatus('disconnected');
      this.handleReconnection();
    });
  }

  private updateConnectionStatus(status: ConnectionStatus) {
    const oldStatus = this.connectionStatus;
    this.connectionStatus = status;

    if (oldStatus !== status) {
      console.log(`Connection status changed: ${oldStatus} -> ${status}`);
      this.statusChangeCallbacks.forEach(callback => callback(status));
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.connectionStatus === 'connected') {
        // Send a heartbeat to keep the connection alive
        supabase.realtime.send({
          type: 'heartbeat',
        });
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private async handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.updateConnectionStatus('disconnected');
      return;
    }

    this.reconnectAttempts++;
    this.updateConnectionStatus('reconnecting');

    // Exponential backoff with jitter
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1) +
      Math.random() * 1000,
      this.maxReconnectDelay
    );

    console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    setTimeout(() => {
      this.reconnectAllChannels();
    }, delay);
  }

  private async reconnectAllChannels() {
    const channelsToReconnect = Array.from(this.channels.entries());

    for (const [channelName, channel] of channelsToReconnect) {
      try {
        await this.resubscribeToChannel(channelName, channel);
      } catch (error) {
        console.error(`Failed to reconnect to channel ${channelName}:`, error);
      }
    }
  }

  private async resubscribeToChannel(channelName: string, channel: RealtimeChannel) {
    // Unsubscribe first
    supabase.removeChannel(channel);

    // Create new channel subscription
    const eventHandlers = this.eventHandlers.get(channelName) || [];

    const newChannel = supabase
      .channel(`realtime-${channelName}-${Date.now()}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: channelName,
      }, (payload) => {
        this.handleRealtimeEvent(channelName, payload);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully reconnected to channel: ${channelName}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Channel error for: ${channelName}`);
        }
      });

    this.channels.set(channelName, newChannel);
  }

  private handleRealtimeEvent(channelName: string, payload: any) {
    console.log(`Realtime event received on ${channelName}:`, payload);

    const handlers = this.eventHandlers.get(channelName) || [];
    handlers.forEach(handler => {
      try {
        handler(payload);
      } catch (error) {
        console.error(`Error in realtime event handler for ${channelName}:`, error);
      }
    });
  }

  // Public API methods
  public subscribeToTable(
    tableName: string,
    eventHandler: RealtimeEventHandler
  ): () => void {
    const channelName = tableName;

    // Add handler to our registry
    if (!this.eventHandlers.has(channelName)) {
      this.eventHandlers.set(channelName, []);
    }
    this.eventHandlers.get(channelName)!.push(eventHandler);

    // Create channel if it doesn't exist
    if (!this.channels.has(channelName)) {
      const channel = supabase
        .channel(`realtime-${channelName}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: channelName,
        }, (payload) => {
          this.handleRealtimeEvent(channelName, payload);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`Successfully subscribed to: ${channelName}`);
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`Channel error for: ${channelName}`);
          }
        });

      this.channels.set(channelName, channel);
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribeFromTable(channelName, eventHandler);
    };
  }

  public unsubscribeFromTable(tableName: string, eventHandler?: RealtimeEventHandler) {
    const channelName = tableName;

    if (eventHandler) {
      // Remove specific handler
      const handlers = this.eventHandlers.get(channelName) || [];
      const index = handlers.indexOf(eventHandler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    } else {
      // Remove all handlers for this table
      this.eventHandlers.delete(channelName);
    }

    // If no handlers left, clean up the channel
    if (!this.eventHandlers.has(channelName) || this.eventHandlers.get(channelName)!.length === 0) {
      const channel = this.channels.get(channelName);
      if (channel) {
        supabase.removeChannel(channel);
        this.channels.delete(channelName);
        this.eventHandlers.delete(channelName);
      }
    }
  }

  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  public onConnectionStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.statusChangeCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.statusChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.statusChangeCallbacks.splice(index, 1);
      }
    };
  }

  public disconnect() {
    // Clean up all channels
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });

    this.channels.clear();
    this.eventHandlers.clear();
    this.stopHeartbeat();
    this.updateConnectionStatus('disconnected');
  }

  // Utility method to manually reconnect
  public reconnect() {
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
    this.updateConnectionStatus('connecting');
    this.reconnectAllChannels();
  }

  // Get connection statistics
  public getConnectionStats() {
    return {
      status: this.connectionStatus,
      reconnectAttempts: this.reconnectAttempts,
      activeChannels: this.channels.size,
      totalHandlers: Array.from(this.eventHandlers.values()).reduce((sum, handlers) => sum + handlers.length, 0),
    };
  }
}

// Create singleton instance
export const realtimeService = new RealtimeService();

// Export convenience functions
export const subscribeToTable = (tableName: string, eventHandler: RealtimeEventHandler) => {
  return realtimeService.subscribeToTable(tableName, eventHandler);
};

export const unsubscribeFromTable = (tableName: string, eventHandler?: RealtimeEventHandler) => {
  realtimeService.unsubscribeFromTable(tableName, eventHandler);
};

export const getConnectionStatus = () => realtimeService.getConnectionStatus();
export const onConnectionStatusChange = (callback: (status: ConnectionStatus) => void) => {
  return realtimeService.onConnectionStatusChange(callback);
};