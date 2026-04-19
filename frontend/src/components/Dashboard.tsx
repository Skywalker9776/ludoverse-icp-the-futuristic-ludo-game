import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetPlayerWallet, useGetOfficialWallets, useGetBalance } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Gamepad2, Wallet, Trophy, Zap, Shield, Users, Copy, TrendingUp, Info, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardProps {
  onNavigate: (view: 'lobby' | 'wallet' | 'about' | 'guide') => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: wallet } = useGetPlayerWallet();
  const { data: balance } = useGetBalance();
  const { data: officialWallets } = useGetOfficialWallets();

  const isAuthenticated = !!identity;
  const currentBalance = balance ?? wallet?.balance ?? 0;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('📋 Wallet address copied to clipboard');
  };

  const winRate = userProfile && userProfile.gamesPlayed > 0
    ? ((userProfile.wins / userProfile.gamesPlayed) * 100).toFixed(1)
    : '0.0';

  if (!isAuthenticated) {
    return (
      <div className="space-y-12">
        <div className="text-center space-y-6 py-12">
          <img 
            src="/assets/generated/ludoverse-logo-transparent.dim_200x200.png" 
            alt="LudoVerse ICP" 
            className="w-32 h-32 mx-auto drop-shadow-[0_0_30px_rgba(168,85,247,0.6)] animate-pulse"
          />
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            LudoVerse ICP
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            The Future of Blockchain Board Gaming
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Experience the classic Ludo game reimagined with real ICP betting, futuristic 3D graphics, and blockchain-powered gameplay on the Internet Computer.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button
              onClick={() => onNavigate('guide')}
              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 shadow-glow-cyan"
              size="lg"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              View Complete Guide
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/50 transition-all">
            <CardHeader>
              <Zap className="w-12 h-12 text-purple-400 mb-2" />
              <CardTitle>Real ICP Betting</CardTitle>
              <CardDescription>
                Bet from 1 to 1,000,000 ICP per game. Winner takes the pot minus 5% platform fee.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500/10 to-cyan-500/10 border-pink-500/30 hover:border-pink-500/50 transition-all">
            <CardHeader>
              <Users className="w-12 h-12 text-pink-400 mb-2" />
              <CardTitle>Live Multiplayer</CardTitle>
              <CardDescription>
                Classic, Quick, Advanced, and Team modes. Real-time gameplay with up to 4 players online.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30 hover:border-cyan-500/50 transition-all">
            <CardHeader>
              <Shield className="w-12 h-12 text-cyan-400 mb-2" />
              <CardTitle>Blockchain Security</CardTitle>
              <CardDescription>
                All transactions secured by Internet Computer. Upgrade to Premium for 5 ICP for exclusive features.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {officialWallets && officialWallets.length > 0 && (
          <Card className="bg-black/40 backdrop-blur-xl border-cyan-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-6 h-6 text-cyan-400" />
                Official LudoVerse ICP Wallets
              </CardTitle>
              <CardDescription>
                Verified platform wallets for deposits and fee collection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {officialWallets.map((wallet, index) => (
                <div key={index} className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-cyan-400">Official Wallet {index + 1}</p>
                      <p className="text-xs font-mono text-muted-foreground break-all">{wallet.address}</p>
                      <p className="text-sm text-green-400 mt-1">Balance: {wallet.balance.toFixed(2)} ICP</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(wallet.address)}
                      className="shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-6 h-6 text-blue-400" />
              Quick Start Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <span className="text-blue-400 font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-blue-200">Login with Internet Identity</p>
                <p className="text-muted-foreground">Click the Login button to authenticate securely</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <span className="text-blue-400 font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-blue-200">Create Your Profile</p>
                <p className="text-muted-foreground">Choose your name and color to get started</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <span className="text-blue-400 font-bold">3</span>
              </div>
              <div>
                <p className="font-medium text-blue-200">Deposit ICP</p>
                <p className="text-muted-foreground">Add ICP to your wallet (1-1,000,000 ICP)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <span className="text-blue-400 font-bold">4</span>
              </div>
              <div>
                <p className="font-medium text-blue-200">Start Playing</p>
                <p className="text-muted-foreground">Join or create games and compete for ICP rewards</p>
              </div>
            </div>
            <Button
              onClick={() => onNavigate('guide')}
              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              View Complete User Guide
            </Button>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">
            Login with Internet Identity to start playing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Welcome back, {userProfile?.name}!
        </h2>
        <p className="text-muted-foreground">Ready to dominate the board?</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-cyan-500/30 shadow-glow-cyan">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="w-5 h-5 text-cyan-400" />
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-cyan-400">{currentBalance.toFixed(2)} ICP</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 shadow-glow-purple">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Games Played
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userProfile?.gamesPlayed || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-cyan-500/20 border-green-500/30 shadow-glow-green">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Wins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-400">{userProfile?.wins || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-400">{winRate}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30 hover:border-purple-500/60 transition-all cursor-pointer group">
          <CardHeader>
            <Gamepad2 className="w-16 h-16 text-purple-400 mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
            <CardTitle className="text-2xl">Start Playing</CardTitle>
            <CardDescription>
              Join a game lobby and compete with other players for real ICP rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => onNavigate('lobby')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-glow-purple"
              size="lg"
            >
              Enter Game Lobby
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-xl border-cyan-500/30 hover:border-cyan-500/60 transition-all cursor-pointer group">
          <CardHeader>
            <Wallet className="w-16 h-16 text-cyan-400 mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
            <CardTitle className="text-2xl">Manage Wallet</CardTitle>
            <CardDescription>
              Deposit, withdraw, and manage your ICP balance for betting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => onNavigate('wallet')}
              className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 shadow-glow-cyan"
              size="lg"
            >
              Open Wallet
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            Need Help Getting Started?
          </CardTitle>
          <CardDescription>
            View our comprehensive user guide for step-by-step instructions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => onNavigate('guide')}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            View Complete User Guide
          </Button>
        </CardContent>
      </Card>

      {officialWallets && officialWallets.length > 0 && (
        <Card className="bg-black/40 backdrop-blur-xl border-cyan-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-6 h-6 text-cyan-400" />
              Official LudoVerse ICP Wallets
            </CardTitle>
            <CardDescription>
              Verified platform wallets for deposits and fee collection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {officialWallets.map((wallet, index) => (
              <div key={index} className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-cyan-400">Official Wallet {index + 1}</p>
                    <p className="text-xs font-mono text-muted-foreground break-all">{wallet.address}</p>
                    <p className="text-sm text-green-400 mt-1">Balance: {wallet.balance.toFixed(2)} ICP</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(wallet.address)}
                    className="shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!userProfile?.isPremium && (
        <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <img 
                src="/assets/generated/premium-badge-transparent.dim_100x100.png" 
                alt="Premium" 
                className="w-12 h-12 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]"
              />
              <div>
                <CardTitle>Upgrade to Premium</CardTitle>
                <CardDescription>
                  Unlock exclusive skins, special ranks, and premium features for only 5 ICP
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => onNavigate('wallet')}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            >
              View Premium Benefits
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
