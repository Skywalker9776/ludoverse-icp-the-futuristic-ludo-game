import { Principal } from "@icp-sdk/core/principal";
import { ArrowLeft, Eye, Radio, Trophy, Users, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { GameMode } from "../backend";
import {
  useGetFeaturedGames,
  useGetSpectatorCount,
  useGetSpectatorReactions,
  useJoinAsSpectator,
  useLeaveSpectator,
  useSendSpectatorReaction,
} from "../hooks/useQueries";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";

interface SpectatorViewProps {
  gameId: string;
  onBack: () => void;
  onWatchGame?: (gameId: string) => void;
}

const QUICK_REACTIONS = [
  { emoji: "🔥", label: "Fire" },
  { emoji: "⚡", label: "Electric" },
  { emoji: "🎲", label: "Dice" },
  { emoji: "👑", label: "Crown" },
  { emoji: "😱", label: "Shocked" },
  { emoji: "🚀", label: "Rocket" },
];

const MODE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; emoji: string }
> = {
  classic: {
    label: "Classic",
    color: "text-[#f0c040]",
    bg: "bg-[#f0c040]/10",
    border: "border-[#f0c040]/40",
    emoji: "🎲",
  },
  quick: {
    label: "Quick",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/40",
    emoji: "⚡",
  },
  master: {
    label: "Master",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/40",
    emoji: "👑",
  },
  magic: {
    label: "Magic",
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    border: "border-pink-400/40",
    emoji: "✨",
  },
};

