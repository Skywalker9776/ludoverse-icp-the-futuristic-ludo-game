import React, { useState, useEffect } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useAutomaticUserInitialization, useGetCallerUserProfile } from './hooks/useQueries';
import { useActor } from './hooks/useActor';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import GameLobby from './components/GameLobby';
import GameBoard from './components/GameBoard';
import ProfileSetup from './components/ProfileSetup';
import WalletManager from './components/WalletManager';
import ProfilePage from './components/ProfilePage';
import AboutPage from './components/AboutPage';
import UserGuide from './components/UserGuide';
import { Toaster } from './components/ui/sonner';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { toast } from 'sonner';
import { GameMode } from './backend';

type View = 'dashboard' | 'lobby' | 'game' | 'wallet' | 'profile' | 'about' | 'guide';

export default function App() {
  const { identity, isInitializing: authInitializing, loginError: authError } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: initData, isLoading: initLoading, error: initError } = useAutomaticUserInitialization();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [currentGameMode, setCurrentGameMode] = useState<GameMode>('classic' as GameMode);
  const [retryCount, setRetryCount] = useState(0);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const isAuthenticated = !!identity;
  
  // Wait for auth initialization to complete before showing content
  const isLoading = authInitializing || (isAuthenticated && (actorFetching || initLoading));
  const hasError = authError || initError;

  // Show profile setup only when authenticated, profile is fetched, and profile is null
  useEffect(() => {
    if (isAuthenticated && profileFetched && !profileLoading && userProfile === null) {
      setShowProfileSetup(true);
    } else if (userProfile !== null) {
      setShowProfileSetup(false);
    }
  }, [isAuthenticated, userProfile, profileLoading, profileFetched]);

  // Display authentication errors
  useEffect(() => {
    if (authError && !authInitializing) {
      toast.error('Authentication Error', {
        description: authError.message || 'Failed to authenticate. Please try logging in manually.',
      });
    }
  }, [authError, authInitializing]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    window.location.reload();
  };

  const handleStartGame = (gameId: string, gameMode: GameMode) => {
    setCurrentGameId(gameId);
    setCurrentGameMode(gameMode);
    setCurrentView('game');
  };

  const handleBackFromGame = () => {
    setCurrentGameId(null);
    setCurrentView('lobby');
  };

  const handleProfileSetupComplete = () => {
    setShowProfileSetup(false);
    toast.success('Profile Created!', {
      description: 'Welcome to LudoVerse. Ready to play!',
    });
  };

  // Loading state - show while initializing authentication or loading user data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-xl text-white">
            {authInitializing ? 'Initializing...' : 'Loading LudoVerse...'}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {authInitializing ? 'Checking for saved session' : 'Connecting to the Internet Computer'}
          </p>
        </div>
      </div>
    );
  }

  // Error state - show if there's a critical error
  if (hasError && initError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-black/50 backdrop-blur-xl border-red-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-6 h-6" />
              Connection Error
            </CardTitle>
            <CardDescription>
              Unable to connect to the backend canister
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-300">
              {initError?.message || 'An unexpected error occurred'}
            </p>
            <div className="space-y-2">
              <p className="text-xs text-gray-400">Troubleshooting tips:</p>
              <ul className="text-xs text-gray-400 list-disc list-inside space-y-1">
                <li>Check your internet connection</li>
                <li>Verify the canister is deployed</li>
                <li>Try refreshing the page</li>
              </ul>
            </div>
            <Button
              onClick={handleRetry}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Profile setup flow - only show when authenticated and profile doesn't exist
  if (showProfileSetup && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900">
        <Header currentView={currentView} onNavigate={setCurrentView} />
        <main className="container mx-auto px-4 py-8">
          <ProfileSetup />
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    );
  }

  // Main application view
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900">
      {currentView !== 'game' && <Header currentView={currentView} onNavigate={setCurrentView} />}
      
      <main className={currentView === 'game' ? '' : 'container mx-auto px-4 py-8'}>
        {currentView === 'dashboard' && <Dashboard onNavigate={setCurrentView} />}
        {currentView === 'lobby' && (
          <GameLobby
            onStartGame={handleStartGame}
            onBack={() => setCurrentView('dashboard')}
          />
        )}
        {currentView === 'game' && currentGameId && (
          <GameBoard
            gameId={currentGameId}
            gameMode={currentGameMode}
            onBack={handleBackFromGame}
          />
        )}
        {currentView === 'wallet' && <WalletManager onBack={() => setCurrentView('dashboard')} />}
        {currentView === 'profile' && <ProfilePage onBack={() => setCurrentView('dashboard')} />}
        {currentView === 'about' && <AboutPage />}
        {currentView === 'guide' && <UserGuide />}
      </main>

      {currentView !== 'game' && <Footer />}
      <Toaster position="top-right" />
    </div>
  );
}
