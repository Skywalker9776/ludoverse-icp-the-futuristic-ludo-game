import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ArrowLeft, Sparkles, Bot, Clock, Target, Wifi, WifiOff, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ChatPanel from './ChatPanel';
import { useGetGame, useRollDice } from '../hooks/useQueries';
import { useReconnect } from '../hooks/useReconnect';
import { useOptimisticState } from '../hooks/useOptimisticState';
import { useGameStateSync } from '../hooks/useGameStateSync';
import { Principal } from '@icp-sdk/core/principal';
import { GameMode } from '../backend';

interface GameBoardProps {
  gameId: string;
  gameMode: GameMode;
  onBack: () => void;
}

interface GamePiece {
  id: number;
  position: number;
  isInHome: boolean;
  isFinished: boolean;
}

interface Player {
  id: string;
  name: string;
  color: string;
  colorHex: string;
  isAI?: boolean;
  pieces: GamePiece[];
}

const SAFE_POSITIONS = [0, 8, 13, 21, 26, 34, 39, 47];

// Quick Mode: 30-40% shorter path (52 -> ~35 tiles)
const QUICK_MODE_PATH_LENGTH = 35;
const CLASSIC_MODE_PATH_LENGTH = 52;

// 3D Board Component
function Board3D({ gameMode }: { gameMode: GameMode }) {
  const boardTexture = useRef<THREE.Texture | null>(null);
  const pathLength = gameMode === 'quick' ? QUICK_MODE_PATH_LENGTH : CLASSIC_MODE_PATH_LENGTH;

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load('/assets/generated/casino-bg.dim_1920x1080.png', (texture) => {
      boardTexture.current = texture;
    });
  }, []);

  // Calculate tile positions based on path length
  const tileSize = gameMode === 'quick' ? 0.5 : 0.35;
  const boardScale = gameMode === 'quick' ? 12 : 15;

  return (
    <group position={[0, 0, 0]}>
      {/* Main board base with depth */}
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[boardScale, 0.4, boardScale]} />
        <meshStandardMaterial
          color="#1a0a2e"
          metalness={0.8}
          roughness={0.2}
          emissive="#6b21a8"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Board surface */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[boardScale, boardScale]} />
        <meshStandardMaterial
          color="#0f0520"
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Home bases - Red (top-left) */}
      <mesh position={[-4.5, 0.05, -4.5]} receiveShadow>
        <boxGeometry args={[4, 0.1, 4]} />
        <meshStandardMaterial
          color="#dc2626"
          metalness={0.7}
          roughness={0.3}
          emissive="#dc2626"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Green (top-right) */}
      <mesh position={[4.5, 0.05, -4.5]} receiveShadow>
        <boxGeometry args={[4, 0.1, 4]} />
        <meshStandardMaterial
          color="#16a34a"
          metalness={0.7}
          roughness={0.3}
          emissive="#16a34a"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Yellow (bottom-left) */}
      <mesh position={[-4.5, 0.05, 4.5]} receiveShadow>
        <boxGeometry args={[4, 0.1, 4]} />
        <meshStandardMaterial
          color="#eab308"
          metalness={0.7}
          roughness={0.3}
          emissive="#eab308"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Blue (bottom-right) */}
      <mesh position={[4.5, 0.05, 4.5]} receiveShadow>
        <boxGeometry args={[4, 0.1, 4]} />
        <meshStandardMaterial
          color="#2563eb"
          metalness={0.7}
          roughness={0.3}
          emissive="#2563eb"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Path tiles - simplified for Quick Mode */}
      {Array.from({ length: pathLength }).map((_, i) => {
        const angle = (i / pathLength) * Math.PI * 2;
        const radius = 5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const isSafe = SAFE_POSITIONS.includes(i);

        return (
          <mesh key={i} position={[x, 0.1, z]} receiveShadow castShadow>
            <cylinderGeometry args={[tileSize, tileSize, 0.15, 16]} />
            <meshStandardMaterial
              color={isSafe ? '#fbbf24' : '#4b5563'}
              metalness={0.6}
              roughness={0.4}
              emissive={isSafe ? '#fbbf24' : '#374151'}
              emissiveIntensity={isSafe ? 0.4 : 0.1}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// 3D Dice Component with physics-based animation
function Dice3D({ value, isRolling, onRollComplete }: { value: number; isRolling: boolean; onRollComplete: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0, z: 0 });
  const rollTimeRef = useRef(0);

  useEffect(() => {
    if (isRolling) {
      setVelocity({
        x: (Math.random() - 0.5) * 0.3,
        y: (Math.random() - 0.5) * 0.3,
        z: (Math.random() - 0.5) * 0.3,
      });
      rollTimeRef.current = 0;
    }
  }, [isRolling]);

  useFrame((state, delta) => {
    if (meshRef.current && isRolling) {
      rollTimeRef.current += delta;

      const damping = 0.95;
      const newVelocity = {
        x: velocity.x * damping,
        y: velocity.y * damping,
        z: velocity.z * damping,
      };
      setVelocity(newVelocity);

      const newRotation = {
        x: rotation.x + newVelocity.x,
        y: rotation.y + newVelocity.y,
        z: rotation.z + newVelocity.z,
      };
      setRotation(newRotation);

      meshRef.current.rotation.x = newRotation.x;
      meshRef.current.rotation.y = newRotation.y;
      meshRef.current.rotation.z = newRotation.z;

      if (rollTimeRef.current > 1.5 && Math.abs(newVelocity.x) < 0.01) {
        onRollComplete();
      }
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 2, 0]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="#ffffff"
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  );
}

// 3D Token Component
function Token3D({ position, color, onClick, isOptimistic }: { 
  position: [number, number, number]; 
  color: string; 
  onClick?: () => void;
  isOptimistic?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + (hovered ? 0.3 : 0) + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
    >
      <cylinderGeometry args={[0.3, 0.3, 0.4, 16]} />
      <meshStandardMaterial
        color={color}
        metalness={0.7}
        roughness={0.3}
        emissive={color}
        emissiveIntensity={hovered ? 0.5 : 0.2}
        opacity={isOptimistic ? 0.7 : 1}
        transparent={isOptimistic}
      />
    </mesh>
  );
}

// Scene Component
function Scene({ gameMode, diceValue, isRolling, onRollComplete, players, onTokenClick, optimisticMoves }: {
  gameMode: GameMode;
  diceValue: number;
  isRolling: boolean;
  onRollComplete: () => void;
  players: Player[];
  onTokenClick: (playerId: string, pieceId: number) => void;
  optimisticMoves: Set<string>;
}) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 15, 15]} fov={50} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={10}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2.2}
      />

      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.8} color="#a855f7" />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#ec4899" />

      <Board3D gameMode={gameMode} />
      <Dice3D value={diceValue} isRolling={isRolling} onRollComplete={onRollComplete} />

      {players.map((player) =>
        player.pieces.map((piece) => {
          if (piece.isFinished) return null;
          const angle = (piece.position / 52) * Math.PI * 2;
          const radius = 5;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const moveKey = `${player.id}-${piece.id}`;
          return (
            <Token3D
              key={moveKey}
              position={[x, 0.5, z]}
              color={player.colorHex}
              onClick={() => onTokenClick(player.id, piece.id)}
              isOptimistic={optimisticMoves.has(moveKey)}
            />
          );
        })
      )}

      <Environment preset="night" />
    </>
  );
}

