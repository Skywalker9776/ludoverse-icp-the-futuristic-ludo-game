import { Copy, ExternalLink, Globe, Heart, Shield } from "lucide-react";
import { toast } from "sonner";
import { useGetOfficialWallets } from "../hooks/useQueries";
import { OFFICIAL_WALLETS } from "../types";
import type { View } from "../types";

interface FooterProps {
  onNavigate?: (view: View) => void;
}

const year = new Date().getFullYear();
const hostname =
  typeof window !== "undefined"
    ? encodeURIComponent(window.location.hostname)
    : "";
const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`;

export default function Footer({ onNavigate }: FooterProps) {
  const { data: officialWallets } = useGetOfficialWallets();
  const walletsToShow = officialWallets?.length
    ? officialWallets
    : OFFICIAL_WALLETS;

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Wallet address copied!");
  };

  return (
    <footer className="border-t border-white/10 bg-card/60 backdrop-blur-xl mt-auto">
      <div className="container mx-auto px-4 py-8">
        {/* Official Wallets - Always Displayed */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-cyan-400" />
            <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">
              Official LudoVerse ICP Wallets
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {walletsToShow.map((wallet, i) => (
              <div
                key={wallet.address}
                className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
                data-ocid={`footer.official_wallet.${i + 1}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wide mb-0.5">
                    {wallet.walletLabel}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground truncate">
                    {wallet.address}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyAddress(wallet.address)}
                  className="p-1.5 rounded-md hover:bg-white/10 transition-colors shrink-0"
                  aria-label="Copy wallet address"
                >
                  <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Links row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {onNavigate && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate("about")}
                  className="hover:text-foreground transition-colors"
                >
                  About
                </button>
                <span className="text-white/20">·</span>
                <button
                  type="button"
                  onClick={() => onNavigate("guide")}
                  className="hover:text-foreground transition-colors"
                >
                  Guide
                </button>
                <span className="text-white/20">·</span>
              </>
            )}
            <a
              href="https://ludoverse.icp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Globe className="w-3 h-3" />
              ludoverse.icp
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            © {year}. Built with
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
            using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
