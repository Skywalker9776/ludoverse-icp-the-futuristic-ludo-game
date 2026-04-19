import { Principal } from "@icp-sdk/core/principal";
import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Brain,
  Clock,
  Eye,
  Info,
  Loader2,
  MessageSquare,
  Sparkles,
  Trophy,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type * as THREE from "three";
import type { GameMode, MoveProbability, TokenSoul } from "../backend";
import { useGameStateSync } from "../hooks/useGameStateSync";
import {
  useAddTokenXP,
  useForfeitGame,
  useGetBoardState,
  useGetBotMove,
  useGetMoveProbabilities,
  useGetTokenSouls,
  useGetWinner,
  useMoveToken,
  useRollDice,
} from "../hooks/useQueries";
import ChatPanel from "./ChatPanel";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

interface GameBoardProps {
  gameId: string;
  gameMode: GameMode;
  isDemo?: boolean;
  onBack: () => void;
}

interface GamePiece {
  id: number;
  position: number;
  isInHome: boolean;
  isFinished: boolean;
  soulLevel: number;
  soulXp: number;
}

interface LocalPlayer {
  id: string;
  name: string;
  color: string;
  colorHex: string;
  isAI?: boolean;
  pieces: GamePiece[];
}

const SAFE_POSITIONS = [0, 8, 13, 21, 26, 34, 39, 47];
const PATH_LENGTH = 52;

function getTilePos(i: number, total: number): [number, number, number] {
  const a = (i / total) * Math.PI * 2 - Math.PI / 2;
  return [Math.cos(a) * 5.5, 0.1, Math.sin(a) * 5.5];
}

function getHomePos(pi: number, xi: number): [number, number, number] {
  const b: [number, number][] = [
    [-4.5, -4.5],
    [4.5, -4.5],
    [-4.5, 4.5],
    [4.5, 4.5],
  ];
  const o: [number, number][] = [
    [-0.7, -0.7],
    [0.7, -0.7],
    [-0.7, 0.7],
    [0.7, 0.7],
  ];
  return [b[pi % 4][0] + o[xi % 4][0], 0.5, b[pi % 4][1] + o[xi % 4][1]];
}

