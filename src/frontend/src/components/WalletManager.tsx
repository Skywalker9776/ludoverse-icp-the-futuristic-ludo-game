import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpFromLine,
  CheckCircle2,
  Copy,
  Crown,
  History,
  QrCode,
  Shield,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Variant_withdraw_betLock_betRefund_deposit_betWin } from "../backend";
import {
  useGetDemoCredits,
  useGetOfficialWallets,
  useGetPlayerWallet,
  useGetTransactionHistory,
  useIsPremium,
  useUpgradeToPremium,
  useWithdraw,
} from "../hooks/useQueries";
import { OFFICIAL_WALLETS } from "../types";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface WalletManagerProps {
  onBack: () => void;
}

type TxType = Variant_withdraw_betLock_betRefund_deposit_betWin;

const TX_CONFIG: Record<
  TxType,
  { label: string; color: string; bg: string; border: string }
> = {
  deposit: {
    label: "DEPOSIT",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  withdraw: {
    label: "WITHDRAWAL",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
  },
  betWin: {
    label: "WIN",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
  },
  betLock: {
    label: "BET",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
  },
  betRefund: {
    label: "REFUND",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
  },
};

const PREMIUM_PERKS = [
  {
    icon: "🎨",
    title: "Exclusive Skins",
    desc: "Rare board themes & neon token designs",
  },
  {
    icon: "👑",
    title: "CEO Rank Badge",
    desc: "Gold crown displayed next to your name",
  },
  {
    icon: "🤖",
    title: "AI Oracle Unlocked",
    desc: "Real-time move probability heatmap",
  },
  {
    icon: "⚡",
    title: "Priority Matching",
    desc: "Skip the queue — instant matchmaking",
  },
  {
    icon: "🎭",
    title: "Spectator VIP Zone",
    desc: "Exclusive spectator reactions & emotes",
  },
  {
    icon: "📊",
    title: "Advanced Stats",
    desc: "Full performance analytics dashboard",
  },
];

export default function WalletManager({ onBack }: WalletManagerProps) {
  const { identity } = useInternetIdentity();
  const { data: wallet } = useGetPlayerWallet();
  const { data: demoCredits } = useGetDemoCredits();
  const { data: officialWalletsData } = useGetOfficialWallets();
  const { data: transactions } = useGetTransactionHistory();
  const { data: isPremium } = useIsPremium();
  const withdraw = useWithdraw();
  const upgradeToPremium = useUpgradeToPremium();

  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const currentBalance = wallet?.balance ?? 0;
  const demo = demoCredits ?? wallet?.demoCredits ?? 0;
  const principalId = identity?.getPrincipal().toString() ?? "";
  const displayedWallets = officialWalletsData?.length
    ? officialWalletsData
    : OFFICIAL_WALLETS;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("📋 Copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const handleWithdraw = async () => {
    const amount = Number.parseFloat(withdrawAmount);
    if (Number.isNaN(amount) || amount < 1) {
      toast.error("Minimum withdrawal is 1 ICP");
      return;
    }
    if (amount > currentBalance) {
      toast.error(
        `Insufficient balance — you have ${currentBalance.toFixed(2)} ICP`,
      );
      return;
    }
    try {
      await withdraw.mutateAsync(amount);
      toast.success(`✅ Withdrawn ${amount.toFixed(2)} ICP successfully`);
      setWithdrawAddress("");
      setWithdrawAmount("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Please try again";
      toast.error("Withdrawal failed", { description: msg });
    }
  };

  const handleUpgrade = async () => {
    if (currentBalance < 5) {
      toast.error("You need at least 5 ICP to upgrade");
      return;
    }
    try {
      await upgradeToPremium.mutateAsync();
      toast.success("🎉 Welcome to Premium!", {
        description: "All features unlocked for life",
        duration: 5000,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Please try again";
      toast.error("Upgrade failed", { description: msg });
    }
  };

  return (
    <div className="space-y-6" data-ocid="wallet.page">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2 text-muted-foreground hover:text-foreground"
          data-ocid="wallet.back_button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h2
            className="text-3xl font-bold"
            style={{
              background: "linear-gradient(90deg, #22d3ee, #a855f7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Wallet Manager
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your ICP balance, deposits & withdrawals
          </p>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card
          className="border-yellow-500/40 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(168,85,247,0.08) 100%)",
          }}
          data-ocid="wallet.balance_card"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ boxShadow: "inset 0 0 40px rgba(251,191,36,0.08)" }}
          />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-widest">
              <Wallet className="w-4 h-4 text-yellow-400" />
              Live ICP Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-yellow-400 tracking-tight">
              {currentBalance.toFixed(2)}
              <span className="text-2xl text-yellow-400/70 ml-2">ICP</span>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Available for live betting
            </p>
          </CardContent>
        </Card>

        <Card
          className="border-emerald-500/30 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(34,197,94,0.10) 0%, rgba(34,211,238,0.06) 100%)",
          }}
          data-ocid="wallet.demo_balance_card"
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-muted-foreground">Demo Credits</span>
              <Badge className="ml-1 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0">
                FREE
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-emerald-400 tracking-tight">
              {demo.toFixed(0)}
              <span className="text-2xl text-emerald-400/70 ml-2">DC</span>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Practice currency — cannot be withdrawn
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="deposit" className="w-full" data-ocid="wallet.tabs">
        <TabsList className="grid w-full grid-cols-4 bg-card/80 border border-border">
          <TabsTrigger value="deposit" data-ocid="wallet.deposit.tab">
            Deposit
          </TabsTrigger>
          <TabsTrigger value="withdraw" data-ocid="wallet.withdraw.tab">
            Withdraw
          </TabsTrigger>
          <TabsTrigger value="history" data-ocid="wallet.history.tab">
            History
          </TabsTrigger>
          <TabsTrigger value="premium" data-ocid="wallet.premium.tab">
            Premium
          </TabsTrigger>
        </TabsList>

        {/* ── DEPOSIT ── */}
        <TabsContent value="deposit" className="space-y-4 mt-4">
          {/* Your deposit address */}
          <Card
            className="border-cyan-500/30 bg-card"
            data-ocid="wallet.deposit_address.card"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ArrowDownToLine className="w-5 h-5 text-cyan-400" />
                Your Deposit Address
              </CardTitle>
              <CardDescription>
                Send ICP from any exchange or ICP wallet to this address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {principalId ? (
                <>
                  <div
                    className="rounded-xl border border-cyan-500/30 p-4"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(34,211,238,0.06), rgba(168,85,247,0.06))",
                    }}
                  >
                    <p className="text-xs text-cyan-400 uppercase tracking-widest font-semibold mb-2">
                      Principal ID (Deposit Address)
                    </p>
                    <div className="flex items-start gap-2">
                      <code className="flex-1 text-xs font-mono text-foreground/90 break-all leading-relaxed min-w-0 bg-black/30 p-3 rounded-lg">
                        {principalId}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          copyToClipboard(principalId, "principal")
                        }
                        className="shrink-0 text-cyan-400 hover:bg-cyan-500/10"
                        data-ocid="wallet.copy_address.button"
                        aria-label="Copy deposit address"
                      >
                        {copied === "principal" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* QR Placeholder */}
                  <div className="flex items-center gap-4">
                    <div
                      className="w-24 h-24 rounded-xl border border-border flex flex-col items-center justify-center shrink-0 bg-muted/30"
                      data-ocid="wallet.qr_code"
                    >
                      <QrCode className="w-8 h-8 text-muted-foreground mb-1" />
                      <span className="text-[9px] text-muted-foreground text-center px-1">
                        QR Code
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p className="text-foreground/80 font-medium">
                        How to deposit ICP:
                      </p>
                      <ol className="space-y-1 list-decimal list-inside text-xs leading-relaxed">
                        <li>Copy your Principal ID above</li>
                        <li>
                          Open Binance, Coinbase, Kraken, or any ICP wallet
                        </li>
                        <li>Go to Withdraw → ICP → paste your Principal ID</li>
                        <li>Enter amount (min 1 ICP) and confirm</li>
                        <li>Balance updates in 1–2 minutes</li>
                      </ol>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-sm text-yellow-200">
                  Login with Internet Identity to see your deposit address.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Official Wallets */}
          <Card
            className="border-purple-500/30 bg-card"
            data-ocid="wallet.official_wallets.card"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="w-4 h-4 text-purple-400" />
                Official LudoVerse Wallets
              </CardTitle>
              <CardDescription>
                Verified platform wallets — all fees collected transparently
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {displayedWallets.map((w, i) => (
                <div
                  key={w.address}
                  className="rounded-xl border border-purple-500/20 p-3 flex items-center gap-3"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(168,85,247,0.06), rgba(236,72,153,0.04))",
                  }}
                  data-ocid={`wallet.official_wallet.item.${i + 1}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-purple-300">
                        {w.walletLabel}
                      </span>
                      <Badge className="text-[9px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-1.5 py-0">
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
                    onClick={() => copyToClipboard(w.address, `wallet-${i}`)}
                    className="shrink-0 text-purple-400 hover:bg-purple-500/10"
                    aria-label={`Copy ${w.walletLabel}`}
                    data-ocid={`wallet.copy_official.button.${i + 1}`}
                  >
                    {copied === `wallet-${i}` ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── WITHDRAW ── */}
        <TabsContent value="withdraw" className="mt-4">
          <Card
            className="border-rose-500/30 bg-card"
            data-ocid="wallet.withdraw.card"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpFromLine className="w-5 h-5 text-rose-400" />
                Withdraw ICP
              </CardTitle>
              <CardDescription>
                Transfer ICP from your wallet to an external address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="withdraw-address" className="text-sm">
                  Destination Address (Principal ID)
                </Label>
                <Input
                  id="withdraw-address"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"
                  className="font-mono text-xs"
                  data-ocid="wallet.withdraw_address.input"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="withdraw-amount" className="text-sm">
                  Amount (ICP)
                </Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  min="1"
                  max={currentBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  data-ocid="wallet.withdraw_amount.input"
                />
                <p className="text-xs text-muted-foreground">
                  Available:{" "}
                  <span className="text-yellow-400 font-semibold">
                    {currentBalance.toFixed(2)} ICP
                  </span>
                </p>
              </div>

              <Button
                onClick={handleWithdraw}
                disabled={
                  withdraw.isPending ||
                  !withdrawAmount ||
                  Number.parseFloat(withdrawAmount) < 1
                }
                className="w-full font-semibold"
                style={{
                  background: "linear-gradient(90deg, #f43f5e, #dc2626)",
                }}
                size="lg"
                data-ocid="wallet.withdraw.submit_button"
              >
                {withdraw.isPending ? "Processing..." : "Withdraw ICP"}
              </Button>

              <div className="flex items-start gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-rose-200/80">
                  Withdrawals are irreversible on-chain transactions. Always
                  verify the destination address before confirming.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── HISTORY ── */}
        <TabsContent value="history" className="mt-4">
          <Card
            className="border-border bg-card"
            data-ocid="wallet.history.card"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Transaction History
              </CardTitle>
              <CardDescription>
                Last 20 transactions on your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions && transactions.length > 0 ? (
                <div className="space-y-2">
                  {transactions.slice(0, 20).map((tx, i) => {
                    const cfg = TX_CONFIG[tx.txType] ?? TX_CONFIG.deposit;
                    const date = new Date(Number(tx.timestamp) / 1_000_000);
                    return (
                      <div
                        key={tx.id.toString()}
                        className={`flex items-center gap-3 rounded-lg border p-3 ${cfg.bg} ${cfg.border}`}
                        data-ocid={`wallet.tx.item.${i + 1}`}
                      >
                        <Badge
                          className={`text-[10px] font-bold ${cfg.bg} ${cfg.color} border ${cfg.border} px-2 shrink-0`}
                        >
                          {cfg.label}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground truncate">
                            {tx.description}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60">
                            {date.toLocaleDateString()}{" "}
                            {date.toLocaleTimeString()}
                          </p>
                        </div>
                        <p
                          className={`text-sm font-bold shrink-0 ${cfg.color}`}
                        >
                          {tx.txType === "withdraw" || tx.txType === "betLock"
                            ? "-"
                            : "+"}
                          {tx.amount.toFixed(2)} ICP
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="wallet.history.empty_state"
                >
                  <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No transactions yet</p>
                  <p className="text-xs mt-1">
                    Your deposit and game history will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── PREMIUM ── */}
        <TabsContent value="premium" className="mt-4">
          {isPremium ? (
            <Card
              className="border-yellow-500/50 relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(168,85,247,0.10))",
              }}
              data-ocid="wallet.premium.card"
            >
              <div className="absolute top-4 right-4">
                <Badge className="bg-yellow-500/30 text-yellow-300 border border-yellow-500/50 text-sm px-3 py-1">
                  CEO PREMIUM ♾️
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Crown className="w-7 h-7 text-yellow-400" />
                  Lifetime Premium Active
                </CardTitle>
                <CardDescription>
                  All features permanently unlocked for your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {PREMIUM_PERKS.map((perk) => (
                    <div
                      key={perk.title}
                      className="flex items-start gap-2 p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/20"
                    >
                      <span className="text-lg">{perk.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-yellow-200">
                          {perk.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {perk.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card
              className="border-yellow-500/30 relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(249,115,22,0.06))",
              }}
              data-ocid="wallet.premium.card"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  Unlock Premium
                </CardTitle>
                <CardDescription>
                  One-time upgrade · All features included · Forever
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-3">
                  {PREMIUM_PERKS.map((perk) => (
                    <div
                      key={perk.title}
                      className="flex items-start gap-2 p-2 rounded-lg bg-white/5 border border-border"
                    >
                      <span className="text-lg">{perk.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground/90">
                          {perk.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {perk.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5">
                  <div>
                    <p className="text-2xl font-bold text-yellow-400">5 ICP</p>
                    <p className="text-xs text-muted-foreground">
                      One-time payment · Lifetime access
                    </p>
                  </div>
                  <Button
                    onClick={handleUpgrade}
                    disabled={upgradeToPremium.isPending || currentBalance < 5}
                    className="font-bold px-6"
                    style={{
                      background: "linear-gradient(90deg, #eab308, #f97316)",
                    }}
                    size="lg"
                    data-ocid="wallet.upgrade_premium.button"
                  >
                    {upgradeToPremium.isPending
                      ? "Processing..."
                      : "Upgrade Now"}
                  </Button>
                </div>

                {currentBalance < 5 && (
                  <p
                    className="text-xs text-center text-muted-foreground"
                    data-ocid="wallet.premium.error_state"
                  >
                    You need at least 5 ICP · Current:{" "}
                    {currentBalance.toFixed(2)} ICP
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
