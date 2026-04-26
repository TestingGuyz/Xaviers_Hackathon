# AI Virtual Pet Game (ai-tamago) — Full Presentation Summary

This document provides a comprehensive overview of every technical feature, gameplay mechanic, and AI integration for the `ai-tamago` React/Next.js virtual pet project. Structured for hackathon presentation use.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16.2.4 (React 19), TypeScript |
| **Styling** | TailwindCSS v4 + Dynamic CSS Variables (DNA system) |
| **Cloud Database** | Firebase Firestore (real-time sync, per-user save) |
| **Authentication** | Firebase Google Sign-In (OAuth 2.0) |
| **AI / LLM** | Groq SDK (ultra-fast chat & sentiment analysis) |
| **Voice Synthesis** | ElevenLabs API for realistic Text-to-Speech |
| **Voice Input** | Web Speech API (browser-native STT) |
| **Icons** | Lucide React |
| **Fonts** | Press Start 2P (pixel), Space Mono, Inter |

> **Note:** The original local `better-sqlite3` database has been fully replaced with Firebase Firestore for cloud persistence. All progress is now saved per-account.

---

## 🔐 Authentication & Accounts (NEW)

A complete Google Auth account system was added, enabling multi-device cloud saves.

### Google Sign-In Flow
- **Popup-first:** Attempts `signInWithPopup` for instant UX.
- **Redirect fallback:** If the browser blocks popups, automatically falls back to `signInWithRedirect` without user action.
- **Redirect result handling:** `getRedirectResult` is called on page load to capture returning users after a Google redirect.
- **Visual feedback:** "Signing in…" spinner state on the button; disabled while signing in.

### Onboarding Screen (First Launch)
When a new account is created, the player is shown a full onboarding screen:
1. **Choose Your Pet** — Picks from 8+ species with live ASCII preview.
2. **Enter Owner Name** — The player's own name (stored in Firestore).
3. **Name Your Pet** — Custom pet name saved to the cloud.
4. On submit, a **full atomic Firestore write** creates the player's canonical document with all fields: `status`, `dna`, `playerName`, `email`, `photoURL`, `uid`, `createdAt`, daily tasks, accessories, journal, chat history.

### Firestore Security Rules (`firestore.rules`)
- Users can **only read and write their own** `users/{uid}` document.
- All other paths are denied by default.
- Copy to Firebase Console → Firestore → Rules to apply.

---

## 📁 Code Architecture (NEW Folders)

### `src/firebase/` — Firebase Module
Organized, reusable Firebase code extracted into dedicated files:

| File | Purpose |
|---|---|
| `config.ts` | Firebase app initialization (singleton, no hot-reload re-init) |
| `auth.ts` | `loginWithGoogle()`, `logout()`, `handleRedirectResult()`, `onUserChange()` |
| `firestore.ts` | `saveUserProfile()`, `updateUserData()`, `getUserProfile()`, `subscribeToUser()` |
| `index.ts` | Barrel export — import everything from `@/firebase` |

### `src/games/` — Mini Games System (NEW)
Three fully playable interactive mini-games inspired by Talking Tom:

| File | Game |
|---|---|
| `SnakeGame.tsx` | 🐍 Snake Hunt |
| `BubblePop.tsx` | 🫧 Bubble Pop |
| `MemoryMatch.tsx` | 🃏 Memory Match |
| `GameHub.tsx` | 🎮 Game selection hub |

---

## 🎮 Core Gameplay Mechanics

### 1. Robust Status System
- **Core Needs:** Hunger, Happiness, Health, Energy, Hygiene (Poop).
- **Progression:** Age (ticks lived), XP, Rank (0–5).
- **Relational:** Sync Frequency (0–100% bond level).
- **Tick-Based Life Cycle:** Every 5 minutes, stats decay naturally via the `/api/tick` stateless endpoint.

### 2. Interactions & Care
Players manage their pet through animated interactions:

| Button | Effect |
|---|---|
| Feed | Replenishes hunger → `eating` animation |
| Play | Boosts happiness → `playing` animation |
| Bath | Resets hygiene (poop stat) |
| Doctor | Restores health |
| Scold | Discipline — lowers happiness, corrects behavior |
| Sleep | Night Mode — stars & moon UI, restores energy |

### 3. Evolution & Progression
- **Ranks:** Egg → Hatchling → Juvenile → Adult → Elder → Legendary
- **XP Thresholds:** 0 / 50 / 150 / 350 / 700 / 1200
- XP earned from: interactions, daily tasks, **mini-games** (new), and chat.

---

## 🎮 Mini Games System (NEW)

A full arcade-style games hub accessible from the **🎮 Games** tab. XP earned is immediately saved to Firestore and can trigger a rank-up.

### 🐍 Snake Hunt
- **Grid:** 22 × 15 ASCII cells, rendered as a live pixel grid.
- **Controls:** Arrow keys or WASD; mobile D-pad (on-screen buttons).
- **Mechanics:** Snake grows when eating, game ends on wall/self collision.
- **Scoring:** +10 per food item; XP = Score × 1.5.
- **Difficulty:** Medium | XP Range: 20–150

### 🫧 Bubble Pop
- **Mechanics:** Bubbles spawn randomly, grow to full size over 300ms, then disappear after 2.5–4.5 seconds.
- **Combos:** Chain pops within 1.2 seconds for multiplier up to ×8.
- **Timer:** 45 seconds; missed bubbles tracked separately.
- **Scoring:** Points = 10 × combo; XP = Score × 0.8 + accuracy bonus.
- **Difficulty:** Easy | XP Range: 10–100

