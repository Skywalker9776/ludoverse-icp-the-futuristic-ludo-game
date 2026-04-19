import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  Activity,
  BookOpen,
  Copy,
  Eye,
  Gamepad2,
  Shield,
  Star,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useGetBalance,
  useGetCallerUserProfile,
  useGetFeaturedGames,
  useGetOfficialWallets,
  useGetPlayerWallet,
  useGetSystemStats,
} from "../hooks/useQueries";
import { OFFICIAL_WALLETS, WORLD_FIRST_FEATURES } from "../types";
import type { View } from "../types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface DashboardProps {
  onNavigate: (view: View) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { identity, login } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: wallet } = useGetPlayerWallet();
  const { data: balance } = useGetBalance();
  const { data: officialWallets } = useGetOfficialWallets();
  const { data: systemStats } = useGetSystemStats();
  const { data: featuredGames } = useGetFeaturedGames();

  const isAuthenticated = !!identity;
  const currentBalance = balance ?? wallet?.balance ?? 0;
  const walletsToShow = officialWallets?.length
    ? officialWallets
    : OFFICIAL_WALLETS;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Wallet address copied!");
  };

  const winRate =
    userProfile && userProfile.gamesPlayed > 0
      ? ((userProfile.wins / userProfile.gamesPlayed) * 100).toFixed(1)
      : "0.0";

  // Guest hero
  if (!isAuthenticated) {
    return (
      <div className="space-y-16" data-ocid="dashboard.page">
        {/* Hero Section */}
        <section
          className="relative rounded-2xl overflow-hidden"
          data-ocid="dashboard.hero_section"
        >
          <div className="absolute inset-0">
            <img
              src="/assets/generated/ludoverse-hero.dim_1200x600.jpg"
              alt="LudoVerse ICP"
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          </div>
          <div className="relative z-10 py-20 px-8 md:px-16 max-w-3xl">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 animate-glow-pulse">
              <Zap className="w-3 h-3 mr-1" />
              World's First Blockchain Ludo
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-cyan-400 bg-clip-text text-transparent mb-6 leading-tight">
              LudoVerse ICP
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-xl">
              The most advanced Ludo game ever built. Quantum dice, living
              boards, AI oracles, Token Souls, and live spectator arenas —
              powered by the Internet Computer.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                data-ocid="dashboard.login_cta"
                onClick={() => login()}
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-glow-purple text-lg px-8 font-bold"
              >
                <Gamepad2 className="w-5 h-5 mr-2" />
                Start Playing Free
              </Button>
              <Button
                data-ocid="dashboard.guide_cta"
                onClick={() => onNavigate("guide")}
                variant="outline"
                size="lg"
                className="border-white/20 hover:border-white/40 text-lg px-8"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                How to Play
              </Button>
            </div>
          </div>
        </section>

        {/* System Stats */}
        {systemStats && (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Total Players",
                value: systemStats.totalPlayers.toString(),
                icon: <Users className="w-5 h-5 text-primary" />,
                color: "text-primary",
              },
              {
                label: "Games Played",
                value: systemStats.totalGames.toString(),
                icon: <Gamepad2 className="w-5 h-5 text-accent" />,
                color: "text-accent",
              },
              {
                label: "Active Games",
                value: systemStats.activeGames.toString(),
                icon: <Activity className="w-5 h-5 text-cyan-400" />,
                color: "text-cyan-400",
              },
              {
                label: "Total Bets (ICP)",
                value: systemStats.totalBetsVolume.toFixed(0),
                icon: <TrendingUp className="w-5 h-5 text-green-400" />,
                color: "text-green-400",
              },
            ].map((stat) => (
              <Card
                key={stat.label}
                className="bg-card border-border text-center"
              >
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-2">{stat.icon}</div>
                  <p className={`text-3xl font-bold font-mono ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </section>
        )}

        {/* World-First Features */}
        <section data-ocid="dashboard.features_section">
          <div className="text-center mb-10">
            <Badge className="mb-3 bg-accent/20 text-accent border-accent/30">
              5 World Firsts
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Never Seen Before
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              LudoVerse ICP introduces 5 innovations that no Ludo game has ever
              had — each powered by the Internet Computer blockchain.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WORLD_FIRST_FEATURES.map((feature, i) => (
              <Card
                key={feature.id}
                data-ocid={`dashboard.feature.${i + 1}`}
                className={`bg-gradient-to-br ${feature.gradient} border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-[1.02] group`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-4xl">{feature.icon}</span>
                    <Badge
                      variant="outline"
                      className="text-xs border-white/20 text-muted-foreground"
                    >
                      {feature.subtitle}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Official Wallets */}
        <section data-ocid="dashboard.official_wallets_section">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-foreground">
              Official Platform Wallets
            </h2>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              Verified
            </Badge>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {walletsToShow.map((w, i) => (
              <div
                key={w.address}
                data-ocid={`dashboard.wallet_card.${i + 1}`}
                className="p-5 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 hover:border-cyan-500/50 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <p className="text-sm font-semibold text-cyan-400">
                        {w.walletLabel}
                      </p>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground break-all leading-relaxed">
                      {w.address}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Deposit ICP to this address to fund your wallet
                    </p>
                  </div>
                  <Button
                    data-ocid={`dashboard.wallet_copy_button.${i + 1}`}
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(w.address)}
                    className="shrink-0 hover:bg-white/10"
                    aria-label="Copy wallet address"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Start */}
        <section className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-2xl border border-white/10 p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            Quick Start for New Players
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "Login with Internet Identity",
                desc: "Click Login — no email or password needed",
                icon: "🔐",
              },
              {
                step: "2",
                title: "Create Your Profile",
                desc: "Pick your name and neon color avatar",
                icon: "👤",
              },
              {
                step: "3",
                title: "Play Demo Mode",
                desc: "Practice free with 1000 virtual credits",
                icon: "🎮",
              },
              {
                step: "4",
                title: "Bet Real ICP",
                desc: "Deposit ICP and bet from 1 to 1,000,000 ICP",
                icon: "💰",
              },
            ].map((s) => (
              <div key={s.step} className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto text-2xl">
                  {s.icon}
                </div>
                <p className="font-semibold text-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button
              data-ocid="dashboard.guide_link"
              onClick={() => onNavigate("guide")}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              View Complete User Guide
            </Button>
          </div>
        </section>
      </div>
    );
  }

  // Authenticated dashboard
  return (
    <div className="space-y-8" data-ocid="dashboard.authenticated_page">
      {/* Welcome banner */}
      <div className="relative rounded-2xl overflow-hidden p-8 bg-gradient-to-r from-primary/20 via-card to-accent/20 border border-primary/20">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-4 h-4 rounded-full ring-2 ring-white/30"
                style={{ backgroundColor: userProfile?.color || "#a855f7" }}
              />
              <p className="text-sm text-muted-foreground">Welcome back</p>
              {userProfile?.isPremium && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                  <Star className="w-3 h-3 mr-1 fill-yellow-400" /> CEO Premium
                </Badge>
              )}
            </div>
            <h2 className="text-3xl font-bold text-foreground">
              {userProfile?.name || "LudoVerse Player"}
            </h2>
            <p className="text-muted-foreground mt-1">
              Ready to dominate the board?
            </p>
          </div>
          <Button
            data-ocid="dashboard.play_now_button"
            onClick={() => onNavigate("lobby")}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-glow-purple text-white font-bold"
          >
            <Gamepad2 className="w-5 h-5 mr-2" />
            Play Now
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          data-ocid="dashboard.balance_card"
          className="bg-gradient-to-br from-cyan-500/20 to-primary/20 border-cyan-500/30 shadow-glow-cyan"
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Wallet className="w-4 h-4 text-cyan-400" /> ICP Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono text-cyan-400">
              {currentBalance.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">ICP</p>
          </CardContent>
        </Card>
        <Card
          data-ocid="dashboard.demo_card"
          className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-primary/30 shadow-glow-purple"
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-primary" /> Demo Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono text-primary">
              {(userProfile?.demoCredits || 0).toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground">Virtual</p>
          </CardContent>
        </Card>
        <Card
          data-ocid="dashboard.wins_card"
          className="bg-gradient-to-br from-green-500/20 to-cyan-500/20 border-green-500/30 shadow-glow-green"
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Trophy className="w-4 h-4 text-green-400" /> Wins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono text-green-400">
              {userProfile?.wins || 0}
            </p>
            <p className="text-xs text-muted-foreground">
              of {userProfile?.gamesPlayed || 0} played
            </p>
          </CardContent>
        </Card>
        <Card
          data-ocid="dashboard.winrate_card"
          className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30"
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-yellow-400" /> Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono text-yellow-400">
              {winRate}%
            </p>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card
          data-ocid="dashboard.play_live_card"
          className="bg-card border-primary/20 hover:border-primary/60 transition-all duration-300 hover:shadow-glow-purple cursor-pointer group"
          onClick={() => onNavigate("lobby")}
        >
          <CardHeader>
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-3 group-hover:bg-primary/30 transition-colors">
              <Gamepad2 className="w-7 h-7 text-primary" />
            </div>
            <CardTitle>Live Game Lobby</CardTitle>
            <CardDescription>
              Bet ICP and compete against real players worldwide
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              data-ocid="dashboard.enter_lobby_button"
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 shadow-glow-purple"
            >
              Enter Lobby
            </Button>
          </CardContent>
        </Card>

        <Card
          data-ocid="dashboard.play_demo_card"
          className="bg-card border-cyan-500/20 hover:border-cyan-500/60 transition-all duration-300 hover:shadow-glow-cyan cursor-pointer group"
          onClick={() => onNavigate("lobby")}
        >
          <CardHeader>
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-3 group-hover:bg-cyan-500/30 transition-colors">
              <Zap className="w-7 h-7 text-cyan-400" />
            </div>
            <CardTitle>Demo Practice</CardTitle>
            <CardDescription>
              Play free with {(userProfile?.demoCredits || 0).toFixed(0)}{" "}
              virtual credits — no ICP required
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              data-ocid="dashboard.play_demo_button"
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-glow-cyan"
            >
              Play Demo
            </Button>
          </CardContent>
        </Card>

        <Card
          data-ocid="dashboard.wallet_card"
          className="bg-card border-yellow-500/20 hover:border-yellow-500/60 transition-all duration-300 cursor-pointer group"
          onClick={() => onNavigate("wallet")}
        >
          <CardHeader>
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center mb-3 group-hover:bg-yellow-500/30 transition-colors">
              <Wallet className="w-7 h-7 text-yellow-400" />
            </div>
            <CardTitle>Manage Wallet</CardTitle>
            <CardDescription>
              Deposit, withdraw, and track your ICP transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              data-ocid="dashboard.open_wallet_button"
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            >
              Open Wallet
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Featured live games */}
      {featuredGames && featuredGames.length > 0 && (
        <section data-ocid="dashboard.featured_games_section">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <h3 className="text-lg font-bold text-foreground">
              Featured Live Games
            </h3>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              {featuredGames.length} Live
            </Badge>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {featuredGames.slice(0, 3).map((game, i) => (
              <Card
                key={game.gameId.toText()}
                data-ocid={`dashboard.featured_game.${i + 1}`}
                className="bg-card border-border hover:border-primary/40 transition-all"
              >
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      LIVE
                    </Badge>
                    <span className="text-sm font-bold text-accent">
                      {game.betAmount.toFixed(2)} ICP
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {game.playerCount.toString()} players
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {game.spectatorCount.toString()} watching
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Official wallets */}
      <section data-ocid="dashboard.wallets_section">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-cyan-400" />
          <h3 className="text-lg font-bold">Official LudoVerse Wallets</h3>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Verified
          </Badge>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {walletsToShow.map((w, i) => (
            <div
              key={w.address}
              data-ocid={`dashboard.wallet.${i + 1}`}
              className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-cyan-400 mb-1">
                    {w.walletLabel}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground break-all">
                    {w.address}
                  </p>
                </div>
                <Button
                  data-ocid={`dashboard.copy_wallet_button.${i + 1}`}
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(w.address)}
                  aria-label="Copy wallet address"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
