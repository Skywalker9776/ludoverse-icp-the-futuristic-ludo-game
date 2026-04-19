import { useState, useCallback } from 'react';

interface OptimisticUpdate<T> {
  id: string;
  data: T;
  timestamp: number;
}

interface UseOptimisticStateOptions<T> {
  onRollback?: (update: OptimisticUpdate<T>) => void;
}

export function useOptimisticState<T>(
  initialState: T,
  options?: UseOptimisticStateOptions<T>
) {
  const [confirmedState, setConfirmedState] = useState<T>(initialState);
  const [optimisticUpdates, setOptimisticUpdates] = useState<OptimisticUpdate<T>[]>([]);

  // Apply optimistic update
  const applyOptimisticUpdate = useCallback((id: string, data: T) => {
    const update: OptimisticUpdate<T> = {
      id,
      data,
      timestamp: Date.now(),
    };
    setOptimisticUpdates(prev => [...prev, update]);
  }, []);

  // Confirm update (remove from pending)
  const confirmUpdate = useCallback((id: string, confirmedData?: T) => {
    setOptimisticUpdates(prev => prev.filter(update => update.id !== id));
    if (confirmedData) {
      setConfirmedState(confirmedData);
    }
  }, []);

  // Rollback update (server rejected)
  const rollbackUpdate = useCallback((id: string) => {
    const update = optimisticUpdates.find(u => u.id === id);
    if (update && options?.onRollback) {
      options.onRollback(update);
    }
    setOptimisticUpdates(prev => prev.filter(update => update.id !== id));
  }, [optimisticUpdates, options]);

  // Get current display state (optimistic or confirmed)
  const displayState = optimisticUpdates.length > 0 
    ? optimisticUpdates[optimisticUpdates.length - 1].data 
    : confirmedState;

  return {
    displayState,
    confirmedState,
    pendingUpdates: optimisticUpdates,
    applyOptimisticUpdate,
    confirmUpdate,
    rollbackUpdate,
    hasPendingUpdates: optimisticUpdates.length > 0,
  };
}
