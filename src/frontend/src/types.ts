// Shared frontend types for LudoVerse ICP
// Re-export backend types for convenience
export type {
  UserProfile,
  GameSession,
  GameMode,
  GameStatus,
  RankedStatus,
  RoomType,
  BotDifficulty,
  BotConfig,
  Wallet,
  Transaction,
  Variant_withdraw_betLock_betRefund_deposit_betWin,
  OfficialWallet,
  MatchmakingRoom,
  PlayerState,
  TokenPosition,
  TokenSoul,
  DiceRoll,
  MoveProbability,
  BoardState,
  SpectatorReaction,
  FeaturedGame,
  SystemStats,
} from "./backend";

// View routing
export type View =
  | "dashboard"
  | "lobby"
  | "game"
  | "wallet"
  | "profile"
  | "about"
  | "guide"
  | "spectator";

// Player avatar colors
export const PLAYER_COLORS = [
  { name: "Neon Purple", value: "#a855f7" },
  { name: "Cyber Pink", value: "#ec4899" },
  { name: "Electric Blue", value: "#3b82f6" },
  { name: "Toxic Green", value: "#22c55e" },
  { name: "Solar Orange", value: "#f97316" },
  { name: "Plasma Red", value: "#ef4444" },
] as const;

// Official wallets (displayed when backend is unavailable)
export const OFFICIAL_WALLETS = [
  {
    address: "06c47d7b5d8e0abe4847ccb5bb15b393d16e57d814a4f976349f4e27552e8c03",
    walletLabel: "LudoVerse ICP Official Wallet 1",
  },
  {
    address: "6d5274751496adead1cc2babdae66afaa832ca3dec917573f43c3d2359fbb4c3",
    walletLabel: "LudoVerse ICP Official Wallet 2",
  },
] as const;

// Game mode metadata
export interface GameModeInfo {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  minPlayers: number;
  maxPlayers: number;
  isDemo?: boolean;
}

export const GAME_MODE_INFO: Record<string, GameModeInfo> = {
  classic: {
    id: "classic",
    name: "Classic Mode",
    description: "Traditional Ludo rules. 2–4 players. Pure skill and luck.",
    color: "#a855f7",
    icon: "🎲",
    minPlayers: 2,
    maxPlayers: 4,
  },
  quick: {
    id: "quick",
    name: "Quick Mode",
    description: "Shortened paths, faster dice, time-limited turns for mobile.",
    color: "#ec4899",
    icon: "⚡",
    minPlayers: 2,
    maxPlayers: 4,
  },
  master: {
    id: "master",
    name: "Master Mode",
    description: "Skill-heavy with dice choice options and advanced mechanics.",
    color: "#f0c040",
    icon: "👑",
    minPlayers: 2,
    maxPlayers: 4,
  },
  magic: {
    id: "magic",
    name: "Magic Mode",
    description: "Special power-ups and magical effects change the game.",
    color: "#38bdf8",
    icon: "✨",
    minPlayers: 2,
    maxPlayers: 4,
  },
  demo: {
    id: "demo",
    name: "Demo Mode",
    description: "Practice with virtual credits. No real ICP required.",
    color: "#22d3ee",
    icon: "🎮",
    minPlayers: 1,
    maxPlayers: 4,
    isDemo: true,
  },
  tournament: {
    id: "tournament",
    name: "Tournament",
    description: "Competitive bracket play for the top prize pools.",
    color: "#f97316",
    icon: "🏆",
    minPlayers: 4,
    maxPlayers: 4,
  },
  team: {
    id: "team",
    name: "Team 2v2",
    description: "2 vs 2 team-based Ludo with coordinated strategy.",
    color: "#10b981",
    icon: "🤝",
    minPlayers: 4,
    maxPlayers: 4,
  },
};

// 5 World-First Feature definitions
export interface WorldFirstFeature {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  gradient: string;
  glowColor: string;
  icon: string;
}

export const WORLD_FIRST_FEATURES: WorldFirstFeature[] = [
  {
    id: "quantum-dice",
    title: "Quantum Dice",
    subtitle: "World First #1",
    description:
      "Provably fair blockchain dice using time-entropy seeding. Every roll is verifiable on-chain with a cryptographic hash anyone can audit.",
    gradient: "from-purple-500/20 via-cyan-500/20 to-purple-500/20",
    glowColor: "shadow-glow-purple",
    icon: "⚛️",
  },
  {
    id: "token-soul",
    title: "Token Soul System",
    subtitle: "World First #2",
    description:
      "Each of your 4 tokens gains XP, levels up, and carries stats across all games. Your tokens evolve permanently — no one has done this in Ludo before.",
    gradient: "from-pink-500/20 via-purple-500/20 to-pink-500/20",
    glowColor: "shadow-glow-pink",
    icon: "👻",
  },
  {
    id: "living-board",
    title: "Living Board",
    subtitle: "World First #3",
    description:
      "The board changes color, glow, and intensity based on live gameplay. Heated battles turn the board pink-gold; streaks electrify it cyan-purple.",
    gradient: "from-cyan-500/20 via-blue-500/20 to-cyan-500/20",
    glowColor: "shadow-glow-cyan",
    icon: "🔮",
  },
  {
    id: "ai-oracle",
    title: "AI Move Oracle",
    subtitle: "World First #4",
    description:
      "Real-time AI calculates move probabilities for each token: safe score, capture chance, and recommended optimal plays. Strategy meets machine intelligence.",
    gradient: "from-yellow-500/20 via-orange-500/20 to-yellow-500/20",
    glowColor: "shadow-glow-gold",
    icon: "🧠",
  },
  {
    id: "spectator-reactions",
    title: "Live Spectator Arena",
    subtitle: "World First #5",
    description:
      "Watch any live game, react with emoji in real-time, cheer for players. Games become live events — spectators see every move as it happens.",
    gradient: "from-green-500/20 via-emerald-500/20 to-green-500/20",
    glowColor: "shadow-glow-green",
    icon: "🎭",
  },
];
