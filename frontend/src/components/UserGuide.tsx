import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  LogIn, 
  UserPlus, 
  Wallet, 
  ArrowDownToLine, 
  Gamepad2, 
  ArrowUpFromLine, 
  Copy,
  Shield,
  Trophy,
  Info,
  AlertCircle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetOfficialWallets } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface UserGuideProps {
  onNavigate?: (view: 'wallet' | 'lobby') => void;
}

export default function UserGuide({ onNavigate }: UserGuideProps) {
  const { identity } = useInternetIdentity();
  const { data: officialWallets } = useGetOfficialWallets();
  const isAuthenticated = !!identity;
  const depositAddress = identity?.getPrincipal().toString() || '';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Complete User Guide
        </h2>
        <p className="text-muted-foreground text-lg">
          Everything you need to know about real ICP transactions and gameplay
        </p>
      </div>

      {/* Real ICP Integration Notice */}
      <Alert className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/50">
        <CheckCircle2 className="h-5 w-5 text-blue-400" />
        <AlertTitle className="text-blue-200 text-lg">Real Blockchain Integration</AlertTitle>
        <AlertDescription className="text-blue-100">
          LudoVerse ICP uses the Internet Computer's ICP Ledger canister for all transactions. Your deposits, withdrawals, and game winnings are secured by real blockchain technology. All ICP transactions are final and recorded on-chain.
        </AlertDescription>
      </Alert>

      {/* Step 1: Login with Internet Identity */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-400 font-bold">1</span>
            </div>
            <LogIn className="w-6 h-6 text-blue-400" />
            Login with Internet Identity
          </CardTitle>
          <CardDescription className="text-base">
            Secure authentication using Internet Computer's decentralized identity system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-blue-400 text-xs">a</span>
              </div>
              <div>
                <p className="font-medium text-blue-200">Click the "Login" button in the top-right corner</p>
                <p className="text-muted-foreground">This will open the Internet Identity authentication window</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-blue-400 text-xs">b</span>
              </div>
              <div>
                <p className="font-medium text-blue-200">Create a new Internet Identity or use an existing one</p>
                <p className="text-muted-foreground">Follow the prompts to set up your secure identity anchor</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-blue-400 text-xs">c</span>
              </div>
              <div>
                <p className="font-medium text-blue-200">Complete authentication</p>
                <p className="text-muted-foreground">You'll be automatically redirected back to LudoVerse ICP</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-200">Why Internet Identity?</p>
                <p className="text-muted-foreground">Internet Identity provides secure, anonymous authentication without passwords. Your identity is cryptographically secured on the blockchain and gives you a unique principal ID for receiving ICP.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Create Your Profile */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <span className="text-purple-400 font-bold">2</span>
            </div>
            <UserPlus className="w-6 h-6 text-purple-400" />
            Create Your Player Profile
          </CardTitle>
          <CardDescription className="text-base">
            Set up your unique player identity with name and color
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-purple-400 text-xs">a</span>
              </div>
              <div>
                <p className="font-medium text-purple-200">Enter your player name (2-20 characters)</p>
                <p className="text-muted-foreground">Choose a unique name that other players will see during games</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-purple-400 text-xs">b</span>
              </div>
              <div>
                <p className="font-medium text-purple-200">Select your player color</p>
                <p className="text-muted-foreground">Choose from 6 futuristic neon colors for your game pieces</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-purple-400 text-xs">c</span>
              </div>
              <div>
                <p className="font-medium text-purple-200">Click "Create Profile"</p>
                <p className="text-muted-foreground">Your profile and wallet will be created automatically on the blockchain</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-purple-200">Profile Creation</p>
                <p className="text-muted-foreground">Your profile is stored on the blockchain and linked to your Internet Identity. You can update your name and color anytime from the Profile page.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Understanding Your Deposit Address */}
      <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <span className="text-cyan-400 font-bold">3</span>
            </div>
            <Wallet className="w-6 h-6 text-cyan-400" />
            Understanding Your Deposit Address
          </CardTitle>
          <CardDescription className="text-base">
            Your principal ID is your unique blockchain address for receiving ICP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAuthenticated && depositAddress ? (
            <>
              <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <p className="text-sm text-cyan-400 mb-2 font-medium">Your Personal Deposit Address (Principal ID):</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono text-muted-foreground break-all bg-black/40 p-3 rounded">
                    {depositAddress}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(depositAddress)}
                    className="shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <p className="font-medium text-blue-200 mb-1">What is a Principal ID?</p>
                  <p className="text-muted-foreground">Your principal ID is your unique identifier on the Internet Computer blockchain. It's like a bank account number for ICP tokens. This address is permanent and tied to your Internet Identity.</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <p className="font-medium text-green-200 mb-1">How to Use It</p>
                  <p className="text-muted-foreground">Copy this address and use it to receive ICP from exchanges (Coinbase, Binance, etc.), other wallets (NNS, Plug, Stoic), or friends. Any ICP sent to this address will appear in your LudoVerse wallet.</p>
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-sm text-yellow-200">
                Please login with Internet Identity to view your deposit address.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 4: Deposit ICP (Two Methods) */}
      <Card className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-green-400 font-bold">4</span>
            </div>
            <ArrowDownToLine className="w-6 h-6 text-green-400" />
            Deposit ICP to Your Wallet
          </CardTitle>
          <CardDescription className="text-base">
            Two methods to add real ICP to your gaming wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-blue-500/10 border-blue-500/30">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertTitle className="text-blue-200">Two Deposit Methods Available</AlertTitle>
            <AlertDescription className="text-blue-100 text-sm">
              You can deposit ICP using the in-app form OR by sending ICP directly from any external wallet to your principal ID.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <h4 className="font-semibold text-green-200 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-xs">1</span>
                Method 1: In-App Deposit Form
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground ml-8">
                <p>• Navigate to the Wallet page</p>
                <p>• Enter the amount you want to deposit (1 - 1,000,000 ICP)</p>
                <p>• Click "Deposit ICP" button</p>
                <p>• Transaction is processed via the ICP Ledger canister</p>
                <p>• Your balance updates automatically after blockchain confirmation</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <h4 className="font-semibold text-cyan-200 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs">2</span>
                Method 2: External Wallet Transfer
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground ml-8">
                <p>• Copy your principal ID from the Wallet page</p>
                <p>• Open your ICP wallet (NNS, Plug, Stoic, etc.) or exchange account</p>
                <p>• Initiate a transfer to your principal ID</p>
                <p>• Enter the amount and confirm the transaction</p>
                <p>• Wait for blockchain confirmation (usually 1-2 minutes)</p>
                <p>• Your LudoVerse balance updates automatically</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-200">Transaction Fees</p>
                <p className="text-muted-foreground">The ICP Ledger charges a small network fee (typically 0.0001 ICP) for transfers. This fee is standard across the Internet Computer network and is not controlled by LudoVerse.</p>
              </div>
            </div>
          </div>

          {onNavigate && (
            <Button
              onClick={() => onNavigate('wallet')}
              className="w-full bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700"
            >
              Go to Wallet
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Step 5: Place Bets and Start Playing */}
      <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
              <span className="text-pink-400 font-bold">5</span>
            </div>
            <Gamepad2 className="w-6 h-6 text-pink-400" />
            Place Bets and Start Playing
          </CardTitle>
          <CardDescription className="text-base">
            Join or create games with real ICP betting (1 - 1,000,000 ICP)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-pink-400 text-xs">a</span>
              </div>
              <div>
                <p className="font-medium text-pink-200">Navigate to the Game Lobby</p>
                <p className="text-muted-foreground">Click "Play" in the navigation or use Quick Play from dashboard</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-pink-400 text-xs">b</span>
              </div>
              <div>
                <p className="font-medium text-pink-200">Choose Quick Play or Create Custom Game</p>
                <p className="text-muted-foreground">Quick Play: Instant match with 10 ICP bet | Custom: Choose mode and bet amount</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-pink-400 text-xs">c</span>
              </div>
              <div>
                <p className="font-medium text-pink-200">Select game mode and bet amount (1 - 1,000,000 ICP)</p>
                <p className="text-muted-foreground">Choose from Classic, Quick, Advanced, or Team modes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-pink-400 text-xs">d</span>
              </div>
              <div>
                <p className="font-medium text-pink-200">Play the game and win real ICP!</p>
                <p className="text-muted-foreground">Roll dice, move pieces, and be the first to get all pieces home</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-pink-500/10 border border-pink-500/30">
            <div className="flex items-start gap-3">
              <Trophy className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-pink-200">Winning & Blockchain Payouts</p>
                <p className="text-muted-foreground">Winner receives 95% of the total pot (5% platform fee). Winnings are automatically credited to your wallet balance via the ICP Ledger canister. All transactions are recorded on-chain.</p>
              </div>
            </div>
          </div>
          {onNavigate && (
            <Button
              onClick={() => onNavigate('lobby')}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
            >
              Go to Game Lobby
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Step 6: Withdraw ICP Safely */}
      <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
              <span className="text-orange-400 font-bold">6</span>
            </div>
            <ArrowUpFromLine className="w-6 h-6 text-orange-400" />
            Withdraw ICP Safely
          </CardTitle>
          <CardDescription className="text-base">
            Transfer your winnings to external wallets via blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-red-500/10 border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertTitle className="text-red-200">Blockchain Withdrawals Are Final</AlertTitle>
            <AlertDescription className="text-red-100 text-sm">
              All withdrawals are processed via the ICP Ledger canister. Once confirmed on-chain, transactions cannot be reversed. Always verify the destination address.
            </AlertDescription>
          </Alert>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-orange-400 text-xs">a</span>
              </div>
              <div>
                <p className="font-medium text-orange-200">Go to Wallet page and select "Withdraw" tab</p>
                <p className="text-muted-foreground">Navigate to the wallet management section</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-orange-400 text-xs">b</span>
              </div>
              <div>
                <p className="font-medium text-orange-200">Enter destination principal ID</p>
                <p className="text-muted-foreground">Paste the recipient's principal ID (from their wallet or exchange)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-orange-400 text-xs">c</span>
              </div>
              <div>
                <p className="font-medium text-orange-200">Enter withdrawal amount (1 - 1,000,000 ICP)</p>
                <p className="text-muted-foreground">Must not exceed your available balance</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-orange-400 text-xs">d</span>
              </div>
              <div>
                <p className="font-medium text-orange-200">Click "Withdraw ICP" and confirm</p>
                <p className="text-muted-foreground">Transaction is processed via ICP Ledger canister</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-orange-400 text-xs">e</span>
              </div>
              <div>
                <p className="font-medium text-orange-200">Wait for blockchain confirmation</p>
                <p className="text-muted-foreground">ICP is transferred on-chain to the destination address (1-2 minutes)</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-sm space-y-2">
                <p className="font-medium text-red-200">⚠️ Critical Security Warnings</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                  <li>Always double-check the destination principal ID before confirming</li>
                  <li>Blockchain transactions are irreversible - there is no "undo"</li>
                  <li>A small ledger fee (0.0001 ICP) is deducted from withdrawals</li>
                  <li>Never share your Internet Identity credentials with anyone</li>
                  <li>Only withdraw to addresses you control and have verified</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Official Wallets Reference */}
      {officialWallets && officialWallets.length > 0 && (
        <Card className="bg-black/40 backdrop-blur-xl border-cyan-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-6 h-6 text-cyan-400" />
              Official LudoVerse ICP Wallets
            </CardTitle>
            <CardDescription>
              Verified platform wallets for transparency and fee collection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              These are the official LudoVerse platform wallets where game fees (5% of each pot) are collected. All transactions are transparent and recorded on the Internet Computer blockchain.
            </p>
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

      {/* Additional Tips & Security */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-400" />
            Blockchain Security & Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="p-3 rounded-lg bg-white/5">
            <p className="font-medium text-purple-200 mb-1">🔐 Secure Your Internet Identity</p>
            <p className="text-muted-foreground">Your Internet Identity is the key to your wallet. Enable recovery methods and never share your identity anchor with anyone. Consider using a hardware security key for maximum protection.</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <p className="font-medium text-cyan-200 mb-1">⛓️ Understanding Blockchain Transactions</p>
            <p className="text-muted-foreground">All ICP transactions are recorded permanently on the Internet Computer blockchain. You can verify any transaction using IC blockchain explorers. Transactions typically confirm within 1-2 minutes.</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <p className="font-medium text-green-200 mb-1">💰 Responsible Gaming with Real Money</p>
            <p className="text-muted-foreground">Only bet what you can afford to lose. Set personal limits and play responsibly. Remember that all bets are in real ICP cryptocurrency with real value.</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <p className="font-medium text-pink-200 mb-1">🎮 Game Strategy Tips</p>
            <p className="text-muted-foreground">Use the AI suggestions during gameplay to improve your strategy. Roll a 6 to get extra turns and bring new pieces into play. Premium members get advanced statistics.</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <p className="font-medium text-yellow-200 mb-1">💎 Premium Membership Benefits</p>
            <p className="text-muted-foreground">Upgrade to Premium for only 5 ICP to unlock exclusive skins, special ranks, priority matching, and no platform fees on winnings.</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <p className="font-medium text-orange-200 mb-1">📊 Track Your Progress</p>
            <p className="text-muted-foreground">Visit your Profile page to view detailed statistics, win rates, and game history. All data is stored securely on the blockchain.</p>
          </div>
        </CardContent>
      </Card>

      {/* External Resources */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-6 h-6 text-blue-400" />
            Learn More About ICP & Internet Computer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Want to learn more about the Internet Computer blockchain and ICP tokens? Check out these official resources:
          </p>
          <div className="space-y-2">
            <a 
              href="https://internetcomputer.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Internet Computer Official Website
            </a>
            <a 
              href="https://internetcomputer.org/docs/current/developer-docs/defi/icp-tokens/overview" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              ICP Token Documentation
            </a>
            <a 
              href="https://identity.ic0.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Internet Identity Portal
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
