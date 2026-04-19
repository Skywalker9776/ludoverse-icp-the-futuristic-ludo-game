import { Principal } from "@icp-sdk/core/principal";
import {
  ArrowLeft,
  Bot,
  Clock,
  Copy,
  Crown,
  Eye,
  Globe,
  Loader2,
  Lock,
  LogIn,
  Plus,
  Search,
  Sparkles,
  Star,
  Trophy,
  Users,
  Wand2,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RoomType } from "../backend";
import type { GameMode } from "../backend";
import {
  useCreateGame,
  useCreateRoom,
  useGetAvailableBots,
  useGetAvailableGames,
  useGetAvailableRooms,
  useGetCallerUserProfile,
  useGetDemoCredits,
  useGetPlayerWallet,
  useJoinRoom,
  useLeaveRoom,
} from "../hooks/useQueries";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

interface GameLobbyProps {
  onStartGame: (gameId: string, gameMode: GameMode) => void;
  onBack: () => void;
  onSpectate?: (gameId: string) => void;
}

type LobbyTab = "create" | "join" | "rooms";

interface ModeConfig {
  value: GameMode;
  label: string;
  description: string;
  details: string;
  icon: React.ComponentType<{ className?: string }>;
  emoji: string;
  borderColor: string;
  glowClass: string;
  bgColor: string;
  textColor: string;
  badge: string;
  ranked: boolean;
}

const GAME_MODES: ModeConfig[] = [
  {
    value: "classic" as GameMode,
    label: "Classic",
    description: "Traditional Ludo — pure skill and luck",
    details: "2–4 players · Standard rules · Ranked & Unranked",
    icon: Star,
    emoji: "🎲",
    borderColor: "border-[#f0c040]",
    glowClass: "shadow-glow-gold",
    bgColor: "bg-[#f0c040]/10",
    textColor: "text-[#f0c040]",
    badge: "CLASSIC",
    ranked: true,
  },
  {
    value: "quick" as GameMode,
    label: "Quick",
    description: "Shortened paths, faster dice, time-limited turns",
    details: "2–4 players · Mobile-friendly · Ranked & Unranked",
    icon: Zap,
    emoji: "⚡",
    borderColor: "border-cyan-400",
    glowClass: "shadow-glow-cyan",
    bgColor: "bg-cyan-400/10",
    textColor: "text-cyan-400",
    badge: "FAST",
    ranked: true,
  },
  {
    value: "master" as GameMode,
    label: "Master",
    description: "Skill-heavy with dice choice and advanced mechanics",
    details: "2–4 players · Dice choice · Ranked only",
    icon: Crown,
    emoji: "👑",
    borderColor: "border-primary",
    glowClass: "shadow-glow-purple",
    bgColor: "bg-primary/10",
    textColor: "text-primary",
    badge: "ELITE",
    ranked: true,
  },
  {
    value: "magic" as GameMode,
    label: "Magic",
    description: "Power-ups: freeze, bonus roll, and shield mechanics",
    details: "2–4 players · Special effects · Unranked",
    icon: Wand2,
    emoji: "✨",
    borderColor: "border-pink-400",
    glowClass: "shadow-glow-pink",
    bgColor: "bg-pink-400/10",
    textColor: "text-pink-400",
    badge: "MAGIC",
    ranked: false,
  },
];

const BET_PRESETS = [1, 10, 100, 1000, 10000, 100000, 1000000];