function ModePill({ mode }: { mode: GameMode }) {
  const cfg = MODE_CONFIG[mode as string] ?? {
    label: mode,
    color: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
    emoji: "🎮",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${cfg.border} ${cfg.bg} ${cfg.color}`}
    >
      {cfg.emoji} {cfg.label}
    </span>
  );
}

interface FloatingReaction {
  id: number;
  emoji: string;
  x: number;
}

export default function SpectatorView({
  gameId,
  onBack,
  onWatchGame,
}: SpectatorViewProps) {
  const gamePrincipal = useRef<Principal | null>(null);
  try {
    gamePrincipal.current = Principal.fromText(gameId);
  } catch {
    gamePrincipal.current = null;
  }

  const joinSpectator = useJoinAsSpectator();
  const leaveSpectator = useLeaveSpectator();
  const sendReaction = useSendSpectatorReaction();
  const gp = gamePrincipal.current;
  const { data: spectatorCount } = useGetSpectatorCount(gp);
  const { data: reactions } = useGetSpectatorReactions(gp);
  const { data: featuredGames } = useGetFeaturedGames();

  const [hasJoined, setHasJoined] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<
    FloatingReaction[]
  >([]);
  const [reactionFeed, setReactionFeed] = useState<
    { emoji: string; ts: number }[]
  >([]);
  const nextId = useRef(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const joinMutate = joinSpectator.mutateAsync;
  const leaveMutate = leaveSpectator.mutate;

  // Join as spectator on mount
  useEffect(() => {
    const principal = gamePrincipal.current;
    if (!principal) return;
    joinMutate(principal).then(() => setHasJoined(true));
    return () => {
      leaveMutate(principal);
    };
  }, [joinMutate, leaveMutate]);

  // Sync incoming reactions to feed + floating
  const prevReactionsLen = useRef(0);
  useEffect(() => {
    if (!reactions) return;
    const newOnes = reactions.slice(prevReactionsLen.current);
    prevReactionsLen.current = reactions.length;
    if (newOnes.length === 0) return;

    for (const r of newOnes) {
      const id = nextId.current++;
      const x = 10 + Math.random() * 80;
      setFloatingReactions((prev) => [...prev, { id, emoji: r.emoji, x }]);
      setReactionFeed((prev) =>
        [{ emoji: r.emoji, ts: Date.now() }, ...prev].slice(0, 10),
      );
      // Remove floating after animation
      setTimeout(() => {
        setFloatingReactions((prev) => prev.filter((fr) => fr.id !== id));
      }, 1600);
    }
  }, [reactions]);

  const handleSendReaction = async (emoji: string) => {
    if (!gamePrincipal) return;

    // Immediately show locally
    const id = nextId.current++;
    const x = 10 + Math.random() * 80;
    setFloatingReactions((prev) => [...prev, { id, emoji, x }]);
    setReactionFeed((prev) =>
      [{ emoji, ts: Date.now() }, ...prev].slice(0, 10),
    );
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((fr) => fr.id !== id));
    }, 1600);

    try {
      await sendReaction.mutateAsync({ gameId: gamePrincipal.current!, emoji });
    } catch {
      // Silently ignore — reaction was shown locally already
    }
  };

  const handleBack = () => {
    if (gamePrincipal.current) leaveSpectator.mutate(gamePrincipal.current);
    onBack();
  };

  const topGames = [...(featuredGames ?? [])]
    .sort((a, b) => Number(b.spectatorCount) - Number(a.spectatorCount))
    .slice(0, 5);

  const spectatorNum = Number(spectatorCount ?? 0);

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      data-ocid="spectator.page"
    >
      {/* Top bar */}
      <div
        className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-xl"
        style={{
          boxShadow:
            "0 0 30px rgba(168,85,247,0.15), 0 1px 0 rgba(168,85,247,0.2)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground gap-2"
            data-ocid="spectator.back_button"
          >
            <ArrowLeft className="w-4 h-4" />
            Leave
          </Button>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-red-400">LIVE</span>
            </div>
            {/* Spectator count */}
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30"
              data-ocid="spectator.count_display"
            >
              <Users className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold text-primary">
                {spectatorNum.toLocaleString()} watching
              </span>
            </div>
          </div>

          <Badge
            variant="outline"
            className="border-primary/40 text-primary font-mono text-xs"
          >
            👁 Spectating
          </Badge>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 py-6 gap-6">
        {/* Game board area */}
        <div className="flex-1 space-y-4">
          {/* Board viewport */}
          <div
            ref={boardRef}
            className="relative rounded-2xl overflow-hidden border border-primary/20 bg-card aspect-square max-w-xl mx-auto"
            style={{
              boxShadow:
                "0 0 60px rgba(168,85,247,0.2), inset 0 0 40px rgba(168,85,247,0.08)",
            }}
            data-ocid="spectator.board_view"
          >
            {/* Board background */}
            <div className="absolute inset-0 board-normal" />

            {/* Spectator overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-3 p-6">
                {!hasJoined ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto animate-pulse">
                      <Eye className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-foreground font-semibold">
                      Connecting to live game…
                    </p>
                  </>
                ) : (
                  <>
                    {/* Ludo board visual */}
                    <div className="relative w-64 h-64 mx-auto">
                      {/* Board grid */}
                      <div
                        className="w-full h-full rounded-xl border-2 border-primary/30"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(34,211,238,0.1) 50%, rgba(236,72,153,0.15) 100%)",
                        }}
                      >
                        {/* Corner zones */}
                        <div className="absolute top-1 left-1 w-[42%] h-[42%] rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                          <span className="text-2xl">🔴</span>
                        </div>
                        <div className="absolute top-1 right-1 w-[42%] h-[42%] rounded-lg bg-[#22c55e]/20 border border-[#22c55e]/30 flex items-center justify-center">
                          <span className="text-2xl">🟢</span>
                        </div>
                        <div className="absolute bottom-1 left-1 w-[42%] h-[42%] rounded-lg bg-[#f0c040]/20 border border-[#f0c040]/30 flex items-center justify-center">
                          <span className="text-2xl">🟡</span>
                        </div>
                        <div className="absolute bottom-1 right-1 w-[42%] h-[42%] rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                          <span className="text-2xl">🔵</span>
                        </div>
                        {/* Center star */}
                        <div className="absolute inset-[35%] rounded-lg bg-gradient-to-br from-primary/30 to-pink-500/30 border border-primary/40 flex items-center justify-center">
                          <span className="text-xl">⭐</span>
                        </div>
                      </div>

                      {/* Animated oracle overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        {(["tl", "tr", "bl", "br"] as const).map((pos, i) => (
                          <div
                            key={pos}
                            className="absolute w-3 h-3 rounded-full border-2 border-cyan-400/60 bg-cyan-400/20 animate-pulse"
                            style={{
                              top: `${20 + i * 18}%`,
                              left: `${15 + i * 20}%`,
                              animationDelay: `${i * 0.4}s`,
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground flex items-center justify-center gap-2">
                        <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                        Live Game in Progress
                      </p>
                      <p className="text-xs text-muted-foreground">
                        AI Oracle overlays active · All moves visible
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Floating emoji reactions */}
            {floatingReactions.map((fr) => (
              <div
                key={fr.id}
                className="absolute bottom-16 pointer-events-none select-none animate-emoji-float text-2xl"
                style={
                  {
                    left: `${fr.x}%`,
                    "--tx": `${(Math.random() - 0.5) * 40}px`,
                  } as React.CSSProperties
                }
              >
                {fr.emoji}
              </div>
            ))}

            {/* Spectator watermark */}
            <div className="absolute top-3 left-3">
              <Badge
                variant="outline"
                className="text-[10px] border-primary/30 text-primary/60 bg-card/50"
              >
                <Eye className="w-2.5 h-2.5 mr-1" />
                SPECTATOR VIEW
              </Badge>
            </div>
          </div>

          {/* Reaction panel */}
          <Card
            className="border-primary/20 bg-card"
            style={{ boxShadow: "0 0 20px rgba(168,85,247,0.1)" }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  React Live
                </span>
                <span className="text-xs text-muted-foreground">
                  Reactions appear on board
                </span>
              </div>
              <div className="flex gap-2 justify-center flex-wrap">
                {QUICK_REACTIONS.map(({ emoji, label }) => (
                  <button
                    type="button"
                    key={emoji}
                    aria-label={label}
                    onClick={() => handleSendReaction(emoji)}
                    data-ocid={`spectator.reaction_${label.toLowerCase()}`}
                    className="w-12 h-12 rounded-xl bg-muted hover:bg-primary/20 border border-border hover:border-primary/40 transition-all text-2xl flex items-center justify-center hover:scale-110 active:scale-95"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Recent reactions feed */}
              {reactionFeed.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-[10px] text-muted-foreground mb-2">
                    Recent reactions
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {reactionFeed.map((r) => (
                      <span key={r.ts} className="text-lg animate-pulse">
                        {r.emoji}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Featured Games + Reaction Feed */}
        <div className="w-full lg:w-80 space-y-4 flex-shrink-0">
          {/* Featured Games */}
          <Card
            className="border-red-500/20 bg-card"
            data-ocid="spectator.featured_panel"
          >
            <CardHeader className="pb-3 bg-gradient-to-r from-red-500/10 to-transparent rounded-t-xl">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-400 font-black">LIVE</span>
                <span className="text-foreground">— Top Games</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {topGames.length === 0 ? (
                <div
                  className="py-8 text-center"
                  data-ocid="spectator.featured_empty_state"
                >
                  <Zap className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    No featured games yet
                  </p>
                </div>
              ) : (
                topGames.map((game, idx) => (
                  <div
                    key={game.gameId.toString()}
                    data-ocid={`spectator.featured_item.${idx + 1}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all border border-border hover:border-primary/20 group"
                  >
                    {/* Rank */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0 ${
                        idx === 0
                          ? "bg-[#f0c040]/20 text-[#f0c040]"
                          : idx === 1
                            ? "bg-muted-foreground/20 text-muted-foreground"
                            : idx === 2
                              ? "bg-orange-500/20 text-orange-400"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {idx === 0
                        ? "🥇"
                        : idx === 1
                          ? "🥈"
                          : idx === 2
                            ? "🥉"
                            : idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <ModePill mode={game.mode} />
                        {/* Pulsing live dot */}
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Trophy className="w-3 h-3 text-[#f0c040]" />
                          {game.betAmount} ICP
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Users className="w-3 h-3" />
                          {Number(game.spectatorCount).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {onWatchGame && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onWatchGame(game.gameId.toString())}
                        className="border-primary/30 text-primary hover:bg-primary/10 text-xs px-2 py-1 h-auto flex-shrink-0"
                        data-ocid={`spectator.watch_button.${idx + 1}`}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Watch
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Live Reaction Feed */}
          <Card
            className="border-primary/20 bg-card"
            data-ocid="spectator.reaction_feed"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Live Crowd Reactions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <ScrollArea className="h-48">
                {reactionFeed.length === 0 ? (
                  <div
                    className="py-6 text-center"
                    data-ocid="spectator.reactions_empty_state"
                  >
                    <p className="text-xs text-muted-foreground">
                      Be first to react! 👇
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {reactionFeed.map((r, i) => (
                      <div
                        key={r.ts}
                        data-ocid={`spectator.reaction_item.${i + 1}`}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 text-xs"
                      >
                        <span className="text-lg">{r.emoji}</span>
                        <span className="text-muted-foreground">
                          Spectator reacted
                        </span>
                        <span className="ml-auto text-muted-foreground/50 text-[10px]">
                          just now
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Stats card */}
          <Card className="border-border bg-card">
            <CardContent className="p-3 grid grid-cols-2 gap-3">
              <div className="text-center p-2 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Watching</p>
                <p className="text-lg font-black text-primary">
                  {spectatorNum.toLocaleString()}
                </p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Reactions</p>
                <p className="text-lg font-black text-pink-400">
                  {(reactions?.length ?? 0).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
