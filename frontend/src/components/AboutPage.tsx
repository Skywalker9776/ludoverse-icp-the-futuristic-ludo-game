import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useGetOfficialWallets } from '../hooks/useQueries';
import { 
  Gamepad2, 
  Wallet, 
  Shield, 
  Zap, 
  Users, 
  Trophy,
  Copy,
  ExternalLink,
  Crown
} from 'lucide-react';
import { toast } from 'sonner';

export default function AboutPage() {
  const { data: officialWallets } = useGetOfficialWallets();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Wallet address copied to clipboard');
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <img 
          src="/assets/generated/ludoverse-logo-transparent.dim_200x200.png" 
          alt="LudoVerse ICP" 
          className="w-32 h-32 mx-auto drop-shadow-[0_0_30px_rgba(168,85,247,0.6)] animate-pulse"
        />
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
          About LudoVerse ICP
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          The Future of Blockchain Board Gaming on the Internet Computer
        </p>
      </div>

      <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl">What is LudoVerse ICP?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            LudoVerse ICP is a revolutionary blockchain-based Ludo board game that combines the classic gameplay you love with real ICP cryptocurrency betting. Built on the Internet Computer blockchain, it offers a secure, transparent, and exciting gaming experience with real monetary stakes.
          </p>
          <p>
            Experience the thrill of competitive gaming with futuristic 3D graphics, neon-themed visuals, and smooth animations. Every game is secured by blockchain technology, ensuring fair play and transparent transactions.
          </p>
          <p>
            Whether you're a casual player or a competitive gamer, LudoVerse ICP offers multiple game modes, real-time multiplayer action, and the opportunity to win real ICP tokens. Join thousands of players worldwide in the ultimate blockchain gaming experience.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardHeader>
            <Zap className="w-12 h-12 text-purple-400 mb-2" />
            <CardTitle>Real ICP Betting</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Bet from 1 to 1,000,000 ICP per game. Winner takes 95% of the pot, with a 5% platform fee. All transactions are instant and secured by the Internet Computer blockchain.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500/10 to-cyan-500/10 border-pink-500/30">
          <CardHeader>
            <Users className="w-12 h-12 text-pink-400 mb-2" />
            <CardTitle>Live Multiplayer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Play with up to 4 players in real-time. Choose from Classic, Quick, Advanced, and Team modes. Real-time chat and synchronized gameplay for an immersive experience.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
          <CardHeader>
            <Shield className="w-12 h-12 text-cyan-400 mb-2" />
            <CardTitle>Blockchain Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              All transactions and game results are recorded on the Internet Computer blockchain. Provably fair gameplay with transparent smart contracts and secure Internet Identity authentication.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 border-green-500/30">
          <CardHeader>
            <Gamepad2 className="w-12 h-12 text-green-400 mb-2" />
            <CardTitle>Multiple Game Modes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Classic mode for traditional gameplay, Quick mode for faster matches, Advanced mode with complex rules, and Team mode for collaborative play. Something for every player style.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
          <CardHeader>
            <Crown className="w-12 h-12 text-yellow-400 mb-2" />
            <CardTitle>Premium Features</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Upgrade to Premium for 5 ICP to unlock exclusive skins, special ranks, priority matching, and advanced statistics. CEO accounts receive lifetime premium access at no cost.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
          <CardHeader>
            <Trophy className="w-12 h-12 text-blue-400 mb-2" />
            <CardTitle>Competitive Gaming</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track your wins, losses, and win rate. Compete on leaderboards, earn achievements, and build your reputation as a top player in the LudoVerse ICP community.
            </p>
          </CardContent>
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
              Verified platform wallets for transparency and trust
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

      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl">Technology Stack</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-purple-200 mb-2">Blockchain</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Internet Computer Protocol (ICP)</li>
                <li>• Motoko Smart Contracts</li>
                <li>• Internet Identity Authentication</li>
                <li>• ICP Ledger Integration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-pink-200 mb-2">Frontend</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• React with TypeScript</li>
                <li>• Tailwind CSS for styling</li>
                <li>• Canvas API for game rendering</li>
                <li>• Real-time WebSocket connections</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-cyan-200 mb-2">Features</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Real-time multiplayer gameplay</li>
                <li>• Live in-game chat</li>
                <li>• AI-powered move suggestions</li>
                <li>• 3D futuristic graphics</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-200 mb-2">Security</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Decentralized authentication</li>
                <li>• Blockchain-verified transactions</li>
                <li>• Transparent smart contracts</li>
                <li>• Secure wallet management</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-500/50">
        <CardHeader>
          <CardTitle className="text-2xl">Visit Our Official Website</CardTitle>
          <CardDescription>
            Learn more about LudoVerse ICP and stay updated with the latest news
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => window.open('https://ludoverse-icp.com', '_blank')}
            className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
            size="lg"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Visit LudoVerse ICP Website
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <span className="text-blue-400 font-bold">1</span>
            </div>
            <div>
              <p className="font-medium text-blue-200">Login with Internet Identity</p>
              <p className="text-muted-foreground">Secure, decentralized authentication</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <span className="text-blue-400 font-bold">2</span>
            </div>
            <div>
              <p className="font-medium text-blue-200">Create Your Profile</p>
              <p className="text-muted-foreground">Choose your name and color</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <span className="text-blue-400 font-bold">3</span>
            </div>
            <div>
              <p className="font-medium text-blue-200">Deposit ICP</p>
              <p className="text-muted-foreground">Add funds to start playing (1-1,000,000 ICP)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <span className="text-blue-400 font-bold">4</span>
            </div>
            <div>
              <p className="font-medium text-blue-200">Start Playing</p>
              <p className="text-muted-foreground">Join games and win ICP rewards</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