// Particle burst overlay
function ParticleBurst({ active, color }: { active: boolean; color: string }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * 360;
        const tx = Math.cos((a * Math.PI) / 180) * 60;
        const ty = Math.sin((a * Math.PI) / 180) * 60;
        return (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: positional particles
            key={`p${i}`}
            className="absolute w-2 h-2 rounded-full animate-particle-burst"
            style={
              {
                backgroundColor: color,
                boxShadow: `0 0 6px ${color}`,
                "--tx": `${tx}px`,
                "--ty": `${ty}px`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}

// Quantum sphere (3D)
function QuantumSphere({ visible }: { visible: boolean }) {
  const r1 = useRef<THREE.Mesh>(null);
  const r2 = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (r1.current) {
      r1.current.rotation.x = t * 1.5;
      r1.current.rotation.y = t * 2.1;
      r1.current.rotation.z = t * 0.8;
    }
    if (r2.current) {
      r2.current.rotation.x = -t * 2;
      r2.current.rotation.z = t * 1.3;
    }
  });
  if (!visible) return null;
  return (
    <group position={[0, 3.5, 0]}>
      <mesh ref={r1}>
        <icosahedronGeometry args={[1.4, 2]} />
        <meshStandardMaterial
          color="#a855f7"
          wireframe
          emissive="#22d3ee"
          emissiveIntensity={0.9}
        />
      </mesh>
      <mesh ref={r2} scale={0.65}>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshStandardMaterial
          color="#ec4899"
          wireframe
          emissive="#a855f7"
          emissiveIntensity={1.1}
        />
      </mesh>
      <pointLight color="#a855f7" intensity={4} distance={7} />
      <pointLight color="#22d3ee" intensity={3} distance={5} />
    </group>
  );
}

// 3D Dice
function Dice3D({
  value: _v,
  isRolling,
  quantumPhase,
}: { value: number; isRolling: boolean; quantumPhase: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const spd = useRef(18);
  const rolling = isRolling || quantumPhase;
  useFrame((_, d) => {
    if (!ref.current) return;
    if (rolling) {
      spd.current = Math.max(0.3, spd.current * 0.975);
      ref.current.rotation.x += d * spd.current;
      ref.current.rotation.y += d * spd.current * 0.7;
      ref.current.rotation.z += d * spd.current * 0.5;
    } else {
      spd.current = 18;
      ref.current.rotation.x += (0 - ref.current.rotation.x) * d * 5;
      ref.current.rotation.y += (0 - ref.current.rotation.y) * d * 5;
    }
  });
  const c = rolling ? "#a855f7" : "#f0c040";
  return (
    <group position={[6.5, 1.8, 0]}>
      <mesh ref={ref} castShadow>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial
          color={c}
          metalness={0.92}
          roughness={0.08}
          emissive={c}
          emissiveIntensity={rolling ? 0.65 : 0.35}
        />
      </mesh>
      <pointLight color={c} intensity={rolling ? 2.5 : 1.2} distance={5} />
    </group>
  );
}

// 3D Token with soul ring
function Token3D({
  position,
  color,
  onClick,
  soulLevel,
  animState,
}: {
  position: [number, number, number];
  color: string;
  onClick?: () => void;
  soulLevel: number;
  animState?: "capture" | "captured" | "levelup" | "shake" | null;
}) {
  const body = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const [hov, setHov] = useState(false);
  useFrame((s) => {
    if (!body.current) return;
    const t = s.clock.elapsedTime;
    if (animState === "capture") {
      body.current.scale.setScalar(1 + Math.abs(Math.sin(t * 8)) * 0.35);
      body.current.rotation.y += 0.1;
    } else if (animState === "captured") {
      body.current.scale.setScalar(0.65 + Math.abs(Math.sin(t * 10)) * 0.1);
    } else if (animState === "shake") {
      body.current.position.x = position[0] + Math.sin(t * 22) * 0.14;
    } else if (animState === "levelup") {
      body.current.rotation.y += 0.07;
      body.current.scale.setScalar(1 + Math.abs(Math.sin(t * 4)) * 0.22);
    } else {
      body.current.position.y =
        position[1] + (hov ? 0.35 : 0) + Math.sin(t * 2 + position[0]) * 0.07;
      body.current.scale.setScalar(1);
    }
    if (ring.current) ring.current.rotation.z = t * (1 + soulLevel * 0.08);
  });
  return (
    <group>
      <mesh ref={ring} position={position} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry
          args={[
            0.44,
            0.055,
            8,
            32,
            (Math.min(soulLevel, 10) / 10) * Math.PI * 2,
          ]}
        />
        <meshStandardMaterial
          color="#f0c040"
          emissive="#f0c040"
          emissiveIntensity={0.85}
        />
      </mesh>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Three.js mesh click */}
      <mesh
        ref={body}
        position={position}
        onClick={onClick}
        onPointerOver={() => setHov(true)}
        onPointerOut={() => setHov(false)}
        castShadow
      >
        <capsuleGeometry args={[0.27, 0.22, 8, 16]} />
        <meshStandardMaterial
          color={color}
          metalness={0.82}
          roughness={0.12}
          emissive={color}
          emissiveIntensity={hov ? 0.75 : 0.3 + soulLevel * 0.04}
        />
      </mesh>
      {soulLevel > 1 && (
        <pointLight
          position={[position[0], position[1] + 0.55, position[2]]}
          color={color}
          intensity={0.4 + soulLevel * 0.08}
          distance={2.2}
        />
      )}
    </group>
  );
}

// 3D Board with oracle heatmap + living state
function Board3D({
  boardState,
  probabilities,
  showOracle,
}: {
  boardState: string;
  probabilities: MoveProbability[];
  showOracle: boolean;
}) {
  const base = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!base.current) return;
    const mat = base.current.material as THREE.MeshStandardMaterial;
    const t = s.clock.elapsedTime;
    if (boardState === "heated") {
      mat.emissive.set(0.9, 0.28, 0.6);
      mat.emissiveIntensity = 0.15 + Math.sin(t * 1.5) * 0.1;
    } else if (boardState === "electrified") {
      mat.emissive.set(0.13, 0.83, 0.93);
      mat.emissiveIntensity = 0.2 + Math.abs(Math.sin(t * 4)) * 0.2;
    } else if (boardState === "golden") {
      mat.emissive.set(0.94, 0.75, 0.25);
      mat.emissiveIntensity = 0.25 + Math.sin(t * 0.8) * 0.15;
    } else {
      mat.emissive.set(0.42, 0.21, 0.62);
      mat.emissiveIntensity = 0.08 + Math.sin(t * 0.5) * 0.03;
    }
  });
  const pm = new Map<number, MoveProbability>();
  for (const p of probabilities) pm.set(Number(p.position), p);
  const hc = ["#dc2626", "#16a34a", "#eab308", "#2563eb"];
  const hp: [number, number][] = [
    [-4.5, -4.5],
    [4.5, -4.5],
    [-4.5, 4.5],
    [4.5, 4.5],
  ];
  return (
    <group>
      <mesh ref={base} position={[0, -0.28, 0]} receiveShadow>
        <boxGeometry args={[15.5, 0.56, 15.5]} />
        <meshStandardMaterial
          color="#0d0121"
          metalness={0.88}
          roughness={0.12}
          emissive="#6b21a8"
          emissiveIntensity={0.08}
        />
      </mesh>
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[15.5, 15.5]} />
        <meshStandardMaterial color="#0a001a" metalness={0.5} roughness={0.4} />
      </mesh>
      {hp.map(([x, z], i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static home bases
        <group key={`hb${i}`}>
          <mesh position={[x, 0.07, z]}>
            <boxGeometry args={[4.4, 0.14, 4.4]} />
            <meshStandardMaterial
              color={hc[i]}
              metalness={0.72}
              roughness={0.22}
              emissive={hc[i]}
              emissiveIntensity={0.38}
            />
          </mesh>
          {(
            [
              [-0.75, -0.75],
              [0.75, -0.75],
              [-0.75, 0.75],
              [0.75, 0.75],
            ] as [number, number][]
          ).map(([ox, oz]) => (
            <mesh key={`${ox}${oz}`} position={[x + ox, 0.24, z + oz]}>
              <sphereGeometry args={[0.22, 14, 14]} />
              <meshStandardMaterial
                color={hc[i]}
                metalness={0.92}
                roughness={0.08}
                emissive={hc[i]}
                emissiveIntensity={0.65}
              />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 0.16, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[3.2, 0.32, 3.2]} />
        <meshStandardMaterial
          color="#1a0535"
          metalness={0.96}
          roughness={0.04}
          emissive="#a855f7"
          emissiveIntensity={0.45}
        />
      </mesh>
      {Array.from({ length: PATH_LENGTH }).map((_, i) => {
        const pos = getTilePos(i, PATH_LENGTH);
        const safe = SAFE_POSITIONS.includes(i);
        const p = pm.get(i);
        let c = safe ? "#f0c040" : "#2d1053";
        let e = safe ? "#f0c040" : "#4b2090";
        let ei = safe ? 0.48 : 0.12;
        if (showOracle && p) {
          if (p.safeScore > 0.7) {
            c = "#22d3ee";
            e = "#22d3ee";
            ei = 0.55;
          } else if (p.safeScore < 0.3) {
            c = "#ec4899";
            e = "#ec4899";
            ei = 0.55;
          } else {
            c = "#f0c040";
            e = "#f0c040";
            ei = 0.38;
          }
        }
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: path tiles are positionally indexed
          <mesh key={`t${i}`} position={pos} receiveShadow castShadow>
            <cylinderGeometry args={[0.33, 0.33, 0.19, 22]} />
            <meshStandardMaterial
              color={c}
              metalness={0.66}
              roughness={0.32}
              emissive={e}
              emissiveIntensity={ei}
            />
          </mesh>
        );
      })}
      {SAFE_POSITIONS.map((i) => {
        const [x, , z] = getTilePos(i, PATH_LENGTH);
        return (
          <mesh key={`s${i}`} position={[x, 0.24, z]}>
            <octahedronGeometry args={[0.16, 0]} />
            <meshStandardMaterial
              color="#f0c040"
              emissive="#f0c040"
              emissiveIntensity={1.1}
              metalness={1}
              roughness={0}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Full scene
function Scene({
  gameMode: _gm,
  diceValue,
  isRolling,
  quantumPhase,
  players,
  onTokenClick,
  boardState,
  probabilities,
  showOracle,
  tokenAnimations,
  souls,
}: {
  gameMode: GameMode;
  diceValue: number;
  isRolling: boolean;
  quantumPhase: boolean;
  players: LocalPlayer[];
  onTokenClick: (pid: string, pieceid: number) => void;
  boardState: string;
  probabilities: MoveProbability[];
  showOracle: boolean;
  tokenAnimations: Map<string, "capture" | "captured" | "levelup" | "shake">;
  souls: TokenSoul[];
}) {
  const colors = ["#a855f7", "#ec4899", "#22c55e", "#38bdf8"];
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 19, 15]} fov={46} />
      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={12}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2.25}
      />
      <ambientLight intensity={0.3} color="#220044" />
      <directionalLight
        position={[14, 24, 14]}
        intensity={1.7}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-9, 11, -9]} intensity={1.3} color="#a855f7" />
      <pointLight position={[9, 11, 9]} intensity={1.1} color="#ec4899" />
      <pointLight position={[0, 14, 0]} intensity={0.9} color="#f0c040" />
      <QuantumSphere visible={quantumPhase} />
      <Board3D
        boardState={boardState}
        probabilities={probabilities}
        showOracle={showOracle}
      />
      <Dice3D
        value={diceValue}
        isRolling={isRolling}
        quantumPhase={quantumPhase}
      />
      {players.map((player, pi) =>
        player.pieces.map((piece) => {
          if (piece.isFinished) return null;
          const pos: [number, number, number] = piece.isInHome
            ? getHomePos(pi, piece.id)
            : getTilePos(piece.position % PATH_LENGTH, PATH_LENGTH);
          const key = `${player.id}-${piece.id}`;
          const soul = souls.find((s) => Number(s.tokenIndex) === piece.id);
          return (
            <Token3D
              key={key}
              position={pos}
              color={colors[pi % 4]}
              onClick={() => onTokenClick(player.id, piece.id)}
              soulLevel={soul ? Number(soul.level) : piece.soulLevel}
              animState={tokenAnimations.get(key) ?? null}
            />
          );
        }),
      )}
      <Environment preset="night" />
    </>
  );
}

// Win overlay
function WinOverlay({
  winnerName,
  winnerColor,
  isDemo,
  betAmount,
  onPlayAgain,
  onBack,
}: {
  winnerName: string;
  winnerColor: string;
  isDemo: boolean;
  betAmount: number;
  onPlayAgain: () => void;
  onBack: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/88 backdrop-blur-sm" />
      <div className="relative z-10 text-center space-y-6 px-8 py-10">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: confetti positional
              key={`c${i}`}
              className="absolute rounded-full animate-particle-burst"
              style={
                {
                  width: `${4 + (i % 3) * 4}px`,
                  height: `${4 + (i % 3) * 4}px`,
                  backgroundColor: [
                    "#a855f7",
                    "#ec4899",
                    "#f0c040",
                    "#22d3ee",
                    "#22c55e",
                  ][i % 5],
                  left: `${(i * 7) % 100}%`,
                  top: `${20 + ((i * 3) % 60)}%`,
                  "--tx": `${((i % 7) - 3) * 50}px`,
                  "--ty": `${((i % 5) - 2) * 60}px`,
                  animationDelay: `${(i % 5) * 0.1}s`,
                  animationDuration: "1.6s",
                } as React.CSSProperties
              }
            />
          ))}
        </div>
        <Trophy
          className="w-24 h-24 mx-auto animate-bounce"
          style={{
            color: winnerColor,
            filter: `drop-shadow(0 0 20px ${winnerColor})`,
          }}
        />
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-[0.3em] mb-2">
            Champion!
          </p>
          <h2
            className="text-5xl font-black mb-2"
            style={{
              color: winnerColor,
              textShadow: `0 0 40px ${winnerColor}`,
            }}
          >
            {winnerName}
          </h2>
          <p className="text-2xl font-bold text-foreground">
            {isDemo
              ? "🎮 DEMO WIN — Practice Complete!"
              : `+${betAmount} ICP Awarded`}
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button
            data-ocid="win.play_again_button"
            onClick={onPlayAgain}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black px-8 py-4 text-lg shadow-glow-purple"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Play Again
          </Button>
          <Button
            data-ocid="win.back_lobby_button"
            onClick={onBack}
            variant="outline"
            className="border-purple-500/50 hover:bg-purple-500/10 px-8 py-4 text-lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Lobby
          </Button>
        </div>
      </div>
    </div>
  );
}

