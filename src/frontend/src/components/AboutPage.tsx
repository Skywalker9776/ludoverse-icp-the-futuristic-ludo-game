import {
  Brain,
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
  Shield,
  Sparkles,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useGetOfficialWallets } from "../hooks/useQueries";
import { OFFICIAL_WALLETS, WORLD_FIRST_FEATURES } from "../types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  "quantum-dice": <Sparkles className="w-7 h-7" />,
  "token-soul": <span className="text-3xl leading-none">👻</span>,
  "living-board": <span className="text-3xl leading-none">🔮</span>,
  "ai-oracle": <Brain className="w-7 h-7" />,
  "spectator-reactions": <Users className="w-7 h-7" />,
};

const TECH_STACK = [
  {
    label: "Blockchain",
    color: "#a855f7",
    items: [
      "Internet Computer Protocol (ICP)",
      "Motoko Smart Contracts",
      "Internet Identity Auth",
      "ICP Ledger Integration",
    ],
  },
  {
    label: "Frontend",
    color: "#22d3ee",
    items: [
      "React 19 + TypeScript",
      "Tailwind CSS Design System",
      "Canvas API Game Rendering",
      "Three.js 3D Visualization",
    ],
  },
  {
    label: "Features",
    color: "#ec4899",
    items: [
      "Real-time Multiplayer",
      "AI Move Oracle System",
      "Token Soul XP System",
      "Living Dynamic Board",
    ],
  },
  {
    label: "Security",
    color: "#4ade80",
    items: [
      "Decentralized Auth",
      "On-chain Verified Dice",
      "Transparent Canister Code",
      "Anti-collusion Logic",
    ],
  },
];

