import { useState, useEffect, useCallback } from 'react';
import { useActor } from './useActor';
import { useGetGame } from './useQueries';
import { Principal } from '@icp-sdk/core/principal';
import type { GameSession } from '../backend';

interface ReconnectState {
  isReconnecting: boolean;
  reconnectionAttempts: number;
  lastConnectedAt: number | null;
  isOnline: boolean;
}

export function useReconnect(gameId: string | null) {
  const { actor } = useActor();
  const getGame = useGetGame();
  
  const [reconnectState, setReconnectState] = useState<ReconnectState>({
    isReconnecting: false,
    reconnectionAttempts: 0,
    lastConnectedAt: Date.now(),
    isOnline: navigator.onLine,
  });

  const [gameState, setGameState] = useState<GameSession | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setReconnectState(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setReconnectState(prev => ({ 
        ...prev, 
        isOnline: false,
        isReconnecting: true 
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Reconnection logic with exponential backoff
  const reconnect = useCallback(async () => {
    if (!gameId || !actor) return;

    setReconnectState(prev => ({
      ...prev,
      isReconnecting: true,
      reconnectionAttempts: prev.reconnectionAttempts + 1,
    }));

    try {
      const principal = Principal.fromText(gameId);
      const game = await getGame.mutateAsync(principal);
      
      if (game) {
        setGameState(game);
        setReconnectState(prev => ({
          ...prev,
          isReconnecting: false,
          reconnectionAttempts: 0,
          lastConnectedAt: Date.now(),
        }));
        return game;
      }
    } catch (error) {
      console.error('Reconnection failed:', error);
      
      // Exponential backoff: 1s, 2s, 4s, 8s, max 16s
      const backoffDelay = Math.min(1000 * Math.pow(2, reconnectState.reconnectionAttempts), 16000);
      
      setTimeout(() => {
        reconnect();
      }, backoffDelay);
    }
  }, [gameId, actor, getGame, reconnectState.reconnectionAttempts]);

  // Auto-reconnect when coming back online
  useEffect(() => {
    if (reconnectState.isOnline && reconnectState.isReconnecting && gameId) {
      reconnect();
    }
  }, [reconnectState.isOnline, reconnectState.isReconnecting, gameId, reconnect]);

  return {
    ...reconnectState,
    reconnect,
    gameState,
  };
}
