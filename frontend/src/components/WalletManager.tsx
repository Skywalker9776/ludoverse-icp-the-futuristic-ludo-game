import React, { useState } from 'react';
import { useGetPlayerWallet, useGetBalance, useDeposit, useWithdraw, useUpgradeToPremium, useGetOfficialWallets } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { ArrowLeft, Wallet, ArrowDownToLine, ArrowUpFromLine, Crown, Copy, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface WalletManagerProps {
  onBack: () => void;
}

export default function WalletManager({ onBack }: WalletManagerProps) {
  const { identity } = useInternetIdentity();
  const { data: wallet } = useGetPlayerWallet();
  const { data: balance } = useGetBalance();
  const { data: officialWallets } = useGetOfficialWallets();
  const deposit = useDeposit();
  const withdraw = useWithdraw();
  const upgradeToPremium = useUpgradeToPremium();

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [virtualBalance] = useState(10000); // Virtual currency for demo mode

  const currentBalance = balance ?? wallet?.balance ?? 0;
  const principalId = identity?.getPrincipal().toString() || '';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('📋 Copied to clipboard');
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    
    if (isNaN(amount) || amount < 1) {
      toast.error('Invalid Amount', {
        description: 'Minimum deposit is 1 ICP',
      });
      return;
    }

    if (amount > 1000000) {
      toast.error('Invalid Amount', {
        description: 'Maximum deposit is 1,000,000 ICP',
      });
      return;
    }

    try {
      await deposit.mutateAsync(amount);
      toast.success('Deposit Successful!', {
        description: `${amount.toFixed(2)} ICP added to your wallet`,
      });
      setDepositAmount('');
    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.error('Deposit Failed', {
        description: error.message || 'Please try again',
      });
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount < 1) {
      toast.error('Invalid Amount', {
        description: 'Minimum withdrawal is 1 ICP',
      });
      return;
    }

    if (amount > currentBalance) {
      toast.error('Insufficient Balance', {
        description: `You only have ${currentBalance.toFixed(2)} ICP`,
      });
      return;
    }

    try {
      await withdraw.mutateAsync(amount);
      toast.success('Withdrawal Successful!', {
        description: `${amount.toFixed(2)} ICP withdrawn from your wallet`,
      });
      setWithdrawAmount('');
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast.error('Withdrawal Failed', {
        description: error.message || 'Please try again',
      });
    }
  };

  const handleUpgradeToPremium = async () => {
    if (currentBalance < 5) {
      toast.error('Insufficient Balance', {
        description: 'You need at least 5 ICP to upgrade to Premium',
      });
      return;
    }

    try {
      await upgradeToPremium.mutateAsync();
      toast.success('🎉 Premium Upgrade Successful!', {
        description: 'You now have access to exclusive features!',
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Premium upgrade error:', error);
      toast.error('Upgrade Failed', {
        description: error.message || 'Please try again',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Wallet Manager
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-cyan-500/30 shadow-glow-cyan">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-6 h-6 text-cyan-400" />
              Live ICP Balance
            </CardTitle>
            <CardDescription>Real ICP for live betting games</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-cyan-400">{currentBalance.toFixed(2)} ICP</p>
            <p className="text-sm text-muted-foreground mt-2">Available for betting</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-400" />
              Virtual Balance
            </CardTitle>
            <CardDescription>Practice currency for demo games</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-400">{virtualBalance.toFixed(2)} Virtual ICP</p>
            <p className="text-sm text-muted-foreground mt-2">For practice only - cannot be withdrawn</p>
          </CardContent>
        </Card>
      </div>

      <Alert className="bg-yellow-500/10 border-yellow-500/30">
        <AlertCircle className="h-4 w-4 text-yellow-400" />
        <AlertTitle className="text-yellow-300">Important: Real ICP Blockchain Transactions</AlertTitle>
        <AlertDescription className="text-yellow-200/80">
          This app uses real ICP on the Internet Computer blockchain. All deposits and withdrawals are actual on-chain transactions. 
          Please ensure you understand blockchain transactions before proceeding. Demo mode uses virtual currency for practice.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
        </TabsList>

        <TabsContent value="deposit" className="space-y-4">
          <Card className="bg-black/40 backdrop-blur-xl border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownToLine className="w-6 h-6 text-green-400" />
                Deposit ICP
              </CardTitle>
              <CardDescription>
                Add ICP to your wallet for live betting (1 - 1,000,000 ICP)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deposit-amount">Amount (ICP)</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  min="1"
                  max="1000000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter amount to deposit"
                />
              </div>

              <Button
                onClick={handleDeposit}
                disabled={deposit.isPending}
                className="w-full bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700"
                size="lg"
              >
                {deposit.isPending ? 'Processing...' : 'Deposit ICP'}
              </Button>

              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 space-y-2">
                <p className="text-sm font-medium text-blue-300">Your Deposit Address (Principal ID)</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono bg-black/40 p-2 rounded break-all">
                    {principalId}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(principalId)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Send ICP to this address from any ICP wallet
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw" className="space-y-4">
          <Card className="bg-black/40 backdrop-blur-xl border-orange-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpFromLine className="w-6 h-6 text-orange-400" />
                Withdraw ICP
              </CardTitle>
              <CardDescription>
                Transfer ICP from your wallet to an external address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="withdraw-amount">Amount (ICP)</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  min="1"
                  max={currentBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount to withdraw"
                />
                <p className="text-xs text-muted-foreground">
                  Available: {currentBalance.toFixed(2)} ICP
                </p>
              </div>

              <Button
                onClick={handleWithdraw}
                disabled={withdraw.isPending}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                size="lg"
              >
                {withdraw.isPending ? 'Processing...' : 'Withdraw ICP'}
              </Button>

              <Alert className="bg-red-500/10 border-red-500/30">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertTitle className="text-red-300">Security Warning</AlertTitle>
                <AlertDescription className="text-red-200/80">
                  Withdrawals are irreversible blockchain transactions. Double-check all details before confirming.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="premium" className="space-y-4">
          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <img 
                  src="/assets/generated/premium-badge-transparent.dim_100x100.png" 
                  alt="Premium" 
                  className="w-16 h-16 drop-shadow-[0_0_20px_rgba(234,179,8,0.6)]"
                />
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-6 h-6 text-yellow-400" />
                    Premium Membership
                  </CardTitle>
                  <CardDescription>
                    Unlock exclusive features for only 5 ICP
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="bg-yellow-500/20 border-yellow-500/50 mt-1">✓</Badge>
                  <div>
                    <p className="font-medium text-yellow-200">Exclusive Skins</p>
                    <p className="text-sm text-muted-foreground">Unique game pieces and board themes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="bg-yellow-500/20 border-yellow-500/50 mt-1">✓</Badge>
                  <div>
                    <p className="font-medium text-yellow-200">Special Ranks</p>
                    <p className="text-sm text-muted-foreground">Premium badge and leaderboard priority</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="bg-yellow-500/20 border-yellow-500/50 mt-1">✓</Badge>
                  <div>
                    <p className="font-medium text-yellow-200">Priority Support</p>
                    <p className="text-sm text-muted-foreground">Faster response times and dedicated help</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="bg-yellow-500/20 border-yellow-500/50 mt-1">✓</Badge>
                  <div>
                    <p className="font-medium text-yellow-200">Advanced AI Opponents</p>
                    <p className="text-sm text-muted-foreground">Play against premium difficulty bots</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleUpgradeToPremium}
                disabled={upgradeToPremium.isPending || currentBalance < 5}
                className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                size="lg"
              >
                {upgradeToPremium.isPending ? 'Processing...' : 'Upgrade to Premium (5 ICP)'}
              </Button>

              {currentBalance < 5 && (
                <p className="text-sm text-center text-muted-foreground">
                  You need at least 5 ICP to upgrade. Current balance: {currentBalance.toFixed(2)} ICP
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
    </div>
  );
}
