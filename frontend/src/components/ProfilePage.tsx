import React, { useState } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ArrowLeft, User, Trophy, TrendingUp, TrendingDown, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface ProfilePageProps {
  onBack: () => void;
}

const PLAYER_COLORS = [
  { name: 'Neon Purple', value: '#a855f7' },
  { name: 'Cyber Pink', value: '#ec4899' },
  { name: 'Electric Blue', value: '#3b82f6' },
  { name: 'Toxic Green', value: '#22c55e' },
  { name: 'Solar Orange', value: '#f97316' },
  { name: 'Plasma Red', value: '#ef4444' },
];

export default function ProfilePage({ onBack }: ProfilePageProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userProfile?.name || '');
  const [editColor, setEditColor] = useState(userProfile?.color || '#a855f7');

  const handleEdit = () => {
    setEditName(userProfile?.name || '');
    setEditColor(userProfile?.color || '#a855f7');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(userProfile?.name || '');
    setEditColor(userProfile?.color || '#a855f7');
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    if (!userProfile) return;

    try {
      await saveProfile.mutateAsync({
        ...userProfile,
        name: editName.trim(),
        color: editColor,
      });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const winRate = userProfile && userProfile.gamesPlayed > 0
    ? ((userProfile.wins / userProfile.gamesPlayed) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Player Profile
        </h2>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Info
                </span>
                {!isEditing ? (
                  <Button variant="ghost" size="icon" onClick={handleEdit}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={handleCancel}>
                      <X className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleSave} disabled={saveProfile.isPending}>
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div 
                  className="w-24 h-24 rounded-full border-4 flex items-center justify-center text-4xl font-bold"
                  style={{ 
                    backgroundColor: isEditing ? editColor + '40' : userProfile?.color + '40',
                    borderColor: isEditing ? editColor : userProfile?.color 
                  }}
                >
                  {isEditing ? editName.charAt(0).toUpperCase() : userProfile?.name.charAt(0).toUpperCase()}
                </div>
                {userProfile?.isPremium && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50">
                    <img 
                      src="/assets/generated/premium-badge-transparent.dim_100x100.png" 
                      alt="Premium" 
                      className="w-5 h-5"
                    />
                    <span className="text-sm font-medium text-yellow-400">Premium Member</span>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Player Name</Label>
                    <Input
                      id="edit-name"
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      maxLength={20}
                      className="bg-white/5 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Player Color</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {PLAYER_COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setEditColor(color.value)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            editColor === color.value
                              ? 'border-white scale-105'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                          style={{ backgroundColor: color.value + '40' }}
                        >
                          <div
                            className="w-6 h-6 rounded-full mx-auto"
                            style={{ backgroundColor: color.value }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="text-xl font-bold">{userProfile?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Color</p>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white/30"
                        style={{ backgroundColor: userProfile?.color }}
                      />
                      <p className="text-sm">{PLAYER_COLORS.find(c => c.value === userProfile?.color)?.name || 'Custom'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="text-xl font-bold text-cyan-400">{userProfile?.icpBalance.toFixed(2)} ICP</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Games Played
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold">{userProfile?.gamesPlayed || 0}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/20 to-cyan-500/20 border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Win Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-green-400">{winRate}%</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-black/40 backdrop-blur-xl border-cyan-500/30">
            <CardHeader>
              <CardTitle>Game Statistics</CardTitle>
              <CardDescription>Your performance overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-green-400">{userProfile?.wins || 0}</p>
                  <p className="text-sm text-muted-foreground">Wins</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <TrendingDown className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-red-400">{userProfile?.losses || 0}</p>
                  <p className="text-sm text-muted-foreground">Losses</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-yellow-400">{userProfile?.draws || 0}</p>
                  <p className="text-sm text-muted-foreground">Draws</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <span className="text-sm text-muted-foreground">Account Created</span>
                <span className="text-sm font-medium">
                  {userProfile?.createdAt ? new Date(Number(userProfile.createdAt) / 1000000).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <span className="text-sm text-muted-foreground">Last Active</span>
                <span className="text-sm font-medium">
                  {userProfile?.lastActive ? new Date(Number(userProfile.lastActive) / 1000000).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <span className="text-sm text-muted-foreground">Account Status</span>
                <span className="text-sm font-medium text-green-400">Active</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
