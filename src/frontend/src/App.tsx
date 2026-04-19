import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { AlertCircle, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { createActor } from "./backend";
import type { GameMode } from "./backend";
import AboutPage from "./components/AboutPage";
import Dashboard from "./components/Dashboard";
import Footer from "./components/Footer";
import GameBoard from "./components/GameBoard";
import GameLobby from "./components/GameLobby";
import Header from "./components/Header";
import ProfilePage from "./components/ProfilePage";
import ProfileSetup from "./components/ProfileSetup";
import UserGuide from "./components/UserGuide";
import WalletManager from "./components/WalletManager";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Toaster } from "./components/ui/sonner";
import {
  useAutomaticUserInitialization,
  useGetCallerUserProfile,
} from "./hooks/useQueries";
import type { View } from "./types";

export default function App() {
  const { identity, isInitializing: authInitializing } = useInternetIdentity();
  const { isFetching: actorFetching } = useActor(createActor);
  const { isLoading: initLoading, error: initError } =
    useAutomaticUserInitialization();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [currentGameMode, setCurrentGameMode] = useState<GameMode>(
    "classic" as GameMode,
  );
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const isAuthenticated = !!identity;
  const isLoading =
    authInitializing || (isAuthenticated && (actorFetching || initLoading));

  // Trigger profile setup when authenticated and no profile exists
  useEffect(() => {
    if (
      isAuthenticated &&
      profileFetched &&
      !profileLoading &&
      userProfile === null
    ) {
      setShowProfileSetup(true);
    } else if (userProfile !== null && userProfile !== undefined) {
      setShowProfileSetup(false);
    }
  }, [isAuthenticated, userProfile, profileLoading, profileFetched]);

  const handleStartGame = (gameId: string, gameMode: GameMode) => {
    setCurrentGameId(gameId);
    setCurrentGameMode(gameMode);
    setCurrentView("game");
  };

  const handleBackFromGame = () => {
    setCurrentGameId(null);
    setCurrentView("lobby");
  };

  const handleProfileSetupComplete = () => {
    setShowProfileSetup(false);
    toast.success("Profile Created!", {
      description: "Welcome to LudoVerse. Ready to play!",
    });
  };

  const handleRetry = () => window.location.reload();

  if (isLoading) {
    return (
      <div
        className="min-h-screen"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, oklch(0.20 0.15 290) 0%, oklch(0.08 0.01 270) 60%)",
        }}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
              <Loader2 className="w-24 h-24 animate-spin text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {authInitializing
                ? "Initializing LudoVerse..."
                : "Connecting to the Internet Computer..."}
            </p>
            <p className="text-sm text-muted-foreground">
              {authInitializing
                ? "Checking saved session"
                : "Loading your game data"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, oklch(0.20 0.15 290) 0%, oklch(0.08 0.01 270) 60%)",
        }}
      >
        <Card className="max-w-md w-full bg-card border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-6 h-6" />
              Connection Error
            </CardTitle>
            <CardDescription>
              Unable to connect to the backend canister
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {initError?.message || "An unexpected error occurred"}
            </p>
            <Button
              onClick={handleRetry}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showProfileSetup && isAuthenticated) {
    return (
      <div
        className="min-h-screen"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, oklch(0.20 0.15 290) 0%, oklch(0.08 0.01 270) 60%)",
        }}
      >
        <Header currentView={currentView} onNavigate={setCurrentView} />
        <main className="container mx-auto px-4 py-8">
          <ProfileSetup onComplete={handleProfileSetupComplete} />
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, oklch(0.18 0.12 290) 0%, oklch(0.08 0.01 270) 70%)",
      }}
    >
      {currentView !== "game" && (
        <Header currentView={currentView} onNavigate={setCurrentView} />
      )}
      <main
        className={`flex-1 ${currentView === "game" ? "" : "container mx-auto px-4 py-8"}`}
      >
        {currentView === "dashboard" && (
          <Dashboard onNavigate={setCurrentView} />
        )}
        {currentView === "lobby" && (
          <GameLobby
            onStartGame={handleStartGame}
            onBack={() => setCurrentView("dashboard")}
          />
        )}
        {currentView === "game" && currentGameId && (
          <GameBoard
            gameId={currentGameId}
            gameMode={currentGameMode}
            onBack={handleBackFromGame}
          />
        )}
        {currentView === "wallet" && (
          <WalletManager onBack={() => setCurrentView("dashboard")} />
        )}
        {currentView === "profile" && (
          <ProfilePage onBack={() => setCurrentView("dashboard")} />
        )}
        {currentView === "about" && <AboutPage />}
        {currentView === "guide" && <UserGuide />}
      </main>
      {currentView !== "game" && <Footer />}
      <Toaster position="top-right" />
    </div>
  );
}
