import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  BoardState,
  BotConfig,
  BotDifficulty,
  FeaturedGame,
  GameMode,
  GameSession,
  MatchmakingRoom,
  MoveProbability,
  OfficialWallet,
  RoomType,
  SpectatorReaction,
  SystemStats,
  TokenSoul,
  Transaction,
  UserProfile,
  Wallet,
} from "../backend";

// ─── User Initialization ─────────────────────────────────────────────────────

export function useAutomaticUserInitialization() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["userInitialization"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.automaticUserInitialization();
    },
    enabled: !!actor && !actorFetching,
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  });
}

export function useIsFirstTime() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  return useQuery<boolean>({
    queryKey: ["isFirstTime"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.isFirstTime();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30000,
  });
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
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
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      color,
      avatarUrl,
      bio,
    }: { name: string; color: string; avatarUrl: string; bio: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(name, color, avatarUrl, bio);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["playerWallet"] });
    },
  });
}

export function useGetUserProfile() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.getUserProfile(principal);
    },
  });
}

export function useGetAllPlayers() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  return useQuery<UserProfile[]>({
    queryKey: ["allPlayers"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAllPlayers();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30000,
  });
}

// ─── Player Management ───────────────────────────────────────────────────────

export function useCreatePlayer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.createUser(name, color);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["playerWallet"] });
      queryClient.invalidateQueries({ queryKey: ["userInitialization"] });
      queryClient.invalidateQueries({ queryKey: ["isFirstTime"] });
    },
  });
}

export function useUpdatePlayer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updatePlayer(name, color);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useGenerateReferralLink() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.generateReferralLink();
    },
  });
}

// ─── Wallet ───────────────────────────────────────────────────────────────────

export function useGetPlayerWallet() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  return useQuery<Wallet | null>({
    queryKey: ["playerWallet"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getWallet();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetBalance() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  return useQuery<number>({
    queryKey: ["balance"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getBalance();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000,
  });
}

export function useGetDemoCredits() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  return useQuery<number>({
    queryKey: ["demoCredits"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getDemoCredits();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 15000,
  });
}

export function useResetDemoCredits() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.resetDemoCredits();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demoCredits"] });
      queryClient.invalidateQueries({ queryKey: ["playerWallet"] });
    },
  });
}

export function useGetTransactionHistory() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  return useQuery<Transaction[]>({
    queryKey: ["transactionHistory"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getTransactionHistory();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useDeposit() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (amount: number) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deposit(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playerWallet"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["transactionHistory"] });
    },
  });
}

export function useWithdraw() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (amount: number) => {
      if (!actor) throw new Error("Actor not available");
      return actor.withdraw(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playerWallet"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["transactionHistory"] });
    },
  });
}

export function useGetOfficialWallets() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  return useQuery<OfficialWallet[]>({
    queryKey: ["officialWallets"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getOfficialWallets();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Premium ──────────────────────────────────────────────────────────────────

export function useIsPremium() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  return useQuery<boolean>({
    queryKey: ["isPremium"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.isPremium();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUpgradeToPremium() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.upgradeToPremium();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["isPremium"] });
      queryClient.invalidateQueries({ queryKey: ["playerWallet"] });
    },
  });
}

// ─── Game ────────────────────────────────────────────────────────────────────

export function useCreateGame() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      gameMode,
      betAmount,
      isDemo,
    }: {
      gameMode: GameMode;
      betAmount: number;
      isDemo: boolean;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createGame(gameMode, betAmount, isDemo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableGames"] });
      queryClient.invalidateQueries({ queryKey: ["playerWallet"] });
    },
  });
}

export function useJoinGame() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      gameId,
      isDemo,
    }: { gameId: Principal; isDemo: boolean }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.joinGame(gameId, isDemo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableGames"] });
      queryClient.invalidateQueries({ queryKey: ["playerWallet"] });
    },
  });
}

export function useGetAvailableGames() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  return useQuery<GameSession[]>({
    queryKey: ["availableGames"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAvailableGames();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000,
  });
}

export function useGetGame() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (gameId: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.getGame(gameId);
    },
  });
}

export function useRollDice() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (gameId: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.rollDice(gameId);
    },
  });
}

export function useMoveToken() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      gameId,
      tokenIndex,
      rollValue,
    }: {
      gameId: Principal;
      tokenIndex: bigint;
      rollValue: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.moveToken(gameId, tokenIndex, rollValue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableGames"] });
    },
  });
}

