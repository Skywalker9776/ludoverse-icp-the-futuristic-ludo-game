# Design Brief: LudoVerse ICP — The Futuristic Ludo Experience

## Purpose & Context
World-first futuristic casino-style Ludo game on Internet Computer with 5 never-before-seen features: Quantum Dice visualization, Living Board states, AI Oracle heatmap, Spectator Mode with particle reactions, Atomic Token Soul system. Deep space casino aesthetic with neon glow, particles, and atmospheric depth.

## Visual Tone
**Luxury futurism.** Neon-drenched, glowing, particle-rich. Every element pulses with energy. The board breathes. Casino-grade visual intensity with accessible gameplay clarity.

## Color Palette (OKLCH)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--background` | - | `0.08 0.01 270` | Deep space black (#0a0012) |
| `--foreground` | - | `0.98 0.01 270` | Near-white text |
| `--card` | - | `0.12 0.02 270` | UI panels, game elements |
| `--primary` | - | `0.60 0.28 290` | Electric purple (feature highlights) |
| `--accent` | - | `0.70 0.28 35` | Gold (CTAs, wins) |
| `--gold` | - | `0.76 0.18 86` | Metallic gold (dice, borders) |
| `--electric-purple` | - | `0.58 0.32 293` | Neon purple (quantum effects) |
| `--cyber-pink` | - | `0.68 0.30 340` | Cyber pink (player 2/heated board) |
| `--electric-blue` | - | `0.60 0.26 248` | Toxic cyan (spectator mode) |
| `--toxic-green` | - | `0.65 0.22 160` | Toxic green (safe zones/oracle) |
| `--ludo-red/green/yellow/blue` | - | Player colors | Ludo pieces with enhanced chroma |

## Typography

| Type | Font | Usage |
|------|------|-------|
| Display | General Sans (400, 700) | Headers, game mode titles, score displays |
| Body | General Sans (400, 500) | Game instructions, chat, UI labels |
| Monospace | Geist Mono | Wallet IDs, transaction hashes, code |

## Structural Zones

| Zone | Background | Border | Elevation | Example |
|------|-----------|--------|-----------|---------|
| Header/Nav | `bg-card` with `border-neon-purple` | Neon glow | Floating | Profile, wallet, settings |
| Game Board | `board-normal` state (animated) | Hexagon clip, neon glow | Centered depth | 3D Ludo board with light trails |
| Spectator Panel | `glass-dark` with backdrop blur | `border-neon-cyan` | Overlay | Live reactions, emoji float |
| Wallet Section | `bg-card` | `border-neon-gold` | Elevated | Deposit address, balance, history |
| Player Cards | `surface-chrome` | Glow per color | Lifted | Per-player token, status, XP |
| Footer/Help | `bg-muted/20` | `border-t` subtle | Recessed | Game rules, feedback, links |

## 5 World-First Features (Visually Distinct)

### 1. **Quantum Dice Visualization**
Spinning quantum sphere with particle cloud before dice reveal. Uses `animate-quantum-spin` keyframe with 360deg rotations on all axes. Gradient colors: purple → cyan → pink → gold → purple.

### 2. **Living Board States**
Board transforms between states: `board-normal`, `board-heated`, `board-electrified`, `board-golden`. Each state has unique inset glow animation. Heating triggered by aggressive play, electricity by consecutive rolls, golden by multi-player presence.

### 3. **AI Oracle Heatmap**
Semi-transparent gradient overlay on board cells. Safe zones: `heatmap-safe` (cyan→green). Risky zones: `heatmap-risky` (pink→red). Updates in real-time based on game state logic.

### 4. **Spectator Mode with Emoji Reactions**
Dark glass panels (`glass-dark`) with 20px blur. Live emoji float upward with `animate-emoji-float`. Each reaction gets random `--tx` offset for organic spread. Reactions trigger on game events (roll, win, move).

### 5. **Atomic Token Soul System**
Ludo tokens display personality badges (XP level, soul emoji, win streak). Each token has `animate-token-glow` pulsing its player color. Gem-like appearance with `shadow-glow-*` per color. Bounces on movement with `animate-token-bounce`.

## Spacing & Rhythm
- **Touch targets:** 44px minimum height/width (mobile)
- **Card padding:** 1.5rem (`p-6`)
- **Gap between elements:** `gap-4` to `gap-8`
- **Board margin:** 2rem edges for breath
- **Typography scale:** 12px → 14px → 16px → 20px → 28px → 40px

## Component Patterns

| Pattern | Usage | Animation |
|---------|-------|-----------|
| Glow Shadow | Buttons, tokens, card borders | Constant glow-pulse or on-hover |
| Neon Border | Active state, feature highlights | 15px glow inset + outset |
| Particle Burst | Dice roll, win celebration | particle-burst 0.8s with CSS --tx, --ty |
| Board Transition | State changes (heated → electrified) | Smooth 0.4s shadow transition |
| Token Movement | Piece sliding on board | Translate + bounce on land |
| Spectator Reaction | Live viewer emoji | Emoji-float 1.5s with random offset |

## Motion & Choreography
- **Dice roll:** 1s ease-in-out, particle burst follows
- **Token move:** 0.5s ease-out translate, bounce on landing
- **Board state change:** 0.4s ease-out shadow transition, then loop animation
- **Glow pulse:** 2s infinite, synchronized across similar elements
- **Spectator emoji:** 1.5s float upward, staggered with 50ms offsets

## Responsive Design
- **Mobile-first:** `sm:` (640px), `md:` (768px), `lg:` (1024px)
- **Game board:** 100% width on mobile, center on desktop with max-width: 800px
- **Spectator panel:** Side-by-side desktop, below board on mobile
- **Wallet section:** Full width on mobile, card layout on desktop
- **Touch optimization:** No hover states on mobile, min 44px interactive areas

## Constraints & Anti-Patterns
- ❌ No solid background images (use layered CSS gradients instead)
- ❌ No more than 3 simultaneous animations per element
- ❌ No pure white (#fff) or pure black (#000) — use oklch tokens only
- ❌ No arbitrary Tailwind colors — all colors via CSS variables
- ✅ All glow effects use OKLCH with 0.6–0.9 opacity for depth
- ✅ All animations respect `prefers-reduced-motion` (defer to frontend implementation)
- ✅ Board depth created via layered inset shadows, not multiple z-index layers

## Signature Detail
**Atomic Soul Tokens:** Each Ludo piece displays a glowing gem-like token with embedded personality system. The token shows player color, current XP level, and a soul emoji that evolves across games. Combined with `animate-token-glow` and per-color shadows, this creates a distinct visual identity for each player — a token that "remembers" its journey.

## Design Tokens (CSS Variables)
All tokens defined in `src/frontend/src/index.css` under `:root` and `.dark` blocks. 100% OKLCH, no hex/rgb. Fonts set via `--font-display`, `--font-body`, `--font-mono`. Animations exported to `tailwind.config.js` keyframes for Tailwind utility consumption.
