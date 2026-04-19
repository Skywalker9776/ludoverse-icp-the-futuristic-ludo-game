import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreatePlayer } from "../hooks/useQueries";
import { PLAYER_COLORS } from "../types";
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

interface ProfileSetupProps {
  onComplete?: () => void;
}

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>(
    PLAYER_COLORS[0].value,
  );
  const createPlayer = useCreatePlayer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your player name");
      return;
    }
    if (name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    if (name.trim().length > 20) {
      toast.error("Name must be 20 characters or less");
      return;
    }

    try {
      await createPlayer.mutateAsync({
        name: name.trim(),
        color: selectedColor,
      });
      toast.success("Profile Created!", {
        description: "Welcome to LudoVerse ICP. Ready to dominate!",
        duration: 4000,
      });
      onComplete?.();
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message?.includes("already exists")) {
        toast.info("Profile already exists. Refreshing...");
        window.location.reload();
      } else {
        toast.error("Failed to create profile", {
          description: err.message || "Please try again.",
        });
      }
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-[70vh]"
      data-ocid="profile_setup.page"
    >
      <div className="w-full max-w-md space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <img
            src="/assets/generated/ludoverse-logo-transparent.dim_200x200.png"
            alt="LudoVerse"
            className="w-20 h-20 mx-auto drop-shadow-[0_0_20px_rgba(168,85,247,0.6)] animate-glow-pulse"
          />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-cyan-400 bg-clip-text text-transparent">
            Welcome to LudoVerse
          </h1>
          <p className="text-muted-foreground text-sm">
            Create your legend. Pick your colors. Start your journey.
          </p>
        </div>

        <Card className="bg-card border-primary/20 shadow-glow-purple">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-foreground flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Create Your Profile
            </CardTitle>
            <CardDescription>
              Choose your identity for the LudoVerse arena
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name input */}
              <div className="space-y-2">
                <Label htmlFor="player-name" className="text-sm font-medium">
                  Player Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="player-name"
                  data-ocid="profile_setup.name_input"
                  type="text"
                  placeholder="Enter your battle name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={20}
                  className="bg-white/5 border-white/10 focus:border-primary/60 text-foreground placeholder:text-muted-foreground"
                  disabled={createPlayer.isPending}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground text-right">
                  {name.length}/20
                </p>
              </div>

              {/* Color picker */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Choose Your Neon Color
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {PLAYER_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      data-ocid={`profile_setup.color_${color.name.toLowerCase().replace(/\s+/g, "_")}`}
                      onClick={() => setSelectedColor(color.value)}
                      disabled={createPlayer.isPending}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 group ${
                        selectedColor === color.value
                          ? "border-white scale-105"
                          : "border-white/10 hover:border-white/40 hover:scale-102"
                      } ${createPlayer.isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      style={{
                        backgroundColor: `${color.value}20`,
                        boxShadow:
                          selectedColor === color.value
                            ? `0 0 20px ${color.value}60, 0 0 40px ${color.value}30`
                            : "none",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-full mx-auto shadow-lg"
                        style={{
                          backgroundColor: color.value,
                          boxShadow: `0 0 12px ${color.value}80`,
                        }}
                      />
                      <p
                        className="text-xs mt-2 text-center font-medium truncate"
                        style={{
                          color:
                            selectedColor === color.value
                              ? color.value
                              : undefined,
                        }}
                      >
                        {color.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {name.trim() && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg shrink-0"
                    style={{
                      backgroundColor: selectedColor,
                      boxShadow: `0 0 15px ${selectedColor}80`,
                    }}
                  >
                    {name.trim()[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {name.trim()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      LudoVerse Player
                    </p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                data-ocid="profile_setup.submit_button"
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-glow-purple text-white font-bold py-6 text-base"
                disabled={createPlayer.isPending || !name.trim()}
              >
                {createPlayer.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Your Legend...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Enter the Arena
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