export function useGetWinner() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (gameId: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.getWinner(gameId);
    },
  });
}

export function useForfeitGame() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (gameId: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.forfeitGame(gameId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableGames"] });
      queryClient.invalidateQueries({ queryKey: ["playerWallet"] });
    },
  });
}

// ─── Featured Games & System Stats ───────────────────────────────────────────

export function useGetFeaturedGames() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  return useQuery<FeaturedGame[]>({
    queryKey: ["featuredGames"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getFeaturedGames();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000,
  });
}

export function useGetSystemStats() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  return useQuery<SystemStats>({
    queryKey: ["systemStats"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getSystemStats();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000,
  });
}

// ─── Bots ─────────────────────────────────────────────────────────────────────

export function useGetAvailableBots() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  return useQuery<BotConfig[]>({
    queryKey: ["availableBots"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAvailableBots();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30000,
  });
}

export function useRegisterBot() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      difficulty,
    }: { name: string; difficulty: BotDifficulty }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.registerBot(name, difficulty);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableBots"] });
    },
  });
}

export function useGetBotMove() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      gameId,
      botPrincipal,
    }: { gameId: Principal; botPrincipal: Principal }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.getBotMove(gameId, botPrincipal);
    },
  });
}

// ─── Matchmaking Rooms ───────────────────────────────────────────────────────

export function useGetAvailableRooms() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  return useQuery<MatchmakingRoom[]>({
    queryKey: ["availableRooms"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAvailableRooms();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 3000,
  });
}

export function useCreateRoom() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      roomType,
      gameMode,
      betAmount,
      maxPlayers,
      isDemo,
    }: {
      roomType: RoomType;
      gameMode: GameMode;
      betAmount: number;
      maxPlayers: number;
      isDemo: boolean;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createMatchmakingRoom(
        roomType,
        gameMode,
        betAmount,
        BigInt(maxPlayers),
        isDemo,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableRooms"] });
    },
  });
}

export function useJoinRoom() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (roomId: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.joinRoom(roomId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableRooms"] });
    },
  });
}

export function useLeaveRoom() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (roomId: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.leaveRoom(roomId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableRooms"] });
    },
  });
}

export function useGetRoomState() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (roomId: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.getRoomState(roomId);
    },
  });
}

// ─── AI Move Oracle ───────────────────────────────────────────────────────────

export function useGetMoveProbabilities() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (gameId: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.getMoveProbabilities(gameId);
    },
  });
}

// ─── Living Board ─────────────────────────────────────────────────────────────

export function useGetBoardState() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (gameId: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.getBoardState(gameId);
    },
  });
}

// ─── Token Soul System ────────────────────────────────────────────────────────

export function useGetTokenSouls() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  const { identity } = useInternetIdentity();
  return useQuery<TokenSoul[]>({
    queryKey: ["tokenSouls"],
    queryFn: async () => {
      if (!actor || !identity)
        throw new Error("Actor or identity not available");
      return actor.getTokenSouls(identity.getPrincipal());
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useAddTokenXP() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tokenIndex,
      xp,
    }: { tokenIndex: bigint; xp: bigint }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addTokenXP(tokenIndex, xp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokenSouls"] });
    },
  });
}

// ─── Spectator Mode ───────────────────────────────────────────────────────────

export function useJoinAsSpectator() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (gameId: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.joinAsSpectator(gameId);
    },
  });
}

export function useLeaveSpectator() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (gameId: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.leaveSpectator(gameId);
    },
  });
}

export function useSendSpectatorReaction() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      gameId,
      emoji,
    }: { gameId: Principal; emoji: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.sendSpectatorReaction(gameId, emoji);
    },
  });
}

export function useGetSpectatorReactions(gameId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  return useQuery<SpectatorReaction[]>({
    queryKey: ["spectatorReactions", gameId?.toText()],
    queryFn: async () => {
      if (!actor || !gameId) throw new Error("Actor or gameId not available");
      return actor.getSpectatorReactions(gameId);
    },
    enabled: !!actor && !actorFetching && !!gameId,
    refetchInterval: 2000,
  });
}

export function useGetSpectatorCount(gameId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  return useQuery<bigint>({
    queryKey: ["spectatorCount", gameId?.toText()],
    queryFn: async () => {
      if (!actor || !gameId) throw new Error("Actor or gameId not available");
      return actor.getSpectatorCount(gameId);
    },
    enabled: !!actor && !actorFetching && !!gameId,
    refetchInterval: 5000,
  });
}
