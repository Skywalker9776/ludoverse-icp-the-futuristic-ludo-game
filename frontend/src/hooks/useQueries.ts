import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, Player, Wallet, GameMode, RankedStatus, OfficialWallet, GameSession, BotConfig, BotDifficulty, MatchmakingRoom, RoomType } from '../backend';
import { Principal } from '@icp-sdk/core/principal';

// Automatic User Initialization
export function useAutomaticUserInitialization() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['userInitialization'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.automaticUserInitialization();
    },
    enabled: !!actor && !actorFetching,
    staleTime: Infinity,
    retry: false,
  });
}

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['playerWallet'] });
      queryClient.invalidateQueries({ queryKey: ['player'] });
    },
  });
}

// Player Queries
export function useCreatePlayer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Create player in backend - this also creates the wallet if it doesn't exist
      await actor.createUser(name, color);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['playerWallet'] });
      queryClient.invalidateQueries({ queryKey: ['userInitialization'] });
      queryClient.invalidateQueries({ queryKey: ['player'] });
    },
  });
}

export function useUpdatePlayer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updatePlayer(name, color);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['player'] });
    },
  });
}

export function useGetPlayer() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Player | null>({
    queryKey: ['player'],
    queryFn: async () => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      return actor.getPlayer(identity.getPrincipal());
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

// Wallet Queries
export function useGetPlayerWallet() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Wallet | null>({
    queryKey: ['playerWallet'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getWallet();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetBalance() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<number>({
    queryKey: ['balance'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBalance();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time balance
  });
}

export function useGetOfficialWallets() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<OfficialWallet[]>({
    queryKey: ['officialWallets'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getOfficialWallets();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

export function useDeposit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deposit(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerWallet'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['player'] });
    },
  });
}

export function useWithdraw() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.withdraw(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerWallet'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['player'] });
    },
  });
}

// Premium Upgrade
export function useUpgradeToPremium() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.upgradeToPremium();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['playerWallet'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['player'] });
    },
  });
}

export function useIsPremium() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isPremium'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isPremium();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Game Queries
export function useCreateGame() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gameMode, rankedStatus, betAmount, isDemo }: { 
      gameMode: GameMode; 
      rankedStatus: RankedStatus;
      betAmount: number; 
      isDemo: boolean 
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createGame(gameMode, rankedStatus, betAmount, isDemo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerWallet'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['availableGames'] });
    },
  });
}

export function useJoinGame() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gameId, isDemo }: { gameId: Principal; isDemo: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.joinGame(gameId, isDemo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerWallet'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['availableGames'] });
    },
  });
}

export function useGetAvailableGames() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<GameSession[]>({
    queryKey: ['availableGames'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAvailableGames();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });
}

export function useGetGame() {
  const { actor, isFetching: actorFetching } = useActor();

  return useMutation({
    mutationFn: async (gameId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getGame(gameId);
    },
  });
}

// Bot Queries
export function useGetAvailableBots() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<BotConfig[]>({
    queryKey: ['availableBots'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAvailableBots();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30000, // Cache for 30 seconds
  });
}

export function useRegisterBot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (difficulty: BotDifficulty) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerBot(difficulty);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableBots'] });
    },
  });
}

export function useActivatePremiumBot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (botId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.activatePremiumBot(botId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableBots'] });
    },
  });
}

// Matchmaking Room Queries
export function useGetAvailableRooms() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MatchmakingRoom[]>({
    queryKey: ['availableRooms'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAvailableRooms();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 3000, // Refetch every 3 seconds for real-time room updates
  });
}

export function useCreateRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomType, gameMode, maxPlayers, isDemo }: {
      roomType: RoomType;
      gameMode: GameMode;
      maxPlayers: number;
      isDemo: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createMatchmakingRoom(roomType, gameMode, BigInt(maxPlayers), isDemo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableRooms'] });
    },
  });
}

export function useJoinRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.joinRoom(roomId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableRooms'] });
    },
  });
}

export function useLeaveRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.leaveRoom(roomId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableRooms'] });
    },
  });
}

// Dice Roll Queries
export function useRollDice() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (gameId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Identity not available');
      return actor.rollDice(gameId, identity.getPrincipal());
    },
  });
}

export function useGetDiceHistory() {
  const { actor, isFetching: actorFetching } = useActor();

  return useMutation({
    mutationFn: async (gameId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDiceHistory(gameId);
    },
  });
}