// Quick Mode Timer Component
function QuickModeTimer({ timeLeft, totalTime }: { timeLeft: number; totalTime: number }) {
  const percentage = (timeLeft / totalTime) * 100;
  const isLowTime = timeLeft <= 10;

  return (
    <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 ${isLowTime ? 'animate-pulse' : ''}`}>
      <Card className={`bg-black/80 backdrop-blur-xl border-2 ${isLowTime ? 'border-red-500' : 'border-cyan-500'} min-w-[200px]`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Clock className={`w-6 h-6 ${isLowTime ? 'text-red-400' : 'text-cyan-400'}`} />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Time Remaining</p>
              <div className="flex items-center gap-2">
                <Progress value={percentage} className="h-2 flex-1" />
                <span className={`text-lg font-bold ${isLowTime ? 'text-red-400' : 'text-cyan-400'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Master Mode Dice Choice Component
function MasterModeDiceChoice({ onChoose, isVisible }: { onChoose: (value: number) => void; isVisible: boolean }) {
  const diceOptions = [1, 2, 3, 4, 5, 6];

  if (!isVisible) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <Card className="bg-black/90 backdrop-blur-xl border-2 border-purple-500 shadow-glow-purple">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-center">
            <Target className="w-6 h-6 text-purple-400" />
            Choose Your Dice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {diceOptions.map((value) => (
              <Button
                key={value}
                onClick={() => onChoose(value)}
                className="h-16 w-16 text-2xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-glow-purple"
              >
                {value}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Select your preferred dice value
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Reconnection Overlay
function ReconnectionOverlay({ isReconnecting, attempts }: { isReconnecting: boolean; attempts: number }) {
  if (!isReconnecting) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="bg-black/90 border-2 border-yellow-500">
        <CardContent className="p-8 text-center space-y-4">
          <WifiOff className="w-16 h-16 mx-auto text-yellow-400 animate-pulse" />
          <div>
            <h3 className="text-xl font-bold text-yellow-400 mb-2">Connection Lost</h3>
            <p className="text-muted-foreground">Attempting to reconnect...</p>
            <p className="text-sm text-muted-foreground mt-2">Attempt {attempts}</p>
          </div>
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-yellow-400" />
        </CardContent>
      </Card>
    </div>
  );
}

// Spectator Badge
function SpectatorBadge() {
  return (
    <div className="fixed top-4 right-4 z-10">
      <Badge className="bg-cyan-500/80 backdrop-blur-xl text-white px-4 py-2 gap-2">
        <Eye className="w-4 h-4" />
        Spectator Mode
      </Badge>
    </div>
  );
}

export default function GameBoard({ gameId, gameMode, onBack }: GameBoardProps) {
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [showDiceChoice, setShowDiceChoice] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isSpectator, setIsSpectator] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getGame = useGetGame();
  const rollDice = useRollDice();
  const { isReconnecting, reconnectionAttempts, isOnline, gameState } = useReconnect(gameId);
  
  const { 
    displayState: players, 
    applyOptimisticUpdate, 
    confirmUpdate, 
    rollbackUpdate,
    hasPendingUpdates 
  } = useOptimisticState<Player[]>([
    {
      id: '1',
      name: 'Player 1',
      color: 'Red',
      colorHex: '#dc2626',
      pieces: [
        { id: 0, position: 0, isInHome: true, isFinished: false },
        { id: 1, position: 0, isInHome: true, isFinished: false },
        { id: 2, position: 0, isInHome: true, isFinished: false },
        { id: 3, position: 0, isInHome: true, isFinished: false },
      ],
    },
    {
      id: '2',
      name: 'AI Bot',
      color: 'Green',
      colorHex: '#16a34a',
      isAI: true,
      pieces: [
        { id: 0, position: 13, isInHome: false, isFinished: false },
        { id: 1, position: 13, isInHome: true, isFinished: false },
        { id: 2, position: 13, isInHome: true, isFinished: false },
        { id: 3, position: 13, isInHome: true, isFinished: false },
      ],
    },
  ], {
    onRollback: (update) => {
      toast.error('Move Rejected', {
        description: 'Server corrected your move',
        duration: 2000,
      });
    }
  });

  const [optimisticMoves, setOptimisticMoves] = useState<Set<string>>(new Set());

  // Sync game state with backend
  useGameStateSync({
    gameId,
    onStateUpdate: (state) => {
      console.log('Game state updated:', state);
      // Update local state based on server state
    },
    pollInterval: 2000,
    enabled: !isReconnecting && isOnline,
  });

  // Quick Mode Timer
  useEffect(() => {
    if (gameMode === 'quick' && !isSpectator) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAutoSkipTurn();
            return 45;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [gameMode, currentPlayer, isSpectator]);

  const handleAutoSkipTurn = () => {
    toast.warning('Time Expired!', {
      description: 'Turn automatically skipped',
    });
    setCurrentPlayer((prev) => (prev + 1) % players.length);
    setTimeLeft(45);
  };

  const handleRollDice = async () => {
    if (isSpectator) {
      toast.error('Spectator Mode', {
        description: 'You cannot roll dice as a spectator',
      });
      return;
    }

    if (isRolling) {
      return;
    }

    if (gameMode === 'master') {
      setShowDiceChoice(true);
    } else {
      try {
        // Start animation immediately
        setIsRolling(true);
        
        toast.info('Rolling dice...', {
          description: 'Requesting server roll',
          duration: 1500,
        });

        // Request server-authoritative dice roll
        const result = await rollDice.mutateAsync(Principal.fromText(gameId));
        
        // Set the server-provided dice value
        const serverValue = Number(result.result);
        setDiceValue(serverValue);
        
        toast.success(`Rolled ${serverValue}!`, {
          description: `Seed: ${result.seed.slice(0, 8)}...`,
          duration: 2000,
        });
      } catch (error: any) {
        console.error('Dice roll error:', error);
        setIsRolling(false);
        toast.error('Dice Roll Failed', {
          description: error.message || 'Could not roll dice. Please try again.',
          duration: 3000,
        });
      }
    }
  };

  const handleDiceChoice = (value: number) => {
    setDiceValue(value);
    setIsRolling(true);
    setShowDiceChoice(false);
    toast.success(`Selected ${value}!`, {
      description: 'Strategic choice made',
    });
  };

  const handleRollComplete = () => {
    setIsRolling(false);
  };

  const handleTokenClick = (playerId: string, pieceId: number) => {
    if (isSpectator) {
      toast.error('Spectator Mode', {
        description: 'You cannot move pieces as a spectator',
      });
      return;
    }

    const moveId = `${playerId}-${pieceId}-${Date.now()}`;
    const moveKey = `${playerId}-${pieceId}`;
    
    // Apply optimistic update
    const updatedPlayers = players.map(p => {
      if (p.id === playerId) {
        return {
          ...p,
          pieces: p.pieces.map(piece => {
            if (piece.id === pieceId) {
              return { ...piece, position: piece.position + diceValue };
            }
            return piece;
          })
        };
      }
      return p;
    });

    applyOptimisticUpdate(moveId, updatedPlayers);
    setOptimisticMoves(prev => new Set(prev).add(moveKey));

    toast.info('Token Moving', {
      description: `Moving ${players.find(p => p.id === playerId)?.name}'s piece ${pieceId + 1}`,
    });

    // Simulate server confirmation after delay
    setTimeout(() => {
      confirmUpdate(moveId, updatedPlayers);
      setOptimisticMoves(prev => {
        const newSet = new Set(prev);
        newSet.delete(moveKey);
        return newSet;
      });
    }, 1000);
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900">
      {/* Reconnection Overlay */}
      <ReconnectionOverlay isReconnecting={isReconnecting} attempts={reconnectionAttempts} />

      {/* Spectator Badge */}
      {isSpectator && <SpectatorBadge />}

      {/* Quick Mode Timer */}
      {gameMode === 'quick' && !isSpectator && (
        <QuickModeTimer timeLeft={timeLeft} totalTime={45} />
      )}

      {/* Master Mode Dice Choice */}
      {gameMode === 'master' && (
        <MasterModeDiceChoice onChoose={handleDiceChoice} isVisible={showDiceChoice} />
      )}

      {/* Online Status Indicator */}
      <div className="fixed top-4 left-4 z-10">
        <Badge className={`${isOnline ? 'bg-green-500' : 'bg-red-500'} text-white px-3 py-1 gap-2`}>
          {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
      </div>

      {/* Pending Updates Indicator */}
      {hasPendingUpdates && (
        <div className="fixed top-16 left-4 z-10">
          <Badge className="bg-yellow-500 text-white px-3 py-1 gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Syncing...
          </Badge>
        </div>
      )}

      {/* Back Button */}
      <div className="absolute top-4 left-20 z-10">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-white hover:bg-white/10 backdrop-blur-xl"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Leave Game
        </Button>
      </div>

      {/* Game Info */}
      <div className="absolute top-4 right-4 z-10">
        <Card className="bg-black/60 backdrop-blur-xl border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Current Turn</p>
                <p className="text-lg font-bold text-white">{players[currentPlayer]?.name}</p>
              </div>
              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: players[currentPlayer]?.colorHex }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3D Canvas */}
      <Canvas shadows className="w-full h-full">
        <Suspense fallback={null}>
          <Scene
            gameMode={gameMode}
            diceValue={diceValue}
            isRolling={isRolling}
            onRollComplete={handleRollComplete}
            players={players}
            onTokenClick={handleTokenClick}
            optimisticMoves={optimisticMoves}
          />
        </Suspense>
      </Canvas>

      {/* Game Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <Card className="bg-black/80 backdrop-blur-xl border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">Dice Value</p>
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-3xl font-bold shadow-glow-purple">
                  {diceValue}
                </div>
              </div>
              <Button
                onClick={handleRollDice}
                disabled={isRolling || rollDice.isPending || isSpectator}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-6 text-lg shadow-glow-purple"
              >
                {isRolling || rollDice.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Rolling...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Roll Dice
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Panel */}
      <div className="absolute bottom-4 right-4 z-10">
        <ChatPanel gameId={gameId} />
      </div>
    </div>
  );
}
