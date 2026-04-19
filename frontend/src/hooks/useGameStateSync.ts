import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetGame } from './useQueries';
import { Principal } from '@icp-sdk/core/principal';
import type { GameSession } from '../backend';

interface GameStateSyncOptions {
  gameId: string;
  onStateUpdate?: (state: GameSession) => void;
  pollInterval?: number;
  enabled?: boolean;
}

export function useGameStateSync({
  gameId,
  onStateUpdate,
  pollInterval = 2000,
  enabled = true,
}: GameStateSyncOptions) {
  const queryClient = useQueryClient();
  const getGame = useGetGame();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastStateRef = useRef<GameSession | null>(null);

  const syncGameState = useCallback(async () => {
    if (!enabled || !gameId) return;

    try {
      const principal = Principal.fromText(gameId);
      const gameState = await getGame.mutateAsync(principal);

      if (gameState) {
        // Check if state has changed
        const stateChanged = JSON.stringify(lastStateRef.current) !== JSON.stringify(gameState);
        
        if (stateChanged) {
          lastStateRef.current = gameState;
          
          // Update query cache
          queryClient.setQueryData(['game', gameId], gameState);
          
          // Notify callback
          if (onStateUpdate) {
            onStateUpdate(gameState);
          }
        }
      }
    } catch (error) {
      console.error('Failed to sync game state:', error);
    }
  }, [enabled, gameId, getGame, queryClient, onStateUpdate]);

  // Start polling
  useEffect(() => {
    if (!enabled) return;

    // Initial sync
    syncGameState();

    // Set up polling interval
    intervalRef.current = setInterval(syncGameState, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, pollInterval, syncGameState]);

  return {
    syncNow: syncGameState,
    lastState: lastStateRef.current,
  };
}
