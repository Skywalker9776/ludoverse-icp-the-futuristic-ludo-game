import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Edit2,
  Link2,
  Save,
  Star,
  TrendingDown,
  TrendingUp,
  Trophy,
  User,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useGenerateReferralLink,
  useGetCallerUserProfile,
  useGetTokenSouls,
  useSaveCallerUserProfile,
} from "../hooks/useQueries";
import { PLAYER_COLORS } from "../types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface ProfilePageProps {
  onBack: () => void;
}

const TOKEN_NAMES = [
  "🔴 Red Soul",
  "🟢 Green Soul",
  "🟡 Gold Soul",
  "🔵 Blue Soul",
];
const LEVEL_COLORS = ["#f87171", "#4ade80", "#facc15", "#60a5fa"];

function XPBar({ xp, level }: { xp: bigint; level: bigint }) {
  const xpNum = Number(xp);
  const lvl = Number(level);
  const xpForNextLevel = (lvl + 1) * 100;
  const pct = Math.min((xpNum / xpForNextLevel) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">XP: {xpNum}</span>
        <span className="text-muted-foreground">Next: {xpForNextLevel}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #a855f7, #22d3ee)",
          }}
        />
      </div>
    </div>
  );
}

export default function ProfilePage({ onBack }: ProfilePageProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: tokenSouls } = useGetTokenSouls();
  const saveProfile = useSaveCallerUserProfile();
  const generateReferral = useGenerateReferralLink();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userProfile?.name ?? "");
  const [editColor, setEditColor] = useState(userProfile?.color ?? "#a855f7");
  const [referralLink, setReferralLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const winRate =
    userProfile && userProfile.gamesPlayed > 0
      ? ((userProfile.wins / userProfile.gamesPlayed) * 100).toFixed(1)
      : "0.0";

  const handleEdit = () => {
    setEditName(userProfile?.name ?? "");
    setEditColor(userProfile?.color ?? "#a855f7");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    if (!userProfile) return;
    try {
      await saveProfile.mutateAsync({
        name: editName.trim(),
        color: editColor,
        avatarUrl: userProfile.avatarUrl,
        bio: userProfile.bio,
      });
      toast.success("Profile updated!");
      setIsEditing(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update profile";
      toast.error(msg);
    }
  };

  const handleGenerateReferral = async () => {
    try {
      const link = await generateReferral.mutateAsync();
      setReferralLink(link);
    } catch {
      toast.error("Could not generate referral link");
    }
  };

  const copyReferral = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const displayColor = isEditing
    ? editColor
    : (userProfile?.color ?? "#a855f7");
  const displayName = isEditing ? editName : (userProfile?.name ?? "Player");
  const playerInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="space-y-6" data-ocid="profile.page">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2 text-muted-foreground hover:text-foreground"
          data-ocid="profile.back_button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h2
            className="text-3xl font-bold"
            style={{
              background: "linear-gradient(90deg, #a855f7, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Player Profile
          </h2>
          <p className="text-sm text-muted-foreground">
            Your identity in the LudoVerse
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card
            className="relative overflow-hidden border-purple-500/30"
            style={{
              background:
                "linear-gradient(135deg, rgba(168,85,247,0.10), rgba(236,72,153,0.06))",
            }}
            data-ocid="profile.identity.card"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-400" />
                  Identity
                </span>
                {!isEditing ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleEdit}
                    className="text-muted-foreground hover:text-foreground"
                    data-ocid="profile.edit.button"
                    aria-label="Edit profile"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                ) : (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCancel}
                      className="text-muted-foreground"
                      data-ocid="profile.cancel.button"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSave}
                      disabled={saveProfile.isPending}
                      className="text-emerald-400"
                      data-ocid="profile.save.button"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold transition-all duration-300"
                  style={{
                    backgroundColor: `${displayColor}25`,
                    border: `3px solid ${displayColor}`,
                    boxShadow: `0 0 25px ${displayColor}60, 0 0 50px ${displayColor}30`,
                  }}
                >
                  {playerInitial}
                </div>
                {userProfile?.isPremium && (
                  <Badge className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 gap-1.5">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    CEO PREMIUM
                  </Badge>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="edit-name"
                      className="text-xs uppercase tracking-widest text-muted-foreground"
                    >
                      Display Name
                    </Label>
                    <Input
                      id="edit-name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      maxLength={20}
                      className="bg-white/5 border-white/10"
                      data-ocid="profile.name.input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                      Player Color
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {PLAYER_COLORS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setEditColor(c.value)}
                          className="p-2 rounded-lg border-2 transition-all hover:scale-105"
                          style={{
                            backgroundColor: `${c.value}20`,
                            borderColor:
                              editColor === c.value
                                ? c.value
                                : "rgba(255,255,255,0.1)",
                            boxShadow:
                              editColor === c.value
                                ? `0 0 12px ${c.value}60`
                                : "none",
                          }}
                          aria-label={c.name}
                          data-ocid={`profile.color.button.${c.name.toLowerCase().replace(/ /g, "_")}`}
                        >
                          <div
                            className="w-5 h-5 rounded-full mx-auto"
                            style={{ backgroundColor: c.value }}
                          />
                          <p className="text-[9px] text-center mt-1 text-muted-foreground">
                            {c.name}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">
                      Name
                    </p>
                    <p className="text-xl font-bold mt-0.5">
                      {userProfile?.name ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">
                      Color
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div
                        className="w-5 h-5 rounded-full border-2 border-white/20"
                        style={{ backgroundColor: userProfile?.color }}
                      />
                      <p className="text-sm">
                        {PLAYER_COLORS.find(
                          (c) => c.value === userProfile?.color,
                        )?.name ?? "Custom"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">
                      ICP Balance
                    </p>
                    <p className="text-xl font-bold text-yellow-400 mt-0.5">
                      {(userProfile?.icpBalance ?? 0).toFixed(2)} ICP
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">
                      Demo Credits
                    </p>
                    <p className="text-lg font-semibold text-emerald-400 mt-0.5">
                      {(userProfile?.demoCredits ?? 0).toFixed(0)} DC
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card
            className="border-cyan-500/20 bg-card"
            data-ocid="profile.referral.card"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Link2 className="w-4 h-4 text-cyan-400" />
                Referral Link
              </CardTitle>
              <CardDescription className="text-xs">
                Invite friends and earn bonus ICP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {referralLink ? (
                <div className="space-y-2">
                  <code className="block text-xs font-mono bg-black/30 p-2 rounded-lg break-all text-cyan-300">
                    {referralLink}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                    onClick={copyReferral}
                    data-ocid="profile.copy_referral.button"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 mr-1" />
                    )}
                    {copied ? "Copied!" : "Copy Link"}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                  onClick={handleGenerateReferral}
                  disabled={generateReferral.isPending}
                  data-ocid="profile.generate_referral.button"
                >
                  {generateReferral.isPending
                    ? "Generating..."
                    : "Generate Link"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Total Games",
                value: userProfile?.gamesPlayed ?? 0,
                icon: <Trophy className="w-4 h-4" />,
                color: "#a855f7",
              },
              {
                label: "Win Rate",
                value: `${winRate}%`,
                icon: <TrendingUp className="w-4 h-4" />,
                color: "#22c55e",
              },
              {
                label: "Wins",
                value: userProfile?.wins ?? 0,
                icon: <TrendingUp className="w-4 h-4" />,
                color: "#22d3ee",
              },
              {
                label: "Losses",
                value: userProfile?.losses ?? 0,
                icon: <TrendingDown className="w-4 h-4" />,
                color: "#ef4444",
              },
            ].map((stat) => (
              <Card
                key={stat.label}
                className="border-border text-center"
                style={{
                  background: `${stat.color}0d`,
                  borderColor: `${stat.color}30`,
                }}
                data-ocid={`profile.stat.${stat.label.toLowerCase().replace(/ /g, "_")}`}
              >
                <CardContent className="pt-4 pb-3">
                  <div
                    className="flex justify-center mb-1"
                    style={{ color: stat.color }}
                  >
                    {stat.icon}
                  </div>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card
            className="border-border bg-card"
            data-ocid="profile.stats.card"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Performance Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  {
                    label: "Draws",
                    value: String(userProfile?.draws ?? 0),
                    color: "#f0c040",
                  },
                  {
                    label: "Total ICP Won",
                    value: `${(userProfile?.icpBalance ?? 0).toFixed(2)} ICP`,
                    color: "#22d3ee",
                  },
                  {
                    label: "Member Since",
                    value: userProfile?.createdAt
                      ? new Date(
                          Number(userProfile.createdAt) / 1_000_000,
                        ).toLocaleDateString()
                      : "—",
                    color: "#a855f7",
                  },
                  {
                    label: "Last Active",
                    value: userProfile?.lastActive
                      ? new Date(
                          Number(userProfile.lastActive) / 1_000_000,
                        ).toLocaleDateString()
                      : "—",
                    color: "#ec4899",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-border"
                  >
                    <span className="text-sm text-muted-foreground">
                      {item.label}
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: item.color }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-purple-500/30"
            style={{
              background:
                "linear-gradient(135deg, rgba(168,85,247,0.06), rgba(236,72,153,0.04))",
            }}
            data-ocid="profile.token_souls.card"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-lg">👻</span>
                Token Soul System
                <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px]">
                  WORLD FIRST
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Your 4 tokens accumulate XP, level up, and carry stats across
                all games forever
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {TOKEN_NAMES.map((name, i) => {
                  const soul = tokenSouls?.[i];
                  const level = soul ? Number(soul.level) : 1;
                  const xp = soul ? soul.xp : 0n;
                  const captures = soul ? Number(soul.captureCount) : 0;
                  return (
                    <div
                      key={name}
                      className="rounded-xl border p-3 space-y-2"
                      style={{
                        borderColor: `${LEVEL_COLORS[i]}30`,
                        background: `${LEVEL_COLORS[i]}0a`,
                      }}
                      data-ocid={`profile.token_soul.item.${i + 1}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{name}</span>
                        <Badge
                          className="text-[10px] px-1.5 py-0 font-bold"
                          style={{
                            background: `${LEVEL_COLORS[i]}25`,
                            color: LEVEL_COLORS[i],
                            border: `1px solid ${LEVEL_COLORS[i]}50`,
                          }}
                        >
                          Lv.{level}
                        </Badge>
                      </div>
                      <XPBar xp={xp} level={BigInt(level)} />
                      <div className="flex gap-3 text-[10px] text-muted-foreground">
                        <span>⚔️ {captures} captures</span>
                        <span>💫 {Number(xp)} XP total</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
