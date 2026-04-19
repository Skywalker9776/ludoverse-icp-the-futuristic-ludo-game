import React, { useState } from 'react';
import { useGetCallerUserProfile, useGetPlayerWallet, useCreateGame, useGetAvailableGames, useGetAvailableBots, useGetAvailableRooms, useCreateRoom, useJoinRoom, useLeaveRoom } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { ArrowLeft, Plus, Users, Loader2, Gamepad2, Sparkles, Zap, Trophy, Clock, Target, Copy, Lock, Globe, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { GameMode, RankedStatus, RoomType } from '../backend';
import { Principal } from '@icp-sdk/core/principal';

interface GameLobbyProps {
  onStartGame: (gameId: string, gameMode: GameMode) => void;
  onBack: () => void;
}

const GAME_MODES = [
  { 
    value: 'classic' as GameMode, 
    label: 'Classic Mode', 
    description: 'Traditional Ludo rules',
    details: '2-4 players • No power-ups • Ranked & unranked',
    icon: Gamepad2,
    supportsRanked: true,
  },
  { 
    value: 'quick' as GameMode, 
    label: 'Quick Mode', 
    description: 'Shortened paths, faster dice',
    details: 'Time-limited turns • Mobile-optimized • Ranked & unranked',
    icon: Zap,
    supportsRanked: true,
  },
  { 
    value: 'master' as GameMode, 
    label: 'Master Mode', 
    description: 'Skill-heavy rules',
    details: 'Dice choice options • Advanced strategy',
    icon: Target,
    supportsRanked: false,
  },
];

export default function GameLobby({ onStartGame, onBack }: GameLobbyProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: wallet } = useGetPlayerWallet();
  const createGame = useCreateGame();
  const { data: availableGames, isLoading: gamesLoading } = useGetAvailableGames();
  const { data: availableBots, isLoading: botsLoading } = useGetAvailableBots();
  const { data: availableRooms, isLoading: roomsLoading } = useGetAvailableRooms();
  const createRoom = useCreateRoom();
  const joinRoom = useJoinRoom();
  const leaveRoom = useLeaveRoom();

  const [gameType, setGameType] = useState<'live' | 'demo'>('demo');
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic' as GameMode);
  const [betAmount, setBetAmount] = useState<string>('10');
  const [isRanked, setIsRanked] = useState<boolean>(true);
  const [virtualBalance] = useState(10000);
  const [lobbyView, setLobbyView] = useState<'quick' | 'rooms'>('quick');
  const [roomType, setRoomType] = useState<'public' | 'private'>('public');
  const [privateRoomCode, setPrivateRoomCode] = useState<string>('');
  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [createdRoomId, setCreatedRoomId] = useState<string>('');

  const selectedModeInfo = GAME_MODES.find(m => m.value === selectedMode);

  const handleCreateGame = async () => {
    const amount = parseFloat(betAmount);
    const isDemo = gameType === 'demo';
    
    if (isNaN(amount) || amount < 1) {
      toast.error('Invalid Bet Amount', {
        description: 'Minimum bet is 1 ICP',
      });
      return;
    }
    
    if (amount > 1000000) {
      toast.error('Invalid Bet Amount', {
        description: 'Maximum bet is 1,000,000 ICP',
      });
      return;
    }

    if (!isDemo) {
      if (wallet && amount > wallet.balance) {
        toast.error('Insufficient Balance', {
          description: `You need ${amount.toFixed(2)} ICP but only have ${wallet.balance.toFixed(2)} ICP`,
        });
        return;
      }
    } else {
      if (amount > virtualBalance) {
        toast.error('Insufficient Virtual Balance', {
          description: `You need ${amount.toFixed(2)} virtual ICP but only have ${virtualBalance.toFixed(2)} virtual ICP`,
        });
        return;
      }
    }

    try {
      const modeLabel = isDemo ? 'Demo' : 'Live';
      const rankedLabel = isRanked && !isDemo && selectedModeInfo?.supportsRanked ? 'Ranked' : 'Unranked';
      
      toast.info(`Creating ${modeLabel} Game...`, {
        description: `Setting up ${selectedModeInfo?.label || selectedMode} (${rankedLabel})`,
        duration: 2000,
      });

      const rankedStatus: RankedStatus = (isRanked && !isDemo && selectedModeInfo?.supportsRanked) 
        ? 'ranked' as RankedStatus 
        : 'unranked' as RankedStatus;

      const gameId = await createGame.mutateAsync({
        gameMode: selectedMode,
        rankedStatus: rankedStatus,
        betAmount: amount,
        isDemo: isDemo,
      });

      toast.success(`${modeLabel} Game Created Successfully!`, {
        description: `Starting ${selectedModeInfo?.label || selectedMode} (${rankedLabel})`,
        duration: 3000,
      });

      setTimeout(() => {
        onStartGame(gameId.toString(), selectedMode);
      }, 500);
    } catch (error: any) {
      console.error('Create game error:', error);
      const errorMessage = error.message || 'An error occurred while creating the game.';
      toast.error('Failed to Create Game', {
        description: errorMessage,
        duration: 5000,
      });
    }
  };

  const handleCreateRoom = async () => {
    const isDemo = gameType === 'demo';
    const isPublic = roomType === 'public';
    
    try {
      toast.info(`Creating ${isPublic ? 'Public' : 'Private'} Room...`, {
        description: 'Setting up matchmaking room',
      });

      const roomId = await createRoom.mutateAsync({
        roomType: isPublic ? 'isPublic' as RoomType : 'privateRoom' as RoomType,
        gameMode: selectedMode,
        maxPlayers: maxPlayers,
        isDemo: isDemo,
      });

      const roomCode = roomId.toString().slice(0, 8).toUpperCase();
      setCreatedRoomId(roomId.toString());
      
      if (!isPublic) {
        toast.success('Private Room Created!', {
          description: `Room Code: ${roomCode}`,
          duration: 5000,
        });
        setPrivateRoomCode(roomCode);
      } else {
        toast.success('Public Room Created!', {
          description: 'Waiting for players to join...',
          duration: 3000,
        });
      }
    } catch (error: any) {
      console.error('Create room error:', error);
      toast.error('Failed to Create Room', {
        description: error.message || 'An error occurred',
        duration: 5000,
      });
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      toast.info('Joining Room...', {
        description: 'Connecting to matchmaking room',
      });

      await joinRoom.mutateAsync(Principal.fromText(roomId));

      toast.success('Joined Room!', {
        description: 'Waiting for game to start...',
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Join room error:', error);
      toast.error('Failed to Join Room', {
        description: error.message || 'Room may be full or unavailable',
        duration: 5000,
      });
    }
  };

  const handleJoinPrivateRoom = async () => {
    if (!privateRoomCode.trim()) {
      toast.error('Invalid Room Code', {
        description: 'Please enter a valid room code',
      });
      return;
    }

    try {
      // Find room by matching the code prefix
      const room = availableRooms?.find(r => 
        r.id.toString().slice(0, 8).toUpperCase() === privateRoomCode.toUpperCase()
      );

      if (!room) {
        toast.error('Room Not Found', {
          description: 'No room found with that code',
        });
        return;
      }

      await handleJoinRoom(room.id.toString());
    } catch (error: any) {
      console.error('Join private room error:', error);
      toast.error('Failed to Join Room', {
        description: error.message || 'An error occurred',
      });
    }
  };

  const handleLeaveRoom = async (roomId: string) => {
    try {
      await leaveRoom.mutateAsync(Principal.fromText(roomId));
      toast.success('Left Room', {
        description: 'You have left the matchmaking room',
      });
      setCreatedRoomId('');
      setPrivateRoomCode('');
    } catch (error: any) {
      console.error('Leave room error:', error);
      toast.error('Failed to Leave Room', {
        description: error.message || 'An error occurred',
      });
    }
  };

  const handleCopyRoomCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Room Code Copied!', {
      description: 'Share this code with friends',
    });
  };

  const publicRooms = availableRooms?.filter(r => r.roomType === RoomType.isPublic) || [];
  const privateRooms = availableRooms?.filter(r => r.roomType === RoomType.privateRoom) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-white border-white/30">
              {userProfile?.name || 'Player'}
            </Badge>
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
              {gameType === 'demo' ? `${virtualBalance.toFixed(2)} Virtual ICP` : `${wallet?.balance.toFixed(2) || '0.00'} ICP`}
            </Badge>
          </div>
        </div>

        <Card className="bg-black/60 backdrop-blur-xl border-purple-500/30 mb-6">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Game Lobby
            </CardTitle>
            <CardDescription className="text-gray-300">
              Choose your game mode and start playing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={lobbyView} onValueChange={(v) => setLobbyView(v as 'quick' | 'rooms')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="quick" className="gap-2">
                  <Zap className="w-4 h-4" />
                  Quick Start
                </TabsTrigger>
                <TabsTrigger value="rooms" className="gap-2">
                  <Users className="w-4 h-4" />
                  Matchmaking Rooms
                </TabsTrigger>
              </TabsList>

              <TabsContent value="quick" className="space-y-6">
                {/* Game Type Selection */}
                <div className="space-y-3">
                  <Label className="text-white text-lg">Game Type</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Card
                      className={`cursor-pointer transition-all ${
                        gameType === 'demo'
                          ? 'border-cyan-500 bg-cyan-500/10 shadow-glow-cyan'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => setGameType('demo')}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-cyan-400" />
                        <div>
                          <p className="font-semibold text-white">Demo Mode</p>
                          <p className="text-xs text-gray-400">Practice with virtual currency</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card
                      className={`cursor-pointer transition-all ${
                        gameType === 'live'
                          ? 'border-yellow-500 bg-yellow-500/10 shadow-glow-yellow'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => setGameType('live')}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <Trophy className="w-6 h-6 text-yellow-400" />
                        <div>
                          <p className="font-semibold text-white">Live Mode</p>
                          <p className="text-xs text-gray-400">Play with real ICP</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Game Mode Selection */}
                <div className="space-y-3">
                  <Label className="text-white text-lg">Game Mode</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {GAME_MODES.map((mode) => {
                      const Icon = mode.icon;
                      return (
                        <Card
                          key={mode.value}
                          className={`cursor-pointer transition-all ${
                            selectedMode === mode.value
                              ? 'border-purple-500 bg-purple-500/10 shadow-glow-purple'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                          onClick={() => setSelectedMode(mode.value)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3 mb-2">
                              <Icon className="w-6 h-6 text-purple-400 flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-white">{mode.label}</p>
                                <p className="text-xs text-gray-400 mt-1">{mode.description}</p>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{mode.details}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Bet Amount */}
                <div className="space-y-3">
                  <Label htmlFor="betAmount" className="text-white text-lg">
                    Bet Amount ({gameType === 'demo' ? 'Virtual' : 'Real'} ICP)
                  </Label>
                  <Input
                    id="betAmount"
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    min="1"
                    max="1000000"
                    className="bg-black/40 border-gray-600 text-white"
                    placeholder="Enter bet amount"
                  />
                </div>

                {/* Ranked Toggle */}
                {gameType === 'live' && selectedModeInfo?.supportsRanked && (
                  <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-gray-600">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <div>
                        <p className="text-white font-semibold">Ranked Match</p>
                        <p className="text-xs text-gray-400">Affects your competitive rating</p>
                      </div>
                    </div>
                    <Switch checked={isRanked} onCheckedChange={setIsRanked} />
                  </div>
                )}

                <Button
                  onClick={handleCreateGame}
                  disabled={createGame.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6 text-lg shadow-glow-purple"
                >
                  {createGame.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Game...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Create Game
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="rooms" className="space-y-6">
                {/* Room Type Selection */}
                <div className="space-y-3">
                  <Label className="text-white text-lg">Room Type</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Card
                      className={`cursor-pointer transition-all ${
                        roomType === 'public'
                          ? 'border-green-500 bg-green-500/10 shadow-glow-green'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => setRoomType('public')}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <Globe className="w-6 h-6 text-green-400" />
                        <div>
                          <p className="font-semibold text-white">Public Room</p>
                          <p className="text-xs text-gray-400">Anyone can join</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card
                      className={`cursor-pointer transition-all ${
                        roomType === 'private'
                          ? 'border-orange-500 bg-orange-500/10 shadow-glow-yellow'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => setRoomType('private')}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <Lock className="w-6 h-6 text-orange-400" />
                        <div>
                          <p className="font-semibold text-white">Private Room</p>
                          <p className="text-xs text-gray-400">Invite-only with code</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Game Mode Selection for Rooms */}
                <div className="space-y-3">
                  <Label className="text-white text-lg">Game Mode</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {GAME_MODES.map((mode) => {
                      const Icon = mode.icon;
                      return (
                        <Card
                          key={mode.value}
                          className={`cursor-pointer transition-all ${
                            selectedMode === mode.value
                              ? 'border-purple-500 bg-purple-500/10 shadow-glow-purple'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                          onClick={() => setSelectedMode(mode.value)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Icon className="w-5 h-5 text-purple-400 flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-white text-sm">{mode.label}</p>
                                <p className="text-xs text-gray-400 mt-1">{mode.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Max Players */}
                <div className="space-y-3">
                  <Label htmlFor="maxPlayers" className="text-white text-lg">
                    Maximum Players
                  </Label>
                  <Input
                    id="maxPlayers"
                    type="number"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(Math.min(6, Math.max(2, parseInt(e.target.value) || 2)))}
                    min="2"
                    max="6"
                    className="bg-black/40 border-gray-600 text-white"
                  />
                </div>

                <Button
                  onClick={handleCreateRoom}
                  disabled={createRoom.isPending}
                  className="w-full bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white font-bold py-6 text-lg shadow-glow-green"
                >
                  {createRoom.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Room...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Create {roomType === 'public' ? 'Public' : 'Private'} Room
                    </>
                  )}
                </Button>

                {/* Created Room Display */}
                {createdRoomId && roomType === 'private' && (
                  <Card className="bg-orange-500/10 border-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold mb-1">Your Private Room</p>
                          <p className="text-2xl font-bold text-orange-400">{privateRoomCode}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyRoomCode(privateRoomCode)}
                            className="border-orange-500 text-orange-400 hover:bg-orange-500/20"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleLeaveRoom(createdRoomId)}
                          >
                            Leave
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Join Private Room */}
                {roomType === 'private' && !createdRoomId && (
                  <div className="space-y-3">
                    <Label className="text-white text-lg">Join Private Room</Label>
                    <div className="flex gap-2">
                      <Input
                        value={privateRoomCode}
                        onChange={(e) => setPrivateRoomCode(e.target.value.toUpperCase())}
                        placeholder="Enter room code"
                        className="bg-black/40 border-gray-600 text-white uppercase"
                        maxLength={8}
                      />
                      <Button
                        onClick={handleJoinPrivateRoom}
                        disabled={joinRoom.isPending || !privateRoomCode.trim()}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        {joinRoom.isPending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <LogIn className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Public Rooms List */}
                {roomType === 'public' && (
                  <div className="space-y-3">
                    <Label className="text-white text-lg">Available Public Rooms</Label>
                    {roomsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                      </div>
                    ) : publicRooms.length === 0 ? (
                      <Card className="bg-black/40 border-gray-600">
                        <CardContent className="p-8 text-center">
                          <Users className="w-12 h-12 mx-auto text-gray-500 mb-3" />
                          <p className="text-gray-400">No public rooms available</p>
                          <p className="text-sm text-gray-500 mt-1">Create one to get started!</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                        {publicRooms.map((room) => (
                          <Card key={room.id.toString()} className="bg-black/40 border-gray-600 hover:border-green-500 transition-all">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <p className="text-white font-semibold">{room.gameMode}</p>
                                  <p className="text-xs text-gray-400">
                                    {Number(room.playerCount)}/{Number(room.maxPlayers)} players
                                  </p>
                                </div>
                                <Badge variant={room.isDemo ? 'secondary' : 'default'}>
                                  {room.isDemo ? 'Demo' : 'Live'}
                                </Badge>
                              </div>
                              <Button
                                onClick={() => handleJoinRoom(room.id.toString())}
                                disabled={joinRoom.isPending || Number(room.playerCount) >= Number(room.maxPlayers)}
                                className="w-full bg-green-600 hover:bg-green-700"
                                size="sm"
                              >
                                {joinRoom.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Join Room
                                  </>
                                )}
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