function ModeBadge({
  mode,
  className,
}: { mode: GameMode; className?: string }) {
  const cfg = GAME_MODES.find((m) => m.value === mode);
  if (!cfg)
    return (
      <Badge variant="secondary" className={className}>
        {mode}
      </Badge>
    );
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${cfg.borderColor} ${cfg.bgColor} ${cfg.textColor} ${className}`}
    >
      {cfg.emoji} {cfg.label}
    </span>
  );
}

export default function GameLobby({
  onStartGame,
  onBack,
  onSpectate,
}: GameLobbyProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: wallet } = useGetPlayerWallet();
  const { data: demoCredits } = useGetDemoCredits();
  const createGame = useCreateGame();
  const { data: availableGames, isLoading: gamesLoading } =
    useGetAvailableGames();
  useGetAvailableBots();
  const { data: availableRooms, isLoading: roomsLoading } =
    useGetAvailableRooms();
  const createRoom = useCreateRoom();
  const joinRoom = useJoinRoom();
  const leaveRoom = useLeaveRoom();

  const [activeTab, setActiveTab] = useState<LobbyTab>("create");
  const [gameType, setGameType] = useState<"live" | "demo">("demo");
  const [selectedMode, setSelectedMode] = useState<GameMode>(
    "classic" as GameMode,
  );
  const [betAmount, setBetAmount] = useState<number>(10);
  const [isRanked, setIsRanked] = useState(true);
  const [withAI, setWithAI] = useState(false);
  const [roomType, setRoomType] = useState<"public" | "private">("public");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [createdRoomId, setCreatedRoomId] = useState("");
  const [privateCode, setPrivateCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [modeFilter, setModeFilter] = useState<string>("all");

  const selectedCfg = GAME_MODES.find((m) => m.value === selectedMode);
  const prizePool = betAmount * 4;
  const platformFee = prizePool * 0.05;
  const netPool = prizePool - platformFee;

  const handleCreateGame = async () => {
    const isDemo = gameType === "demo";
    if (!isDemo && wallet && betAmount > wallet.balance) {
      toast.error("Insufficient ICP Balance", {
        description: `Need ${betAmount} ICP but have ${wallet.balance.toFixed(2)} ICP`,
      });
      return;
    }
    if (isDemo && demoCredits !== undefined && betAmount > demoCredits) {
      toast.error("Insufficient Demo Credits", {
        description: `Need ${betAmount} credits but have ${demoCredits.toFixed(0)} credits`,
      });
      return;
    }
    try {
      toast.info(`Creating ${isDemo ? "Demo" : "Live"} Game...`, {
        duration: 2000,
      });
      const gameId = await createGame.mutateAsync({
        gameMode: selectedMode,
        betAmount,
        isDemo,
      });
      toast.success("Game Created!", {
        description: `${selectedCfg?.label} game ready${withAI ? " · AI Opponent joined" : ""}`,
        duration: 3000,
      });
      setTimeout(() => onStartGame(gameId.toString(), selectedMode), 400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create game";
      toast.error("Game Creation Failed", { description: msg });
    }
  };

  const handleCreateRoom = async () => {
    try {
      toast.info("Creating room...");
      const roomId = await createRoom.mutateAsync({
        roomType:
          roomType === "public"
            ? ("isPublic" as RoomType)
            : ("privateRoom" as RoomType),
        gameMode: selectedMode,
        betAmount: gameType === "live" ? betAmount : 0,
        maxPlayers,
        isDemo: gameType === "demo",
      });
      const code = roomId.toString().slice(0, 8).toUpperCase();
      setCreatedRoomId(roomId.toString());
      setPrivateCode(code);
      toast.success(
        roomType === "private"
          ? `Private Room: ${code}`
          : "Public Room Created!",
        {
          duration: 5000,
        },
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create room";
      toast.error("Room Creation Failed", { description: msg });
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      await joinRoom.mutateAsync(Principal.fromText(roomId));
      toast.success("Joined Room!", {
        description: "Waiting for game to start...",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Room unavailable";
      toast.error("Failed to Join", { description: msg });
    }
  };

  const handleJoinPrivate = async () => {
    if (!privateCode.trim()) {
      toast.error("Enter a room code first");
      return;
    }
    const room = availableRooms?.find(
      (r) =>
        r.id.toString().slice(0, 8).toUpperCase() === privateCode.toUpperCase(),
    );
    if (!room) {
      toast.error("Room Not Found", {
        description: "Check the room code and try again",
      });
      return;
    }
    await handleJoinRoom(room.id.toString());
  };

  const handleLeaveRoom = async (roomId: string) => {
    try {
      await leaveRoom.mutateAsync(Principal.fromText(roomId));
      setCreatedRoomId("");
      setPrivateCode("");
      toast.success("Left room");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error leaving room";
      toast.error("Failed to Leave", { description: msg });
    }
  };

  const filteredGames = (availableGames || []).filter((g) => {
    const modeMatch = modeFilter === "all" || g.mode === modeFilter;
    const searchMatch =
      !searchQuery ||
      g.mode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.id.toString().includes(searchQuery);
    return modeMatch && searchMatch;
  });

  const publicRooms = (availableRooms || []).filter(
    (r) => r.roomType === RoomType.isPublic,
  );

  return (
    <div className="min-h-screen bg-background" data-ocid="lobby.page">
      {/* Hero header */}
      <div
        className="relative border-b border-border overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, oklch(0.20 0.15 290 / 0.6), transparent)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground gap-2"
            data-ocid="lobby.back_button"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Button>
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-pink-400 to-[#f0c040]">
              GAME LOBBY
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose your battleground
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`font-mono text-xs ${gameType === "demo" ? "border-cyan-400/50 text-cyan-400" : "border-[#f0c040]/50 text-[#f0c040]"}`}
            >
              {gameType === "demo"
                ? `${(demoCredits ?? 0).toFixed(0)} VC`
                : `${(wallet?.balance ?? 0).toFixed(2)} ICP`}
            </Badge>
            {userProfile?.isPremium && (
              <Badge className="bg-gradient-to-r from-[#f0c040] to-orange-500 text-black text-xs">
                <Crown className="w-3 h-3 mr-1" />
                CEO
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div
          className="flex gap-1 p-1 bg-card border border-border rounded-xl w-fit mb-8"
          role="tablist"
        >
          {(["create", "join", "rooms"] as LobbyTab[]).map((tab) => (
            <button
              type="button"
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              data-ocid={`lobby.${tab}_tab`}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground shadow-glow-purple"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "create" && "⚡ Create Game"}
              {tab === "join" && "🎮 Join Game"}
              {tab === "rooms" && "🏟️ Rooms"}
            </button>
          ))}
        </div>

        {/* ── CREATE GAME TAB ── */}
        {activeTab === "create" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
            <div className="lg:col-span-2 space-y-6">
              {/* Demo / Live Toggle */}
              <section>
                <Label className="text-foreground font-semibold mb-3 block">
                  Game Type
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {(["demo", "live"] as const).map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setGameType(type)}
                      data-ocid={`lobby.${type}_toggle`}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all group ${
                        gameType === type
                          ? type === "demo"
                            ? "border-cyan-400 bg-cyan-400/10 shadow-glow-cyan"
                            : "border-[#f0c040] bg-[#f0c040]/10 shadow-glow-gold"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                            type === "demo"
                              ? "bg-cyan-400/20"
                              : "bg-[#f0c040]/20"
                          }`}
                        >
                          {type === "demo" ? "🎮" : "💎"}
                        </div>
                        <div>
                          <p
                            className={`font-bold ${type === "demo" ? "text-cyan-400" : "text-[#f0c040]"}`}
                          >
                            {type === "demo" ? "DEMO MODE" : "LIVE MODE"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {type === "demo"
                              ? "Virtual credits — no real ICP"
                              : "Real ICP betting"}
                          </p>
                        </div>
                      </div>
                      {gameType === type && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-current animate-ping" />
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Game Mode Selection */}
              <section>
                <Label className="text-foreground font-semibold mb-3 block">
                  Game Mode
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {GAME_MODES.map((mode) => {
                    const isSelected = selectedMode === mode.value;
                    return (
                      <button
                        type="button"
                        key={mode.value}
                        onClick={() => setSelectedMode(mode.value)}
                        data-ocid={`lobby.mode_${mode.value}`}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? `${mode.borderColor} ${mode.bgColor} ${mode.glowClass}`
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${mode.bgColor}`}
                          >
                            {mode.emoji}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p
                                className={`font-bold text-sm ${isSelected ? mode.textColor : "text-foreground"}`}
                              >
                                {mode.label}
                              </p>
                              <span
                                className={`text-[9px] font-black px-1.5 py-0.5 rounded tracking-widest border ${mode.borderColor} ${mode.bgColor} ${mode.textColor}`}
                              >
                                {mode.badge}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {mode.description}
                            </p>
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground/60 mt-2">
                          {mode.details}
                        </p>
                        {isSelected && (
                          <div
                            className={`absolute top-2 right-2 w-2 h-2 rounded-full ${mode.textColor.replace("text-", "bg-")} animate-pulse`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Bet Amount */}
              <section>
                <Label className="text-foreground font-semibold mb-3 block">
                  Bet Amount{" "}
                  {gameType === "demo" ? "(Virtual ICP)" : "(Real ICP)"}
                </Label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-3">
                  {BET_PRESETS.map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setBetAmount(amt)}
                      data-ocid={`lobby.bet_${amt}`}
                      className={`py-2 px-1 rounded-lg border text-xs font-mono font-bold transition-all ${
                        betAmount === amt
                          ? "border-primary bg-primary/20 text-primary shadow-glow-purple"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {amt >= 1000000
                        ? "1M"
                        : amt >= 1000
                          ? `${amt / 1000}K`
                          : amt}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={betAmount}
                    onChange={(e) =>
                      setBetAmount(Math.max(1, Number(e.target.value)))
                    }
                    min={1}
                    max={1000000}
                    className="bg-card border-border font-mono"
                    data-ocid="lobby.bet_input"
                  />
                  <span className="text-muted-foreground text-sm whitespace-nowrap">
                    ICP
                  </span>
                </div>
              </section>

              {/* Options row */}
              <section className="space-y-3">
                {selectedCfg?.ranked && gameType === "live" && (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-[#f0c040]" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Ranked Match
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Affects your competitive rating
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={isRanked}
                      onCheckedChange={setIsRanked}
                      data-ocid="lobby.ranked_toggle"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-3">
                    <Bot className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        AI Opponent
                      </p>
                      <p className="text-xs text-muted-foreground">
                        LudoVerse AI plays automatically
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={withAI}
                    onCheckedChange={setWithAI}
                    data-ocid="lobby.ai_toggle"
                  />
                </div>
              </section>
            </div>

            {/* Right panel: Summary + Create */}
            <div className="space-y-4">
              <Card
                className="border-2 border-primary/40 bg-card overflow-hidden"
                style={{ boxShadow: "0 0 30px rgba(168,85,247,0.15)" }}
              >
                <CardHeader className="pb-3 bg-gradient-to-br from-primary/10 to-transparent">
                  <CardTitle className="text-base text-foreground">
                    Game Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Mode</span>
                    <ModeBadge mode={selectedMode} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Type</span>
                    <Badge
                      variant="outline"
                      className={
                        gameType === "demo"
                          ? "border-cyan-400 text-cyan-400"
                          : "border-[#f0c040] text-[#f0c040]"
                      }
                    >
                      {gameType === "demo" ? "DEMO" : "LIVE"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Entry Bet
                    </span>
                    <span className="text-sm font-mono font-bold text-foreground">
                      {betAmount.toLocaleString()} ICP
                    </span>
                  </div>
                  {gameType === "live" && (
                    <>
                      <div className="border-t border-border my-2" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Prize Pool (4p)
                        </span>
                        <span className="text-sm font-mono text-[#f0c040]">
                          {prizePool.toLocaleString()} ICP
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Platform Fee (5%)
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">
                          −{platformFee.toLocaleString()} ICP
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-semibold">
                          Net Winner Prize
                        </span>
                        <span className="text-base font-mono font-black text-[#f0c040]">
                          {netPool.toLocaleString()} ICP
                        </span>
                      </div>
                    </>
                  )}
                  {selectedCfg?.ranked && gameType === "live" && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Ranked
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {isRanked ? "Yes" : "No"}
                      </span>
                    </div>
                  )}
                  {withAI && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        AI Opponent
                      </span>
                      <span className="text-xs font-semibold text-primary">
                        LudoVerse AI
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button
                onClick={handleCreateGame}
                disabled={createGame.isPending}
                className="w-full py-6 text-base font-black tracking-wide bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 shadow-glow-purple"
                data-ocid="lobby.create_game_button"
              >
                {createGame.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    {gameType === "demo"
                      ? "Start Demo Game"
                      : "Create Live Game"}
                  </>
                )}
              </Button>

              {/* Balance display */}
              <Card className="bg-card border-border">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-cyan-400" /> Demo
                      Credits
                    </span>
                    <span className="font-mono font-semibold text-cyan-400">
                      {(demoCredits ?? 0).toFixed(0)} VC
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Trophy className="w-3 h-3 text-[#f0c040]" /> ICP Balance
                    </span>
                    <span className="font-mono font-semibold text-[#f0c040]">
                      {(wallet?.balance ?? 0).toFixed(4)} ICP
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ── JOIN GAME TAB ── */}
        {activeTab === "join" && (
          <div className="space-y-6 pb-12">
            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search games by mode or ID…"
                  className="pl-10 bg-card border-border"
                  data-ocid="lobby.search_input"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["all", ...GAME_MODES.map((m) => m.value)].map((f) => (
                  <button
                    type="button"
                    key={f}
                    onClick={() => setModeFilter(f)}
                    data-ocid={`lobby.filter_${f}`}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      modeFilter === f
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {f === "all"
                      ? "All Modes"
                      : `${GAME_MODES.find((m) => m.value === f)?.emoji ?? ""} ${GAME_MODES.find((m) => m.value === f)?.label ?? f}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Game list */}
            {gamesLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredGames.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16 gap-4"
                data-ocid="lobby.games_empty_state"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl">
                  🎲
                </div>
                <p className="text-foreground font-semibold">
                  No games available
                </p>
                <p className="text-muted-foreground text-sm">
                  Create a game to be the first one playing!
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("create")}
                  className="border-primary/50 text-primary"
                >
                  Create a Game
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredGames.map((game, idx) => {
                  const cfg = GAME_MODES.find((m) => m.value === game.mode);
                  const playerCount = game.players.length;
                  const isFull = playerCount >= 4;
                  return (
                    <Card
                      key={game.id.toString()}
                      data-ocid={`lobby.game_item.${idx + 1}`}
                      className={`border transition-all hover:scale-[1.01] ${
                        cfg
                          ? cfg.borderColor.replace("border-", "hover:border-")
                          : "hover:border-primary/50"
                      } border-border bg-card`}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <ModeBadge mode={game.mode} />
                          <Badge
                            variant={game.isDemo ? "secondary" : "outline"}
                            className={
                              game.isDemo
                                ? "text-cyan-400 border-cyan-400/30"
                                : "text-[#f0c040] border-[#f0c040]/30"
                            }
                          >
                            {game.isDemo ? "DEMO" : "LIVE"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-muted rounded-lg p-2">
                            <p className="text-xs text-muted-foreground">Bet</p>
                            <p className="text-sm font-mono font-bold text-foreground">
                              {game.betAmount}💎
                            </p>
                          </div>
                          <div className="bg-muted rounded-lg p-2">
                            <p className="text-xs text-muted-foreground">
                              Players
                            </p>
                            <p className="text-sm font-mono font-bold text-foreground">
                              {playerCount}/4
                            </p>
                          </div>
                          <div className="bg-muted rounded-lg p-2">
                            <p className="text-xs text-muted-foreground">
                              Status
                            </p>
                            <p
                              className={`text-xs font-bold ${game.status === "waiting" ? "text-cyan-400" : "text-primary"}`}
                            >
                              {game.status}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              onStartGame(game.id.toString(), game.mode)
                            }
                            disabled={isFull}
                            size="sm"
                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                            data-ocid={`lobby.join_button.${idx + 1}`}
                          >
                            <LogIn className="w-4 h-4 mr-1.5" />
                            {isFull ? "Full" : "Join"}
                          </Button>
                          {onSpectate && (
                            <Button
                              onClick={() => onSpectate(game.id.toString())}
                              size="sm"
                              variant="outline"
                              className="border-primary/40 text-primary hover:bg-primary/10"
                              data-ocid={`lobby.spectate_button.${idx + 1}`}
                            >
                              <Eye className="w-4 h-4 mr-1.5" />
                              Watch
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ROOMS TAB ── */}
        {activeTab === "rooms" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
            {/* Create Room */}
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-foreground">
                Create a Room
              </h2>
              {/* Public / Private */}
              <div className="grid grid-cols-2 gap-3">
                {(["public", "private"] as const).map((rt) => (
                  <button
                    type="button"
                    key={rt}
                    onClick={() => setRoomType(rt)}
                    data-ocid={`lobby.room_${rt}`}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      roomType === rt
                        ? rt === "public"
                          ? "border-cyan-400 bg-cyan-400/10 shadow-glow-cyan"
                          : "border-orange-400 bg-orange-400/10"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {rt === "public" ? (
                        <Globe className="w-6 h-6 text-cyan-400" />
                      ) : (
                        <Lock className="w-6 h-6 text-orange-400" />
                      )}
                      <div className="text-left">
                        <p
                          className={`font-bold text-sm ${rt === "public" ? "text-cyan-400" : "text-orange-400"}`}
                        >
                          {rt === "public" ? "Public" : "Private"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {rt === "public"
                            ? "Anyone can join"
                            : "Invite-only code"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Mode for room */}
              <div>
                <Label className="text-foreground text-sm font-semibold mb-2 block">
                  Game Mode
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {GAME_MODES.map((mode) => (
                    <button
                      type="button"
                      key={mode.value}
                      onClick={() => setSelectedMode(mode.value)}
                      data-ocid={`lobby.room_mode_${mode.value}`}
                      className={`p-3 rounded-lg border text-left transition-all flex items-center gap-2 ${
                        selectedMode === mode.value
                          ? `${mode.borderColor} ${mode.bgColor}`
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <span className="text-lg">{mode.emoji}</span>
                      <span
                        className={`text-xs font-semibold ${selectedMode === mode.value ? mode.textColor : "text-muted-foreground"}`}
                      >
                        {mode.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Players */}
              <div>
                <Label className="text-foreground text-sm font-semibold mb-2 block">
                  Max Players: {maxPlayers}
                </Label>
                <div className="flex gap-2">
                  {[2, 3, 4].map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setMaxPlayers(n)}
                      data-ocid={`lobby.max_players_${n}`}
                      className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-all ${
                        maxPlayers === n
                          ? "border-primary bg-primary/20 text-primary"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      <Users className="w-4 h-4 inline mr-1" />
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                <span className="text-sm text-muted-foreground">Game Type</span>
                <div className="flex gap-2">
                  {(["demo", "live"] as const).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setGameType(t)}
                      className={`px-3 py-1 rounded text-xs font-bold border transition-all ${
                        gameType === t
                          ? t === "demo"
                            ? "border-cyan-400 bg-cyan-400/20 text-cyan-400"
                            : "border-[#f0c040] bg-[#f0c040]/20 text-[#f0c040]"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleCreateRoom}
                disabled={createRoom.isPending}
                className="w-full py-5 font-black bg-gradient-to-r from-cyan-600 to-primary hover:opacity-90 shadow-glow-cyan"
                data-ocid="lobby.create_room_button"
              >
                {createRoom.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Plus className="w-5 h-5 mr-2" />
                )}
                Create {roomType === "public" ? "Public" : "Private"} Room
              </Button>

              {/* Room code display */}
              {createdRoomId && (
                <Card
                  className={`border-2 ${roomType === "private" ? "border-orange-400/60 bg-orange-400/5" : "border-cyan-400/60 bg-cyan-400/5"}`}
                >
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-2">
                      Your Room
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xl font-black text-foreground tracking-widest">
                        {privateCode}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(privateCode);
                            toast.success("Code copied!");
                          }}
                          className="border-orange-400/40"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleLeaveRoom(createdRoomId)}
                          data-ocid="lobby.leave_room_button"
                        >
                          Leave
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Join private room */}
              {roomType === "private" && !createdRoomId && (
                <div>
                  <Label className="text-foreground text-sm font-semibold mb-2 block">
                    Join Private Room
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={privateCode}
                      onChange={(e) =>
                        setPrivateCode(e.target.value.toUpperCase())
                      }
                      placeholder="Enter room code…"
                      maxLength={8}
                      className="font-mono uppercase bg-card border-border"
                      data-ocid="lobby.room_code_input"
                    />
                    <Button
                      onClick={handleJoinPrivate}
                      disabled={joinRoom.isPending || !privateCode.trim()}
                      className="bg-orange-500 hover:bg-orange-600"
                      data-ocid="lobby.join_code_button"
                    >
                      {joinRoom.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LogIn className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Public Rooms List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">
                  Available Rooms
                </h2>
                <Badge
                  variant="outline"
                  className="border-primary/40 text-primary text-xs"
                >
                  {publicRooms.length} online
                </Badge>
              </div>

              {roomsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : publicRooms.length === 0 ? (
                <div
                  className="flex flex-col items-center py-12 gap-3"
                  data-ocid="lobby.rooms_empty_state"
                >
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-2xl">
                    🏟️
                  </div>
                  <p className="text-foreground font-semibold">
                    No public rooms
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Create one to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {publicRooms.map((room, idx) => {
                    const cfg = GAME_MODES.find(
                      (m) => m.value === room.gameMode,
                    );
                    const isFull =
                      Number(room.playerCount) >= Number(room.maxPlayers);
                    return (
                      <Card
                        key={room.id.toString()}
                        data-ocid={`lobby.room_item.${idx + 1}`}
                        className="border-border bg-card hover:border-primary/40 transition-all"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <ModeBadge mode={room.gameMode} />
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={
                                  room.isDemo
                                    ? "text-cyan-400 border-cyan-400/30 text-xs"
                                    : "text-[#f0c040] border-[#f0c040]/30 text-xs"
                                }
                              >
                                {room.isDemo ? "DEMO" : "LIVE"}
                              </Badge>
                              {isFull && (
                                <Badge variant="secondary" className="text-xs">
                                  FULL
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {Number(room.playerCount)}/
                              {Number(room.maxPlayers)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {room.betAmount > 0
                                ? `${room.betAmount} ICP`
                                : "Free"}
                            </span>
                            {cfg && (
                              <span className={cfg.textColor}>{cfg.badge}</span>
                            )}
                          </div>
                          <Button
                            onClick={() => handleJoinRoom(room.id.toString())}
                            disabled={joinRoom.isPending || isFull}
                            size="sm"
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                            data-ocid={`lobby.room_join_button.${idx + 1}`}
                          >
                            {joinRoom.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                            ) : (
                              <LogIn className="w-4 h-4 mr-1.5" />
                            )}
                            {isFull ? "Room Full" : "Join Room"}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