### 🃏 Memory Match
- **Grid:** 4×4 cards (16 total, 8 unique pet-themed emoji pairs).
- **Mechanics:** Flip two cards; wrong pairs shake and flip back; matched pairs glow purple.
- **Scoring:** XP = 80 − (moves × 2) + time bonus (max 60 pt). Minimum 10 XP.
- **Feedback:** "Perfect Memory!" for ≤10 moves, grade based on efficiency.
- **Difficulty:** Hard | XP Range: 10–100

### 🎮 Game Hub
- Visual game selection screen with live ASCII art previews per game.
- Shows difficulty rating, XP range, and control hint for each game.
- Seamless back-navigation — exiting a game returns to the hub.

---

## 🎨 Visuals & Rendering Engine

### 1. Procedural Pet DNA
Each pet has unique DNA that drives CSS and animation:
- **Hue & Saturation:** Unique color palette via CSS variables.
- **Vibration Frequency:** Controls animation speed.
- **Particle Density:** Generates dynamic background aura particles.
- **Aura Glow:** CSS drop-shadow intensity.
- **DNA Visualizer:** A mini EQ-style bar in the footer shows live DNA values.

### 2. Multi-Frame ASCII Animation
- 8 pet species rendered in ASCII frames.
- States: idle, sleeping, happy, eating, playing, bath, sick, discipline.
- **Interactive Eyes:** `Math.atan2`-based cursor tracking makes eyes follow the mouse in 4 directions (up/down/left/right/center).

---

## 🧠 AI & Intelligent Features

### 1. Conversational AI (Groq LLM)
- Chat with your pet; LLM responds based on species, rank, all current stats, time-of-day, timezone, and user location.
- **Stateless API:** Client sends full context (`currentStatus`, `currentDNA`, `chatHistory`) on each request — no server-side DB needed.
- Chat history is persisted to Firestore.

### 2. Sentiment-Driven DNA Evolution
- After each chat message, `analyzeSentiment()` classifies the user's message.
- `evolveDNA()` mutates the pet's DNA based on sentiment (positive chats make pet more colorful, etc.).

### 3. Secret Journal (AI Memory)
- 35% chance per chat message to generate a "Secret Thought" via the LLM.
- Thoughts are stored in Firestore and unlocked based on Sync Frequency level.
- Journal entries returned directly from the API to the client — no server DB write needed.

### 4. Voice Integration
- **STT:** Web Speech API (microphone input → text).
- **TTS:** ElevenLabs API (pet speaks responses aloud).
- **Auto-Voice toggle:** Seamless voice conversation mode.

---

## 🏆 Gamification & Retention

### Daily Tasks
- 5 tasks per day: Feed ×3, Play ×2, Chat ×5, Bath ×1, Discipline ×1.
- Each task has an XP reward and a live progress bar.
- Tasks are now stored in Firestore per user (reset logic handled client-side).

### Accessory Shop
- Spend XP on hats, vests, and shades.
- Accessories are overlaid directly onto the ASCII pet in real-time.
- Owned/equipped state persisted in Firestore.

### Mini-Games (NEW)
- All 3 games award XP saved directly to Firestore.
- Playing a game also boosts pet happiness by +2.
- Games trigger rank-up automatically if XP threshold is crossed.

---

## 💡 Presentation Highlights (Pitch Points)

1. **"It knows who you are"** — Full Google OAuth account system. Your pet's progress follows you across devices.
2. **"It remembers"** — Firebase Firestore sync means all stats, journal entries, and chat history persist forever.
3. **"You can actually play with it"** — 3 mini-games (Snake, Bubble Pop, Memory Match) that award real XP and affect pet happiness — just like Talking Tom.
4. **"It's alive"** — The Groq LLM + ElevenLabs TTS combination makes the pet respond to your mood, time of day, location, and chat history in real-time.
5. **"It evolves"** — DNA system means no two playthroughs look the same. Your conversations literally change the pet's color and aura.
6. **"It's secure"** — Firestore rules lock each user's data behind their own Google account.

---

## 📂 Full File Map

```
ai-tamago/
├── src/
│   ├── app/
│   │   ├── page.tsx              ← Main game UI (Auth + all tabs)
│   │   ├── layout.tsx            ← suppressHydrationWarning fix
│   │   ├── globals.css           ← Full design system
│   │   └── api/
│   │       ├── interact/         ← Stateless interaction handler
│   │       ├── tick/             ← Stateless time decay
│   │       ├── chat/             ← Stateless AI chat
│   │       ├── tts/              ← ElevenLabs TTS proxy
│   │       └── stt/              ← STT helper
│   ├── firebase/                 ← NEW: Firebase module
│   │   ├── config.ts
│   │   ├── auth.ts
│   │   ├── firestore.ts
│   │   └── index.ts
│   ├── games/                    ← NEW: Mini-games
│   │   ├── SnakeGame.tsx
│   │   ├── BubblePop.tsx
│   │   ├── MemoryMatch.tsx
│   │   └── GameHub.tsx
│   ├── components/
│   │   ├── PetSelector.tsx       ← Updated: owner name + pet name fields
│   │   ├── StatBars.tsx
│   │   └── useVoice.ts
│   └── lib/
│       ├── types.ts              ← PetStatus, PetDNA, DEFAULT_STATUS
│       ├── frames.ts             ← ASCII frames for 8 pet species
│       ├── interaction.ts        ← Stateless interaction logic
│       ├── dna.ts                ← DNA evolution engine
│       ├── llm.ts                ← Groq SDK wrapper
│       └── accessories.ts        ← Accessory catalog
├── firestore.rules               ← NEW: Firestore security rules
└── next.config.ts                ← Webpack buffer polyfill for Firebase
```
