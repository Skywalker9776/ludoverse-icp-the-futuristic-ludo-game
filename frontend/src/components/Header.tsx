import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetPlayerWallet } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Wallet, Gamepad2, Home, User, Info, BookOpen, LogIn, LogOut } from 'lucide-react';
import { toast } from 'sonner';

type View = 'dashboard' | 'lobby' | 'game' | 'wallet' | 'profile' | 'about' | 'guide';

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export default function Header({ currentView, onNavigate }: HeaderProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: wallet } = useGetPlayerWallet();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      toast.success('✅ Logged out successfully');
      onNavigate('dashboard');
    } else {
      try {
        await login();
        toast.success('✅ Logged in successfully');
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        } else {
          toast.error('❌ Login failed', {
            description: 'Please try again.',
          });
        }
      }
    }
  };

  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <img 
              src="/assets/generated/ludoverse-logo-transparent.dim_200x200.png" 
              alt="LudoVerse ICP" 
              className="w-12 h-12 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
            />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                LudoVerse ICP
              </h1>
              <p className="text-xs text-muted-foreground">The Future of Board Gaming</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            <Button
              variant={currentView === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('dashboard')}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Button>
            {isAuthenticated && userProfile && (
              <>
                <Button
                  variant={currentView === 'lobby' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onNavigate('lobby')}
                  className="gap-2"
                >
                  <Gamepad2 className="w-4 h-4" />
                  Play
                </Button>
                <Button
                  variant={currentView === 'wallet' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onNavigate('wallet')}
                  className="gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  Wallet
                </Button>
                <Button
                  variant={currentView === 'profile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onNavigate('profile')}
                  className="gap-2"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Button>
              </>
            )}
            <Button
              variant={currentView === 'guide' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('guide')}
              className="gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Guide
            </Button>
            <Button
              variant={currentView === 'about' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('about')}
              className="gap-2"
            >
              <Info className="w-4 h-4" />
              About
            </Button>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated && wallet && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <Wallet className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-white">
                  {wallet.balance.toFixed(2)} ICP
                </span>
              </div>
            )}
            
            {isAuthenticated && userProfile && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: userProfile.color }}
                />
                <span className="text-sm font-medium text-white">{userProfile.name}</span>
                {userProfile.isPremium && (
                  <img 
                    src="/assets/generated/premium-badge-transparent.dim_100x100.png" 
                    alt="Premium" 
                    className="w-4 h-4"
                  />
                )}
              </div>
            )}

            <Button
              onClick={handleAuth}
              disabled={disabled}
              size="sm"
              className={`gap-2 ${
                isAuthenticated
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              }`}
            >
              {disabled ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging in...
                </>
              ) : isAuthenticated ? (
                <>
                  <LogOut className="w-4 h-4" />
                  Logout
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Login
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