// Forfeit confirm
function ForfeitModal({
  onConfirm,
  onCancel,
}: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onCancel}
        onKeyDown={(e) => e.key === "Escape" && onCancel()}
        role="button"
        tabIndex={-1}
        aria-label="Close"
      />
      <Card
        data-ocid="forfeit.dialog"
        className="relative z-10 bg-card border-2 border-destructive/40 max-w-sm w-full mx-4"
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-6 h-6" />
            Forfeit Game?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            You will lose your bet. This cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              data-ocid="forfeit.confirm_button"
              onClick={onConfirm}
              variant="destructive"
              className="flex-1"
            >
              Forfeit
            </Button>
            <Button
              data-ocid="forfeit.cancel_button"
              onClick={onCancel}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Master dice picker
function MasterDicePicker({
  onChoose,
  onClose,
}: { onChoose: (v: number) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={-1}
        aria-label="Close"
      />
      <Card
        data-ocid="master.dice_picker"
        className="relative z-10 bg-card border-2 border-purple-500/60 shadow-glow-purple"
      >
        <CardHeader>
          <CardTitle className="text-center text-purple-300 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            Master Mode: Choose Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {([1, 2, 3, 4, 5, 6] as const).map((v) => (
              <Button
                key={v}
                data-ocid={`master.dice_choice.${v}`}
                onClick={() => onChoose(v)}
                className="h-14 w-14 text-2xl font-black bg-gradient-to-br from-purple-600 to-pink-600 shadow-glow-purple"
              >
                {(["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"] as const)[v - 1]}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Quantum UI overlay
function QuantumOverlay({
  visible,
  seedHash,
}: { visible: boolean; seedHash: string }) {
  if (!visible) return null;
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
      <div className="text-center space-y-4">
        <div className="relative w-24 h-24 mx-auto">
          <div
            className="w-full h-full rounded-full bg-quantum-sphere animate-quantum-spin"
            style={{
              boxShadow:
                "0 0 50px rgba(168,85,247,0.85),0 0 100px rgba(34,211,238,0.55)",
            }}
          />
          <ParticleBurst active color="#a855f7" />
        </div>
        <p className="text-cyan-300 font-mono text-sm animate-pulse tracking-wider">
          ⚛ Quantum Entropy Seeding…
        </p>
        {seedHash && (
          <div className="bg-black/65 backdrop-blur-sm border border-purple-500/40 rounded-xl px-4 py-2">
            <p className="text-[10px] text-muted-foreground">Seed Hash</p>
            <p className="font-mono text-xs text-purple-300">
              {seedHash.slice(0, 8)}…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function GameBoard({
  gameId,
  gameMode,
  isDemo = false,
  onBack,
}: GameBoardProps) {
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [quantumPhase, setQuantumPhase] = useState(false);
  const [seedHash, setSeedHash] = useState("");
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [boardState, setBoardState] = useState("normal");
  const [probabilities, setProbabilities] = useState<MoveProbability[]>([]);
  const [souls, setSouls] = useState<TokenSoul[]>([]);
  const tokenAnimations = useRef(
    new Map<string, "capture" | "captured" | "levelup" | "shake">(),
  ).current;
  const [showOracle, setShowOracle] = useState(false);
  const [showForfeit, setShowForfeit] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showMasterPicker, setShowMasterPicker] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [winner, setWinner] = useState<{ name: string; color: string } | null>(
    null,
  );
  const [timeLeft, setTimeLeft] = useState(45);

  const rollDice = useRollDice();
  const moveToken = useMoveToken();
  const forfeitGame = useForfeitGame();
  const getWinner = useGetWinner();
  const getBoardState = useGetBoardState();
  const getMoveProbabilities = useGetMoveProbabilities();
  const getTokenSoulsQuery = useGetTokenSouls();
  const getBotMove = useGetBotMove();
  const addTokenXP = useAddTokenXP();

  // Stable refs to avoid stale closures
  const rollDiceRef = useRef(rollDice);
  rollDiceRef.current = rollDice;
  const moveTokenRef = useRef(moveToken);
  moveTokenRef.current = moveToken;
  const getBotMoveRef = useRef(getBotMove);
  getBotMoveRef.current = getBotMove;
  const getBoardStateRef = useRef(getBoardState);
  getBoardStateRef.current = getBoardState;
  const getMoveProbRef = useRef(getMoveProbabilities);
  getMoveProbRef.current = getMoveProbabilities;

  const [players] = useState<LocalPlayer[]>([
    {
      id: "player1",
      name: "You",
      color: "Neon Purple",
      colorHex: "#a855f7",
      isAI: false,
      pieces: [
        {
          id: 0,
          position: 0,
          isInHome: true,
          isFinished: false,
          soulLevel: 1,
          soulXp: 0,
        },
        {
          id: 1,
          position: 0,
          isInHome: true,
          isFinished: false,
          soulLevel: 1,
          soulXp: 0,
        },
        {
          id: 2,
          position: 0,
          isInHome: true,
          isFinished: false,
          soulLevel: 1,
          soulXp: 0,
        },
        {
          id: 3,
          position: 0,
          isInHome: true,
          isFinished: false,
          soulLevel: 1,
          soulXp: 0,
        },
      ],
    },
    {
      id: "ai-agent",
      name: "LudoVerse AI",
      color: "Cyber Pink",
      colorHex: "#ec4899",
      isAI: true,
      pieces: [
        {
          id: 0,
          position: 13,
          isInHome: false,
          isFinished: false,
          soulLevel: 3,
          soulXp: 280,
        },
        {
          id: 1,
          position: 13,
          isInHome: true,
          isFinished: false,
          soulLevel: 2,
          soulXp: 90,
        },
        {
          id: 2,
          position: 13,
          isInHome: true,
          isFinished: false,
          soulLevel: 2,
          soulXp: 70,
        },
        {
          id: 3,
          position: 13,
          isInHome: true,
          isFinished: false,
          soulLevel: 1,
          soulXp: 30,
        },
      ],
    },
  ]);
  const currentPlayer = players[currentPlayerIdx % players.length];

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const { syncNow } = useGameStateSync({
    gameId,
    onStateUpdate: (s) => {
      if (s.winner) setWinner({ name: "You", color: "#a855f7" });
    },
    pollInterval: 2000,
    enabled: isOnline,
  });
  const syncRef = useRef(syncNow);
  syncRef.current = syncNow;

  // Board state poll every 5s
  useEffect(() => {
    const poll = async () => {
      try {
        const r = await getBoardStateRef.current.mutateAsync(
          Principal.fromText(gameId),
        );
        if (r) setBoardState(r.state);
      } catch {}
    };
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, [gameId]);

  // Token souls
  useEffect(() => {
    if (getTokenSoulsQuery.data) setSouls(getTokenSoulsQuery.data);
  }, [getTokenSoulsQuery.data]);

  // Oracle
  const fetchProbs = useCallback(async () => {
    try {
      const r = await getMoveProbRef.current.mutateAsync(
        Principal.fromText(gameId),
      );
      if (r) setProbabilities(r);
    } catch {}
  }, [gameId]);

  useEffect(() => {
    if (showOracle) fetchProbs();
    else setProbabilities([]);
  }, [showOracle, fetchProbs]);

  // Quick mode timer
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset timer on turn change is intentional
  useEffect(() => {
    if (gameMode !== "quick") return;
    const id = setInterval(
      () =>
        setTimeLeft((p) => {
          if (p <= 1) {
            toast.warning("Time Expired!", { description: "Turn skipped" });
            setCurrentPlayerIdx((i) => i + 1);
            return 45;
          }
          return p - 1;
        }),
      1000,
    );
    return () => clearInterval(id);
  }, [gameMode, currentPlayerIdx]);

  // AI auto-play
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional – refs used for stable mutations
  useEffect(() => {
    if (!currentPlayer?.isAI) return;
    let cancelled = false;
    setAiThinking(true);
    const tid = setTimeout(async () => {
      if (cancelled) {
        return;
      }
      try {
        const p = Principal.fromText(gameId);
        const roll = await rollDiceRef.current.mutateAsync(p);
        if (cancelled) return;
        const val = Number(roll.value);
        setDiceValue(val);
        setSeedHash(roll.seedHash);
        const bm = await getBotMoveRef.current.mutateAsync({
          gameId: p,
          botPrincipal: p,
        });
        if (cancelled) return;
        await moveTokenRef.current.mutateAsync({
          gameId: p,
          tokenIndex: bm,
          rollValue: BigInt(val),
        });
        toast.info(`LudoVerse AI rolled ${val}`, { duration: 2000 });
        setCurrentPlayerIdx((i) => i + 1);
        syncRef.current();
      } catch {
      } finally {
        if (!cancelled) setAiThinking(false);
      }
    }, 1500);
    return () => {
      cancelled = true;
      clearTimeout(tid);
    };
  }, [currentPlayerIdx, gameId]);

  const handleRollDice = async () => {
    if (isRolling || quantumPhase || currentPlayer?.isAI) return;
    if (gameMode === "master") {
      setShowMasterPicker(true);
      return;
    }
    setQuantumPhase(true);
    setIsRolling(true);
    try {
      const result = await rollDice.mutateAsync(Principal.fromText(gameId));
      const val = Number(result.value);
      setSeedHash(result.seedHash);
      setTimeout(() => {
        setQuantumPhase(false);
        setDiceValue(val);
        setIsRolling(false);
        toast.success(`⚛ Rolled ${val}!`, {
          description: `Hash: ${result.seedHash.slice(0, 8)}… · Verified Fair`,
          duration: 3000,
        });
        if (showOracle) fetchProbs();
      }, 1500);
    } catch (err: unknown) {
      setQuantumPhase(false);
      setIsRolling(false);
      toast.error("Roll Failed", {
        description: err instanceof Error ? err.message : "Try again",
      });
    }
  };

  const handleMasterChoice = (val: number) => {
    setShowMasterPicker(false);
    setDiceValue(val);
    toast.success(`Strategic choice: ${val}`, { description: "Master Mode" });
  };

  const handleTokenClick = async (pid: string, pieceId: number) => {
    if (currentPlayer?.isAI || pid !== currentPlayer?.id) return;
    try {
      const p = Principal.fromText(gameId);
      await moveToken.mutateAsync({
        gameId: p,
        tokenIndex: BigInt(pieceId),
        rollValue: BigInt(diceValue),
      });
      await addTokenXP.mutateAsync({
        tokenIndex: BigInt(pieceId),
        xp: BigInt(10),
      });
      setCurrentPlayerIdx((i) => i + 1);
      syncNow();
      const w = await getWinner.mutateAsync(p).catch(() => null);
      if (w) setWinner({ name: "You", color: "#a855f7" });
    } catch (err: unknown) {
      toast.error("Move Failed", {
        description: err instanceof Error ? err.message : "Try again",
      });
    }
  };

  const handleForfeit = async () => {
    try {
      await forfeitGame.mutateAsync(Principal.fromText(gameId));
      toast.success("Forfeited");
      onBack();
    } catch {
      toast.error("Could not forfeit");
    }
    setShowForfeit(false);
  };

  const bbadge: Record<string, { label: string; color: string }> = {
    heated: { label: "HEATED", color: "#ec4899" },
    electrified: { label: "ELECTRIFIED", color: "#22d3ee" },
    golden: { label: "GOLDEN", color: "#f0c040" },
    normal: { label: "LIVE", color: "#a855f7" },
  };
  const bcls: Record<string, string> = {
    heated: "animate-board-heated",
    electrified: "animate-board-electrified",
    golden: "animate-board-golden",
    normal: "",
  };
  const canRoll =
    !currentPlayer?.isAI && !isRolling && !quantumPhase && !aiThinking;

  return (
    <div
      className={`relative w-full h-screen overflow-hidden transition-all duration-1000 ${bcls[boardState] ?? ""}`}
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%,oklch(0.18 0.12 290) 0%,oklch(0.06 0.02 270) 80%)",
      }}
      data-ocid="game.canvas_target"
    >
      {isDemo && (
        <div className="absolute top-0 left-0 right-0 z-30 text-center py-1 bg-cyan-500/20 border-b border-cyan-500/40 backdrop-blur-sm">
          <span className="text-cyan-300 font-mono text-xs font-bold tracking-widest uppercase">
            🎮 DEMO MODE — Virtual Credits Only
          </span>
        </div>
      )}
      <QuantumOverlay visible={quantumPhase} seedHash={seedHash} />
      {winner && (
        <WinOverlay
          winnerName={winner.name}
          winnerColor={winner.color}
          isDemo={isDemo}
          betAmount={0}
          onPlayAgain={() => {
            setWinner(null);
            onBack();
          }}
          onBack={onBack}
        />
      )}
      {showForfeit && (
        <ForfeitModal
          onConfirm={handleForfeit}
          onCancel={() => setShowForfeit(false)}
        />
      )}
      {showMasterPicker && (
        <MasterDicePicker
          onChoose={handleMasterChoice}
          onClose={() => setShowMasterPicker(false)}
        />
      )}

      {/* TOP LEFT */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <Button
          data-ocid="game.back_button"
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="backdrop-blur-xl bg-black/50 hover:bg-black/70 border border-white/10 text-white gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Leave
        </Button>
        <Badge
          className={`text-xs gap-1.5 px-2.5 py-1 ${isOnline ? "bg-green-500/80" : "bg-red-500/80"}`}
        >
          {isOnline ? (
            <Wifi className="w-3 h-3" />
          ) : (
            <WifiOff className="w-3 h-3" />
          )}
          {isOnline ? "Live" : "Offline"}
        </Badge>
      </div>

      {/* TOP CENTER */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <Badge
          className="px-4 py-1.5 font-mono text-xs font-bold tracking-widest backdrop-blur-xl bg-black/55 border"
          style={{
            color: bbadge[boardState]?.color ?? "#a855f7",
            borderColor: `${bbadge[boardState]?.color ?? "#a855f7"}55`,
            boxShadow: `0 0 14px ${bbadge[boardState]?.color ?? "#a855f7"}60`,
          }}
        >
          ◈ {bbadge[boardState]?.label ?? "LIVE"}
        </Badge>
      </div>

      {/* TOP RIGHT: current player */}
      <div className="absolute top-4 right-4 z-20">
        <Card className="bg-black/65 backdrop-blur-xl border-purple-500/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-6 h-6 rounded-full animate-pulse shrink-0"
                style={{
                  backgroundColor: currentPlayer?.colorHex,
                  boxShadow: `0 0 12px ${currentPlayer?.colorHex}`,
                }}
              />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Turn
                </p>
                <p className="text-sm font-bold text-foreground leading-none truncate max-w-24">
                  {currentPlayer?.name}
                </p>
              </div>
              {currentPlayer?.isAI && (
                <Bot className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
              )}
            </div>
            {aiThinking && (
              <div className="flex items-center gap-1.5 mt-2">
                <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                <span className="text-[10px] text-cyan-400">AI thinking…</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick timer */}
      {gameMode === "quick" && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20">
          <Card
            className={`bg-black/80 backdrop-blur-xl border-2 min-w-[180px] ${timeLeft <= 10 ? "border-red-500 animate-pulse" : "border-cyan-500"}`}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Clock
                  className={`w-4 h-4 ${timeLeft <= 10 ? "text-red-400" : "text-cyan-400"}`}
                />
                <div className="flex-1">
                  <Progress
                    value={(timeLeft / 45) * 100}
                    className="h-1.5 mb-1"
                  />
                  <span
                    className={`text-sm font-bold ${timeLeft <= 10 ? "text-red-400" : "text-cyan-400"}`}
                  >
                    {timeLeft}s
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas shadows className="w-full h-full" gl={{ antialias: true }}>
        <Suspense fallback={null}>
          <Scene
            gameMode={gameMode}
            diceValue={diceValue}
            isRolling={isRolling}
            quantumPhase={quantumPhase}
            players={players}
            onTokenClick={handleTokenClick}
            boardState={boardState}
            probabilities={probabilities}
            showOracle={showOracle}
            tokenAnimations={tokenAnimations}
            souls={souls}
          />
        </Suspense>
      </Canvas>

      {/* BOTTOM HUD */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between gap-3">
        <Card className="bg-black/82 backdrop-blur-xl border border-purple-500/35 shadow-glow-purple flex-1 max-w-xs">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black border-2 select-none transition-all duration-300 shrink-0"
                style={{
                  background:
                    isRolling || quantumPhase
                      ? "linear-gradient(135deg,#a855f7,#22d3ee)"
                      : "linear-gradient(135deg,#f0c040,#f59e0b)",
                  borderColor:
                    isRolling || quantumPhase ? "#22d3ee" : "#f0c040",
                  boxShadow:
                    isRolling || quantumPhase
                      ? "0 0 28px rgba(168,85,247,0.75)"
                      : "0 0 24px rgba(240,192,64,0.65)",
                  color: isRolling || quantumPhase ? "white" : "#1a0a2e",
                }}
              >
                {isRolling || quantumPhase
                  ? "⚛"
                  : (["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"] as const)[diceValue - 1]}
              </div>
              <Button
                data-ocid="game.roll_dice_button"
                onClick={handleRollDice}
                disabled={!canRoll}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black px-5 py-5 text-base shadow-glow-purple disabled:opacity-40 disabled:cursor-not-allowed flex-1"
              >
                {quantumPhase ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-pulse" />
                    Quantum…
                  </>
                ) : isRolling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Rolling…
                  </>
                ) : aiThinking ? (
                  <>
                    <Bot className="w-4 h-4 mr-2 animate-pulse" />
                    AI Turn
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Roll Dice
                  </>
                )}
              </Button>
            </div>
            {seedHash && !quantumPhase && (
              <div className="flex items-center gap-2 mt-3 bg-black/45 border border-cyan-500/30 rounded-lg px-3 py-1.5">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                <span className="font-mono text-[10px] text-cyan-400 truncate">
                  {seedHash.slice(0, 10)}…
                </span>
                <span className="text-[10px] text-cyan-300 font-semibold ml-auto shrink-0">
                  ✓ Fair
                </span>
                <span
                  aria-label="Quantum dice: time-entropy seeding. Hash verifiable on Internet Computer."
                  className="cursor-help"
                >
                  <Info className="w-3 h-3 text-muted-foreground shrink-0" />
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2">
          <Button
            data-ocid="game.oracle_toggle"
            onClick={() => setShowOracle((v) => !v)}
            size="sm"
            variant={showOracle ? "default" : "outline"}
            className={`gap-1.5 text-xs font-bold backdrop-blur-xl ${showOracle ? "bg-yellow-500/85 hover:bg-yellow-600/85 text-black shadow-glow-gold border-yellow-400" : "border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"}`}
          >
            <Brain className="w-3.5 h-3.5" />
            Oracle {showOracle ? "ON" : "OFF"}
          </Button>
          <Button
            data-ocid="game.chat_toggle"
            onClick={() => setShowChat((v) => !v)}
            size="sm"
            variant="outline"
            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 backdrop-blur-xl gap-1.5 text-xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Chat
          </Button>
          <Button
            data-ocid="game.spectators_button"
            size="sm"
            variant="ghost"
            className="border border-white/10 backdrop-blur-xl gap-1.5 text-xs text-muted-foreground"
          >
            <Eye className="w-3.5 h-3.5" />
            Watch
          </Button>
          <Button
            data-ocid="game.forfeit_button"
            onClick={() => setShowForfeit(true)}
            size="sm"
            variant="ghost"
            className="border border-red-500/30 text-red-400 hover:bg-red-500/10 backdrop-blur-xl gap-1.5 text-xs"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Forfeit
          </Button>
        </div>
      </div>

      {/* LEFT: Token soul sidebar */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 space-y-2 hidden md:block">
        {players.map((player, pi) => (
          <Card
            key={player.id}
            className="bg-black/72 backdrop-blur-xl border border-white/10 w-28"
            data-ocid={`game.player_soul_card.${pi + 1}`}
          >
            <CardContent className="p-2">
              <div className="flex items-center gap-1.5 mb-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: player.colorHex,
                    boxShadow: `0 0 6px ${player.colorHex}`,
                  }}
                />
                <span className="text-[10px] font-bold text-foreground truncate">
                  {player.name}
                </span>
                {player.isAI && (
                  <Bot className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                )}
              </div>
              {player.pieces.map((piece) => {
                const soul = souls.find(
                  (s) => Number(s.tokenIndex) === piece.id,
                );
                const lvl = soul ? Number(soul.level) : piece.soulLevel;
                const xp = soul ? Number(soul.xp) % 100 : piece.soulXp % 100;
                return (
                  <div key={piece.id} className="mb-1.5">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] text-muted-foreground">
                        T{piece.id + 1}
                      </span>
                      <span
                        className="text-[9px] font-black"
                        style={{ color: player.colorHex }}
                      >
                        Lv{lvl}
                      </span>
                    </div>
                    <Progress value={xp} className="h-0.5" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* RIGHT: Oracle legend */}
      {showOracle && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:block">
          <Card className="bg-black/82 backdrop-blur-xl border border-yellow-500/35 shadow-glow-gold w-40">
            <CardHeader className="p-2 pb-1">
              <CardTitle className="text-xs text-yellow-400 flex items-center gap-1.5">
                <Brain className="w-3 h-3" />
                AI Oracle
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-0 space-y-2">
              {(
                [
                  { c: "#22d3ee", l: "Safe (>70%)" },
                  { c: "#f0c040", l: "Moderate" },
                  { c: "#ec4899", l: "Risky (<30%)" },
                ] as const
              ).map(({ c, l }) => (
                <div key={l} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: c, boxShadow: `0 0 4px ${c}` }}
                  />
                  <span className="text-[10px] text-muted-foreground">{l}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chat */}
      {showChat && (
        <div
          className="absolute bottom-20 right-4 z-30"
          data-ocid="game.chat_panel"
        >
          <ChatPanel gameId={gameId} />
        </div>
      )}
    </div>
  );
}
