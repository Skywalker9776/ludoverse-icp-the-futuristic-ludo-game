import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BotConfig {
    principal: Principal;
    balance: number;
    isPremium: boolean;
    difficulty: BotDifficulty;
    name: string;
}
export interface TokenSoul {
    xp: bigint;
    tokenIndex: bigint;
    level: bigint;
    capturedCount: bigint;
    nearMissCount: bigint;
    captureCount: bigint;
}
export interface TokenPosition {
    isFinished: boolean;
    tokenIndex: bigint;
    isHome: boolean;
    isSafe: boolean;
    position: bigint;
}
export interface SystemStats {
    totalPlayers: bigint;
    totalGames: bigint;
    totalSpectators: bigint;
    totalBetsVolume: number;
    activeGames: bigint;
}
export interface BoardState {
    betMultiplier: number;
    winStreakPlayer?: Principal;
    state: string;
    glowIntensity: number;
}
export interface FeaturedGame {
    status: GameStatus;
    betAmount: number;
    spectatorCount: bigint;
    mode: GameMode;
    gameId: Principal;
    playerCount: bigint;
}
export interface Transaction {
    id: bigint;
    description: string;
    timestamp: bigint;
    txType: Variant_withdraw_betLock_betRefund_deposit_betWin;
    amount: number;
}
export interface Wallet {
    id: Principal;
    balance: number;
    createdAt: bigint;
    demoCredits: number;
    lastActive: bigint;
}
export interface MoveProbability {
    probability: number;
    safeScore: number;
    captureChance: number;
    position: bigint;
}
export interface DiceRoll {
    seedHash: string;
    seed: string;
    diceResult: bigint;
    entropy: string;
    rollNumber: bigint;
    timestamp: bigint;
    playerPrincipal: Principal;
}
export interface SpectatorReaction {
    reactorPrincipal: Principal;
    emoji: string;
    timestamp: bigint;
}
export interface PlayerState {
    principal: Principal;
    lastBetAmount: number;
    tokens: Array<TokenPosition>;
    consecutiveWins: bigint;
}
export interface MatchmakingRoom {
    id: Principal;
    status: GameStatus;
    creator: Principal;
    betAmount: number;
    createdAt: bigint;
    playerCount: bigint;
    isDemo: boolean;
    players: Array<Principal>;
    gameMode: GameMode;
    roomType: RoomType;
    maxPlayers: bigint;
}
export interface OfficialWallet {
    address: string;
    walletLabel: string;
}
export interface UserProfile {
    bio: string;
    referralCode: string;
    gamesPlayed: number;
    isPremium: boolean;
    name: string;
    createdAt: bigint;
    color: string;
    wins: number;
    losses: number;
    icpBalance: number;
    currentGame?: Principal;
    avatarUrl: string;
    demoCredits: number;
    draws: number;
    lastActive: bigint;
}
export interface GameSession {
    id: Principal;
    playerStates: Array<PlayerState>;
    status: GameStatus;
    betAmount: number;
    mode: GameMode;
    createdAt: bigint;
    winner?: Principal;
    isDemo: boolean;
    currentTurn: bigint;
    players: Array<Principal>;
    diceHistory: Array<DiceRoll>;
    rankedStatus: RankedStatus;
}
export enum BotDifficulty {
    easy = "easy",
    hard = "hard",
    medium = "medium"
}
export enum GameMode {
    magic = "magic",
    timed = "timed",
    challenge = "challenge",
    advanced = "advanced",
    experimental = "experimental",
    custom = "custom",
    demo = "demo",
    team = "team",
    superLudo = "superLudo",
    quick = "quick",
    tournament = "tournament",
    classic = "classic",
    twoVsTwo = "twoVsTwo",
    practice = "practice",
    bonus = "bonus",
    master = "master",
    copyClassic = "copyClassic",
    copyFast = "copyFast"
}
export enum GameStatus {
    active = "active",
    completed = "completed",
    waiting = "waiting"
}
export enum RankedStatus {
    ranked = "ranked",
    unranked = "unranked"
}
export enum RoomType {
    privateRoom = "privateRoom",
    isPublic = "isPublic"
}
export enum Variant_withdraw_betLock_betRefund_deposit_betWin {
    withdraw = "withdraw",
    betLock = "betLock",
    betRefund = "betRefund",
    deposit = "deposit",
    betWin = "betWin"
}
export interface backendInterface {
    addTokenXP(tokenIndex: bigint, xp: bigint): Promise<void>;
    automaticUserInitialization(): Promise<{
        loginSuccess: boolean;
        message: string;
        wallet: Wallet;
        playerExists: boolean;
    }>;
    createGame(mode: GameMode, betAmount: number, isDemo: boolean): Promise<Principal>;
    createMatchmakingRoom(roomType: RoomType, gameMode: GameMode, betAmount: number, maxPlayers: bigint, isDemo: boolean): Promise<Principal>;
    createUser(name: string, color: string): Promise<void>;
    deposit(amount: number): Promise<boolean>;
    forfeitGame(gameId: Principal): Promise<boolean>;
    generateReferralLink(): Promise<string>;
    getAllPlayers(): Promise<Array<UserProfile>>;
    getAvailableBots(): Promise<Array<BotConfig>>;
    getAvailableGames(): Promise<Array<GameSession>>;
    getAvailableRooms(): Promise<Array<MatchmakingRoom>>;
    getBalance(): Promise<number>;
    getBoardState(gameId: Principal): Promise<BoardState>;
    getBotMove(gameId: Principal, botPrincipal: Principal): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getDemoCredits(): Promise<number>;
    getFeaturedGames(): Promise<Array<FeaturedGame>>;
    getGame(gameId: Principal): Promise<GameSession | null>;
    getMoveProbabilities(gameId: Principal): Promise<Array<MoveProbability>>;
    getOfficialWallets(): Promise<Array<OfficialWallet>>;
    getRoomState(roomId: Principal): Promise<MatchmakingRoom | null>;
    getSpectatorCount(gameId: Principal): Promise<bigint>;
    getSpectatorReactions(gameId: Principal): Promise<Array<SpectatorReaction>>;
    getSystemStats(): Promise<SystemStats>;
    getTokenSouls(player: Principal): Promise<Array<TokenSoul>>;
    getTransactionHistory(): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWallet(): Promise<Wallet | null>;
    getWinner(gameId: Principal): Promise<Principal | null>;
    isFirstTime(): Promise<boolean>;
    isPremium(): Promise<boolean>;
    joinAsSpectator(gameId: Principal): Promise<boolean>;
    joinGame(gameId: Principal, isDemo: boolean): Promise<boolean>;
    joinRoom(roomId: Principal): Promise<boolean>;
    leaveRoom(roomId: Principal): Promise<boolean>;
    leaveSpectator(gameId: Principal): Promise<boolean>;
    moveToken(gameId: Principal, tokenIndex: bigint, rollValue: bigint): Promise<GameSession>;
    registerBot(name: string, difficulty: BotDifficulty): Promise<Principal>;
    resetDemoCredits(): Promise<number>;
    rollDice(gameId: Principal): Promise<{
        valid: boolean;
        value: bigint;
        seedHash: string;
        entropy: string;
    }>;
    saveCallerUserProfile(name: string, color: string, avatarUrl: string, bio: string): Promise<void>;
    sendSpectatorReaction(gameId: Principal, emoji: string): Promise<boolean>;
    updatePlayer(name: string, color: string): Promise<void>;
    upgradeToPremium(): Promise<boolean>;
    withdraw(amount: number): Promise<boolean>;
}
