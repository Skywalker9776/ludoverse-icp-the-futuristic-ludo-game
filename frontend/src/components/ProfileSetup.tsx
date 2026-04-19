import React, { useState } from 'react';
import { useCreatePlayer } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const PLAYER_COLORS = [
  { name: 'Neon Purple', value: '#a855f7' },
  { name: 'Cyber Pink', value: '#ec4899' },
  { name: 'Electric Blue', value: '#3b82f6' },
  { name: 'Toxic Green', value: '#22c55e' },
  { name: 'Solar Orange', value: '#f97316' },
  { name: 'Plasma Red', value: '#ef4444' },
];

export default function ProfileSetup() {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PLAYER_COLORS[0].value);
  const createPlayer = useCreatePlayer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (name.trim().length < 2) {
      toast.error('Name must be at least 2 characters long');
      return;
    }

    if (name.trim().length > 20) {
      toast.error('Name must be 20 characters or less');
      return;
    }

    try {
      await createPlayer.mutateAsync({ name: name.trim(), color: selectedColor });
      toast.success('Profile Created Successfully!', {
        description: 'Welcome to LudoVerse ICP! You can now start playing.',
        duration: 4000,
      });
    } catch (error: any) {
      console.error('Profile creation error:', error);
      
      // Handle specific error cases
      if (error.message && error.message.includes('already exists')) {
        toast.error('Profile Already Exists', {
          description: 'Your profile has already been created. Refreshing...',
          duration: 3000,
        });
        // Force refresh to update the UI
        window.location.reload();
      } else {
        const errorMessage = error.message || 'An error occurred while creating your profile.';
        toast.error('Failed to Create Profile', {
          description: errorMessage,
          duration: 5000,
        });
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-purple-500/30">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Welcome to LudoVerse ICP
          </CardTitle>
          <CardDescription>Create your player profile to start playing</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Player Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                className="bg-white/5 border-white/10"
                disabled={createPlayer.isPending}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                {name.length}/20 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label>Choose Your Color</Label>
              <div className="grid grid-cols-3 gap-3">
                {PLAYER_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    disabled={createPlayer.isPending}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedColor === color.value
                        ? 'border-white scale-105 shadow-lg'
                        : 'border-white/20 hover:border-white/40'
                    } ${createPlayer.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{ backgroundColor: color.value + '40' }}
                  >
                    <div
                      className="w-8 h-8 rounded-full mx-auto"
                      style={{ backgroundColor: color.value }}
                    />
                    <p className="text-xs mt-2 text-center">{color.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={createPlayer.isPending || !name.trim()}
            >
              {createPlayer.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                'Create Profile'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
