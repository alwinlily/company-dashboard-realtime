'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { subscribeToTable, unsubscribeFromTable, getConnectionStatus } from '@/lib/realtime-service';

interface UseRealtimeDataOptions<T> {
  tableName: string;
  initialData?: T[];
  fetchFn?: () => Promise<T[]>;
  pollInterval?: number; // Fallback polling interval in ms
  enableRealtime?: boolean;
  enablePolling?: boolean;
}

interface RealtimeDataState<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  lastUpdate: Date | null;
}

export function useRealtimeData<T>({
  tableName,
  initialData = [],
  fetchFn,
  pollInterval = 60000, // Default 1 minute
  enableRealtime = true,
  enablePolling = true,
}: UseRealtimeDataOptions<T>) {
  const [state, setState] = useState<RealtimeDataState<T>>({
    data: initialData,
    isLoading: true,
    error: null,
    isConnected: false,
    lastUpdate: null,
  });

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Memoized fetch function
  const fetchData = useCallback(async () => {
    if (!fetchFn) return;

    try {
      const data = await fetchFn();

      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          data,
          isLoading: false,
          error: null,
          lastUpdate: new Date(),
        }));
      }
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);

      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to fetch data',
          isLoading: false,
        }));
      }
    }
  }, [tableName, fetchFn]);

  // Setup Realtime subscription
  useEffect(() => {
    if (!enableRealtime) return;

    const handleRealtimeEvent = () => {
      // When a realtime event occurs, refetch the data
      console.log(`Realtime event detected for ${tableName}, refetching data...`);
      fetchData();
    };

    const unsubscribe = subscribeToTable(tableName, handleRealtimeEvent);

    // Update connection status
    setState(prev => ({
      ...prev,
      isConnected: getConnectionStatus() === 'connected',
    }));

    return () => {
      unsubscribe();
    };
  }, [tableName, enableRealtime, fetchData]);

  // Setup polling as fallback
  useEffect(() => {
    if (!enablePolling || !pollInterval) return;

    // Start polling
    pollingIntervalRef.current = setInterval(fetchData, pollInterval);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [enablePolling, pollInterval, fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Monitor connection status changes
  useEffect(() => {
    if (!enableRealtime) return;

    const updateConnectionStatus = () => {
      setState(prev => ({
        ...prev,
        isConnected: getConnectionStatus() === 'connected',
      }));
    };

    // Check connection status periodically
    const statusInterval = setInterval(updateConnectionStatus, 5000);

    return () => {
      clearInterval(statusInterval);
    };
  }, [enableRealtime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Manual refresh function
  const refresh = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true }));
    return fetchData();
  }, [fetchData]);

  return {
    ...state,
    refresh,
  };
}