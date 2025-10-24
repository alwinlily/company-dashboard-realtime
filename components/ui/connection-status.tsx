'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw, Loader2 } from 'lucide-react';
import { getConnectionStatus, onConnectionStatusChange, type ConnectionStatus } from '@/lib/realtime-service';

interface ConnectionStatusProps {
  className?: string;
  showDetails?: boolean;
}

export function ConnectionStatus({ className = '', showDetails = false }: ConnectionStatusProps) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Get initial status
    setStatus(getConnectionStatus());

    // Listen for status changes
    const unsubscribe = onConnectionStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    return unsubscribe;
  }, []);

  const handleReconnect = async () => {
    setIsRefreshing(true);
    try {
      // Import here to avoid circular dependencies
      const { realtimeService } = await import('@/lib/realtime-service');
      realtimeService.reconnect();

      // Show loading state for a moment
      setTimeout(() => {
        setIsRefreshing(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to reconnect:', error);
      setIsRefreshing(false);
    }
  };

  const getStatusConfig = (status: ConnectionStatus) => {
    switch (status) {
      case 'connected':
        return {
          label: 'Connected',
          variant: 'default' as const,
          icon: Wifi,
          color: 'bg-green-500',
          description: 'Real-time updates are active',
        };
      case 'connecting':
      case 'reconnecting':
        return {
          label: status === 'connecting' ? 'Connecting' : 'Reconnecting',
          variant: 'secondary' as const,
          icon: Loader2,
          color: 'bg-yellow-500',
          description: status === 'connecting'
            ? 'Establishing connection...'
            : 'Attempting to reconnect...',
          animate: true,
        };
      case 'disconnected':
        return {
          label: 'Disconnected',
          variant: 'destructive' as const,
          icon: WifiOff,
          color: 'bg-red-500',
          description: 'Real-time updates are paused',
        };
      default:
        return {
          label: 'Unknown',
          variant: 'secondary' as const,
          icon: WifiOff,
          color: 'bg-gray-500',
          description: 'Connection status unknown',
        };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`w-2 h-2 rounded-full ${config.color} ${
          status === 'connected' ? 'animate-pulse' : ''
        }`}></div>
        <Badge variant={config.variant} className="text-xs">
          <IconComponent className={`w-3 h-3 mr-1 ${config.animate ? 'animate-spin' : ''}`} />
          {config.label}
        </Badge>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between p-3 bg-white border rounded-lg ${className}`}>
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${config.color} ${
          status === 'connected' ? 'animate-pulse' : ''
        }`}></div>
        <div>
          <div className="flex items-center gap-2">
            <Badge variant={config.variant} className="text-xs">
              <IconComponent className={`w-3 h-3 mr-1 ${config.animate ? 'animate-spin' : ''}`} />
              {config.label}
            </Badge>
            <span className="text-sm text-gray-600">{config.description}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time updates {status === 'connected' ? 'are working' : 'are not available'}
          </p>
        </div>
      </div>

      {status === 'disconnected' && (
        <button
          onClick={handleReconnect}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isRefreshing ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <RefreshCw className="w-3 h-3" />
              Reconnect
            </>
          )}
        </button>
      )}
    </div>
  );
}