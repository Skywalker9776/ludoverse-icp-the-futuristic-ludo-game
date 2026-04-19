import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Gamepad2,
  Home,
  Info,
  LogIn,
  LogOut,
  Menu,
  Star,
  Trophy,
  User,
  Wallet,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useGetBalance,
  useGetCallerUserProfile,
  useGetPlayerWallet,
} from "../hooks/useQueries";
import type { View } from "../types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

interface NavItem {
  view: View;
  icon: React.ReactNode;
  label: string;
  requiresAuth: boolean;
  requiresProfile: boolean;
}

const navItems: NavItem[] = [
  {
    view: "dashboard",
    icon: <Home className="w-4 h-4" />,
    label: "Home",
    requiresAuth: false,
    requiresProfile: false,
  },
  {
    view: "lobby",
    icon: <Gamepad2 className="w-4 h-4" />,
    label: "Play",
    requiresAuth: true,
    requiresProfile: true,
  },
  {
    view: "wallet",
    icon: <Wallet className="w-4 h-4" />,
    label: "Wallet",
    requiresAuth: true,
    requiresProfile: true,
  },
  {
    view: "profile",
    icon: <User className="w-4 h-4" />,
    label: "Profile",
    requiresAuth: true,
    requiresProfile: true,
  },
  {
    view: "guide",
    icon: <BookOpen className="w-4 h-4" />,
    label: "Guide",
    requiresAuth: false,
    requiresProfile: false,
  },
  {
    view: "about",
    icon: <Info className="w-4 h-4" />,
    label: "About",
    requiresAuth: false,
    requiresProfile: false,
  },
];