export default function AboutPage() {
  const { data: officialWalletsData } = useGetOfficialWallets();
  const [copied, setCopied] = useState<string | null>(null);

  const displayedWallets = officialWalletsData?.length
    ? officialWalletsData
    : OFFICIAL_WALLETS;

  const copyAddress = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("Wallet address copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto" data-ocid="about.page">
      {/* Hero */}
      <div
        className="text-center space-y-6 py-8"
        data-ocid="about.hero.section"
      >
        <div className="flex justify-center">
          <img
            src="/assets/generated/ludoverse-logo-transparent.dim_200x200.png"
            alt="LudoVerse ICP"
            className="w-28 h-28 drop-shadow-[0_0_40px_rgba(168,85,247,0.7)] animate-glow-pulse"
          />
        </div>
        <div className="space-y-3">
          <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-sm px-4 py-1 uppercase tracking-widest">
            World's Most Advanced Ludo Game
          </Badge>
          <h1
            className="text-5xl sm:text-6xl font-bold leading-tight"
            style={{
              background:
                "linear-gradient(135deg, #a855f7 0%, #ec4899 40%, #22d3ee 80%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            LudoVerse ICP
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The Future of Ludo — Built on the Internet Computer
          </p>
        </div>

        <Button
          size="lg"
          onClick={() =>
            window.open("https://ludoverse.io", "_blank", "noopener noreferrer")
          }
          className="gap-2 font-bold text-base px-8"
          style={{ background: "linear-gradient(90deg, #a855f7, #22d3ee)" }}
          data-ocid="about.website.link"
        >
          <Globe className="w-5 h-5" />
          Visit LudoVerse.io
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>

      {/* Description */}
      <Card
        className="border-purple-500/20 bg-card"
        data-ocid="about.description.card"
      >
        <CardContent className="pt-6 space-y-4 text-muted-foreground leading-relaxed">
          <p>
            <span className="text-foreground font-semibold">LudoVerse ICP</span>{" "}
            is not just a Ludo game — it is a paradigm shift in competitive
            board gaming. Built on the Internet Computer blockchain using Motoko
            smart contracts, every game outcome, dice roll, and ICP transaction
            is cryptographically recorded, provably fair, and fully transparent.
            This is the first Ludo game in history where your tokens have souls,
            the board breathes and evolves, and an AI oracle guides your every
            move.
          </p>
          <p>
            Players compete in real-time across Classic, Quick, Master, and
            Magic game modes, betting ICP coins from 1 to 1,000,000 per match.
            The revolutionary{" "}
            <span className="text-purple-300 font-medium">
              Token Soul System
            </span>{" "}
            means your four game tokens accumulate XP across every game you play
            — they level up, develop personalities, and grow stronger over time.
            No other Ludo game on Earth has done this.
          </p>
          <p>
            The <span className="text-cyan-300 font-medium">Living Board</span>{" "}
            reacts to the emotional state of a match — heating up in pink-gold
            as battles intensify, electrifying in cyan when streaks occur, and
            glowing gold during legendary moments. Combined with the{" "}
            <span className="text-pink-300 font-medium">
              Live Spectator Arena
            </span>{" "}
            where thousands can watch and react in real-time, LudoVerse ICP has
            transformed Ludo into a global live sport.
          </p>
        </CardContent>
      </Card>

      {/* 5 World-First Features */}
      <div data-ocid="about.features.section">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            5 World-First Features
          </h2>
          <p className="text-muted-foreground">
            Technology and design breakthroughs never seen in any Ludo game
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {WORLD_FIRST_FEATURES.map((feature, i) => (
            <Card
              key={feature.id}
              className="relative overflow-hidden border-border hover:border-primary/40 transition-all duration-300 group"
              style={{
                background: `linear-gradient(135deg, ${feature.gradient.includes("purple") ? "rgba(168,85,247,0.08)" : "rgba(34,211,238,0.06)"}, rgba(0,0,0,0.2))`,
              }}
              data-ocid={`about.feature.item.${i + 1}`}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ boxShadow: "inset 0 0 40px rgba(168,85,247,0.15)" }}
              />
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-2"
                    style={{
                      background: "rgba(168,85,247,0.15)",
                      border: "1px solid rgba(168,85,247,0.3)",
                    }}
                  >
                    <span style={{ color: "#a855f7" }}>
                      {FEATURE_ICONS[feature.id]}
                    </span>
                  </div>
                  <Badge className="bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 text-[10px] uppercase tracking-wider shrink-0">
                    #{i + 1} World First
                  </Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Official Wallets */}
      <Card
        className="border-yellow-500/30"
        style={{
          background:
            "linear-gradient(135deg, rgba(251,191,36,0.06), rgba(168,85,247,0.06))",
        }}
        data-ocid="about.official_wallets.card"
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Wallet className="w-5 h-5 text-yellow-400" />
            Official LudoVerse ICP Wallets
          </CardTitle>
          <CardDescription>
            Verified platform wallets — all platform fees are collected
            transparently and recorded on-chain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {displayedWallets.map((w, i) => (
            <div
              key={w.address}
              className="rounded-xl border border-yellow-500/20 p-4 flex items-center gap-3"
              style={{ background: "rgba(251,191,36,0.04)" }}
              data-ocid={`about.official_wallet.item.${i + 1}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-yellow-300">
                    {w.walletLabel}
                  </span>
                  <Badge className="text-[9px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-1.5 py-0">
                    OFFICIAL
                  </Badge>
                </div>
                <code className="text-[10px] font-mono text-muted-foreground break-all leading-relaxed">
                  {w.address}
                </code>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyAddress(w.address, `about-wallet-${i}`)}
                className="text-yellow-400 hover:bg-yellow-500/10 shrink-0"
                aria-label="Copy wallet address"
                data-ocid={`about.copy_wallet.button.${i + 1}`}
              >
                {copied === `about-wallet-${i}` ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tech Stack */}
      <Card className="border-border bg-card" data-ocid="about.tech.card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Zap className="w-5 h-5 text-purple-400" />
            Technology Stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {TECH_STACK.map((section) => (
              <div key={section.label} className="space-y-2">
                <h4
                  className="text-sm font-bold uppercase tracking-widest"
                  style={{ color: section.color }}
                >
                  {section.label}
                </h4>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <span
                        className="w-1 h-1 rounded-full shrink-0"
                        style={{ backgroundColor: section.color }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Built on ICP badge */}
      <div className="text-center pb-4" data-ocid="about.icp_badge.section">
        <div
          className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl border"
          style={{
            background: "rgba(34,211,238,0.06)",
            borderColor: "rgba(34,211,238,0.25)",
          }}
        >
          <Shield className="w-5 h-5 text-cyan-400" />
          <div className="text-left">
            <p className="text-sm font-semibold text-cyan-300">
              Built on Internet Computer
            </p>
            <p className="text-xs text-muted-foreground">
              100% on-chain · No servers · No downtime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
