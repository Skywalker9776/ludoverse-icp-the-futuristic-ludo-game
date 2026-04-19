import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Player {
    principal: Principal;
    gamesPlayed: number;
    isPremium: boolean;
    name: string;
    createdAt: bigint;
    color: string;
    wins: number;
    losses: number;
    icpBalance: number;
    currentGame?: Principal;
    draws: number;
    lastActive: bigint;
}
export interface UserProfile {
    gamesPlayed: number;
    isPremium: boolean;
    name: string;
    createdAt: bigint;
    color: string;
    wins: number;
    losses: number;
    icpBalance: number;
    currentGame?: Principal;
    draws: number;
    lastActive: bigint;
}
export interface BotConfig {
    principal: Principal;
    balance: number;
    isPremium: boolean;
    difficulty: BotDifficulty;
}
export interface Wallet {
    id: Principal;
    balance: number;
    createdAt: bigint;
    lastActive: bigint;
}
export interface DiceRoll {
    seed: string;
    diceResult: bigint;
    rollNumber: bigint;
    timestamp: bigint;
    playerPrincipal: Principal;
}
export interface OfficialWallet {
    balance: number;
    address: string;
}
export interface MatchmakingRoom {
    id: Principal;
    status: GameStatus;
    creator: Principal;
    playerCount: bigint;
    isDemo: boolean;
    players: Array<Principal>;
    gameMode: GameMode;
    roomType: RoomType;
    maxPlayers: bigint;
}
export interface GameSession {
    id: Principal;
    status: GameStatus;
    betAmount: number;
    mode: GameMode;
    createdAt: bigint;
    winner?: Principal;
    isDemo: boolean;
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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    activatePremiumBot(botId: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    automaticUserInitialization(): Promise<{
        loginSuccess: boolean;
        message: string;
        wallet: Wallet;
        playerExists: boolean;
    }>;
    createGame(mode: GameMode, rankedStatus: RankedStatus, betAmount: number, isDemo: boolean): Promise<Principal>;
    createMatchmakingRoom(roomType: RoomType, gameMode: GameMode, maxPlayers: bigint, isDemo: boolean): Promise<Principal>;
    createUser(name: string, color: string): Promise<void>;
    deposit(amount: number): Promise<boolean>;
    getAllBots(): Promise<Array<BotConfig>>;
    getAllGames(): Promise<Array<GameSession>>;
    getAllPlayers(): Promise<Array<Player>>;
    getAllWallets(): Promise<Array<Wallet>>;
    getAvailableBots(): Promise<Array<BotConfig>>;
    getAvailableGames(): Promise<Array<GameSession>>;
    getAvailableRooms(): Promise<Array<MatchmakingRoom>>;
    getBalance(): Promise<number>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDiceHistory(gameId: Principal): Promise<Array<DiceRoll> | null>;
    getGame(gameId: Principal): Promise<GameSession | null>;
    getOfficialAccount(isFirst: boolean): Promise<string>;
    getOfficialWallets(): Promise<Array<OfficialWallet>>;
    getPlayer(principal: Principal): Promise<Player | null>;
    getSystemStats(): Promise<{
        totalPlayers: bigint;
        totalWallets: bigint;
        totalGames: bigint;
        totalBalance: number;
    }>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWallet(): Promise<Wallet | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isFirstTime(): Promise<boolean>;
    isPremium(): Promise<boolean>;
    joinGame(gameId: Principal, isDemo: boolean): Promise<boolean>;
    joinRoom(roomId: Principal): Promise<boolean>;
    leaveRoom(roomId: Principal): Promise<boolean>;
    registerBot(difficulty: BotDifficulty): Promise<Principal>;
    rollDice(gameId: Principal, player: Principal): Promise<{
        result: bigint;
        valid: boolean;
        seed: string;
    }>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updatePlayer(name: string, color: string): Promise<void>;
    upgradeToPremium(): Promise<boolean>;
    withdraw(amount: number): Promise<boolean>;
}