export default function Header({ currentView, onNavigate }: HeaderProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: wallet } = useGetPlayerWallet();
  const { data: balance } = useGetBalance();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const displayBalance = balance ?? wallet?.balance ?? 0;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      toast.success("Logged out successfully");
      onNavigate("dashboard");
    } else {
      try {
        await login();
        toast.success("Welcome to LudoVerse ICP!");
      } catch (error: unknown) {
        const err = error as Error;
        if (err.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        } else {
          toast.error("Login failed. Please try again.");
        }
      }
    }
  };

  const handleNav = (view: View) => {
    onNavigate(view);
    setMobileOpen(false);
  };

  const visibleItems = navItems.filter((item) => {
    if (item.requiresAuth && !isAuthenticated) return false;
    if (item.requiresProfile && !userProfile) return false;
    return true;
  });

  const NavLinks = () => (
    <>
      {visibleItems.map((item) => (
        <Button
          key={item.view}
          data-ocid={`nav.${item.view}`}
          variant={currentView === item.view ? "default" : "ghost"}
          size="sm"
          onClick={() => handleNav(item.view)}
          className={`gap-2 transition-all duration-200 ${
            currentView === item.view
              ? "bg-primary text-primary-foreground shadow-glow-purple"
              : "text-muted-foreground hover:text-foreground hover:bg-white/10"
          }`}
        >
          {item.icon}
          <span className="hidden lg:inline">{item.label}</span>
        </Button>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-card/80 backdrop-blur-2xl shadow-[0_4px_30px_rgba(168,85,247,0.15)]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            type="button"
            data-ocid="header.logo_link"
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleNav("dashboard")}
          >
            <img
              src="/assets/generated/ludoverse-logo-transparent.dim_200x200.png"
              alt="LudoVerse ICP"
              className="w-10 h-10 drop-shadow-[0_0_12px_rgba(168,85,247,0.6)] group-hover:scale-110 transition-transform duration-200"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary via-accent to-cyan-400 bg-clip-text text-transparent leading-none">
                LudoVerse ICP
              </h1>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                The Future of Board Gaming
              </p>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLinks />
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Balance pill */}
            {isAuthenticated && userProfile && (
              <button
                type="button"
                data-ocid="header.wallet_balance"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 hover:border-primary/60 transition-all duration-200 cursor-pointer"
                onClick={() => handleNav("wallet")}
              >
                <Wallet className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-mono font-bold text-foreground">
                  {displayBalance.toFixed(2)} ICP
                </span>
              </button>
            )}

            {/* Demo credits */}
            {isAuthenticated && userProfile && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-cyan-300">
                  {(userProfile.demoCredits || 0).toFixed(0)} Demo
                </span>
              </div>
            )}

            {/* Profile indicator */}
            {isAuthenticated && userProfile && (
              <button
                type="button"
                data-ocid="header.profile_link"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-200"
                onClick={() => handleNav("profile")}
              >
                <div
                  className="w-3 h-3 rounded-full ring-2 ring-white/20"
                  style={{ backgroundColor: userProfile.color }}
                />
                <span className="text-xs font-medium text-foreground truncate max-w-[80px]">
                  {userProfile.name}
                </span>
                {userProfile.isPremium && (
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1 py-0 border-yellow-500/60 text-yellow-400 leading-none"
                  >
                    <Star className="w-2.5 h-2.5 mr-0.5 fill-yellow-400" />
                    CEO
                  </Badge>
                )}
              </button>
            )}

            {/* Auth button */}
            <Button
              data-ocid={
                isAuthenticated ? "header.logout_button" : "header.login_button"
              }
              onClick={handleAuth}
              disabled={isLoggingIn}
              size="sm"
              className={`gap-2 transition-all duration-200 ${
                isAuthenticated
                  ? "bg-destructive/80 hover:bg-destructive text-white border border-destructive/50"
                  : "bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-white shadow-glow-purple"
              }`}
            >
              {isLoggingIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                  Logging in...
                </>
              ) : isAuthenticated ? (
                <>
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Login with II</span>
                </>
              )}
            </Button>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  data-ocid="header.mobile_menu_button"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-72 bg-card border-border p-0"
                data-ocid="header.mobile_menu"
              >
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                      <img
                        src="/assets/generated/ludoverse-logo-transparent.dim_200x200.png"
                        alt="LudoVerse"
                        className="w-10 h-10"
                      />
                      <div>
                        <p className="font-bold text-foreground">
                          LudoVerse ICP
                        </p>
                        {userProfile && (
                          <p className="text-xs text-muted-foreground">
                            {userProfile.name}
                          </p>
                        )}
                      </div>
                    </div>
                    {isAuthenticated && userProfile && (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-center">
                          <p className="text-xs text-muted-foreground">
                            Balance
                          </p>
                          <p className="text-sm font-bold text-primary">
                            {displayBalance.toFixed(2)} ICP
                          </p>
                        </div>
                        <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-center">
                          <p className="text-xs text-muted-foreground">Demo</p>
                          <p className="text-sm font-bold text-cyan-400">
                            {(userProfile.demoCredits || 0).toFixed(0)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <nav className="flex-1 p-4 space-y-1">
                    {visibleItems.map((item) => (
                      <Button
                        key={item.view}
                        data-ocid={`nav.mobile.${item.view}`}
                        variant={
                          currentView === item.view ? "default" : "ghost"
                        }
                        className="w-full justify-start gap-3"
                        onClick={() => handleNav(item.view)}
                      >
                        {item.icon}
                        {item.label}
                      </Button>
                    ))}
                  </nav>
                  <div className="p-4 border-t border-border">
                    <Button
                      data-ocid={
                        isAuthenticated
                          ? "header.mobile_logout_button"
                          : "header.mobile_login_button"
                      }
                      onClick={handleAuth}
                      disabled={isLoggingIn}
                      className="w-full gap-2"
                      variant={isAuthenticated ? "destructive" : "default"}
                    >
                      {isAuthenticated ? (
                        <>
                          <LogOut className="w-4 h-4" /> Logout
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" /> Login with Internet
                          Identity
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
