import { create } from 'zustand';
import {
  WORD_DATABASE,
  type WordEntry,
} from './wordDatabase';
export * from './wordDatabase';

/* ============================================================
   localStorage Persistence
   ============================================================ */

const SAVE_KEY = 'dungeon-of-lexicon-save';
const SAVE_SCHEMA_VERSION = 2;

function loadSave(): Partial<GameState> | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.schemaVersion !== SAVE_SCHEMA_VERSION) {
      // Schema mismatch — discard rather than load incompatible state
      localStorage.removeItem(SAVE_KEY);
      return null;
    }
    return parsed as Partial<GameState>;
  } catch {
    return null;
  }
}

function saveSave(state: Partial<GameState>) {
  try {
    const saveData = {
      schemaVersion: SAVE_SCHEMA_VERSION,
      playerHp: state.playerHp,
      playerMaxHp: state.playerMaxHp,
      xp: state.xp,
      level: state.level,
      maxTierUnlocked: state.maxTierUnlocked,
      highestLevelReached: state.highestLevelReached,
      totalWordsInscribed: state.totalWordsInscribed,
      totalMonstersDefeated: state.totalMonstersDefeated,
      vocabulary: state.vocabulary,
      inscribed: state.inscribed,
      languageLevel: state.languageLevel,
      totalDamageDealt: state.totalDamageDealt,
      totalDamageTaken: state.totalDamageTaken,
      bestCombo: state.bestCombo,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  } catch {
    // localStorage full or unavailable
  }
}

/* ============================================================
   Types
   ============================================================ */

export interface MonsterData {
  id: string;
  wordId: string;
  displayName: string;
  maxHp: number;
  attack: number;
  actionInterval: number;
  weaknessPool: string[]; // 5-8 candidate words; 2 are chosen each turn
  weaknessMultiplier: number;
  themeColor: string;
  description: string;
  tier: number;
  type: 'concrete' | 'abstract' | 'adjective' | 'boss';
  lore: string;
  attackType: 'physical' | 'elemental' | 'mental' | 'shadow';
}

export interface RoomNode {
  id: string;
  name: string;
  type: 'battle' | 'altar' | 'treasure' | 'boss';
  monsterId?: string;
  connections: string[];
  cleared: boolean;
  background: string;
}

export interface BattleLogEntry {
  id: string;
  text: string;
  type: 'player' | 'monster' | 'combo' | 'weakness' | 'system' | 'heal';
  timestamp: number;
}

export interface DamageResult {
  damage: number;
  isCombo: boolean;
  isWeakness: boolean;
  isAntonym: boolean;
  isSynonym: boolean;
  isCollocation: boolean;
  multiplier: number;
  words: string[];
}

export interface GameState {
  // Player
  playerHp: number;
  playerMaxHp: number;
  xp: number;
  level: number;

  // Progression
  maxTierUnlocked: number;
  highestLevelReached: number;
  totalWordsInscribed: number;
  totalMonstersDefeated: number;

  // Current run
  currentTier: number;
  currentFloor: number;
  roomsCleared: number;
  totalRooms: number;
  currentRoomId: string | null;
  dungeonRooms: RoomNode[];
  runStatus: 'active' | 'won' | 'lost';

  // Vocabulary mastery
  vocabulary: WordEntry[];
  inscribed: string[];

  // Combat
  currentMonster: MonsterData | null;
  monsterHp: number;
  isPlayerTurn: boolean;
  comboWords: [string, string] | null;
  battleLog: BattleLogEntry[];

  // Stats
  totalDamageDealt: number;
  totalDamageTaken: number;
  bestCombo: { words: string; damage: number } | null;
  wordsLearnedThisRun: string[];
  monstersDefeatedThisRun: number;

  // Language learning gradient
  languageLevel: number;

  // Game flow
  isPaused: boolean;
  lastMonsterAttackAt: number;
  currentWeakness: string[];
  currentDefenseResult: { word: string; reduction: number } | null;

  // Actions
  setLanguageLevel: (level: number) => void;
  checkLanguageUpgrade: () => void;
  inscribeWord: (wordId: string) => void;
  unlockTier: (tier: number) => void;
  startDungeon: (tier: number) => void;
  enterRoom: (roomId: string) => void;
  playerCast: (word: string) => DamageResult | null;
  playerCombo: (wordA: string, wordB: string) => DamageResult | null;
  monsterAttack: () => void;
  healPlayer: (amount: number) => void;
  endBattle: (won: boolean) => void;
  returnToCamp: () => void;
  returnToDungeon: () => void;
  clearAltarRoom: (roomId: string) => void;
  nextFloor: () => void;
  playerDefend: (word: string) => { word: string; reduction: number; type: string } | null;
  resetRun: () => void;
  resetGame: () => void;
  togglePause: () => void;
}

/* ============================================================
   Semantic Relations (expanded)
   ============================================================ */

interface SemanticRelation {
  type: 'synonym' | 'antonym' | 'collocation';
  wordA: string;
  wordB: string;
  multiplier: number;
}

export const SEMANTIC_RELATIONS: SemanticRelation[] = [
  // ── Antonyms (x3) ─────────────────────────────────────────
  { type: 'antonym', wordA: 'fire', wordB: 'water', multiplier: 3 },
  { type: 'antonym', wordA: 'ice', wordB: 'fire', multiplier: 3 },
  { type: 'antonym', wordA: 'light', wordB: 'dark', multiplier: 3 },
  { type: 'antonym', wordA: 'big', wordB: 'small', multiplier: 3 },
  { type: 'antonym', wordA: 'hot', wordB: 'cold', multiplier: 3 },
  { type: 'antonym', wordA: 'calm', wordB: 'anger', multiplier: 3 },
  { type: 'antonym', wordA: 'visible', wordB: 'invisible', multiplier: 3 },
  { type: 'antonym', wordA: 'happy', wordB: 'sad', multiplier: 3 },
  { type: 'antonym', wordA: 'strong', wordB: 'weak', multiplier: 3 },
  { type: 'antonym', wordA: 'love', wordB: 'hate', multiplier: 3 },
  { type: 'antonym', wordA: 'begin', wordB: 'end', multiplier: 3 },
  { type: 'antonym', wordA: 'day', wordB: 'night', multiplier: 3 },
  { type: 'antonym', wordA: 'sun', wordB: 'moon', multiplier: 3 },
  { type: 'antonym', wordA: 'fast', wordB: 'slow', multiplier: 3 },
  { type: 'antonym', wordA: 'protect', wordB: 'destroy', multiplier: 3 },
  { type: 'antonym', wordA: 'heal', wordB: 'poison', multiplier: 3 },
  { type: 'antonym', wordA: 'dream', wordB: 'nightmare', multiplier: 3 },
  { type: 'antonym', wordA: 'reality', wordB: 'illusion', multiplier: 3 },
  { type: 'antonym', wordA: 'blessing', wordB: 'curse', multiplier: 3 },
  { type: 'antonym', wordA: 'summon', wordB: 'banish', multiplier: 3 },

  // ── Synonyms (x2) ─────────────────────────────────────────
  { type: 'synonym', wordA: 'brave', wordB: 'courage', multiplier: 2 },
  { type: 'synonym', wordA: 'see', wordB: 'look', multiplier: 2 },
  { type: 'synonym', wordA: 'help', wordB: 'protect', multiplier: 2 },
  { type: 'synonym', wordA: 'wisdom', wordB: 'knowledge', multiplier: 2 },
  { type: 'synonym', wordA: 'ghost', wordB: 'spirit', multiplier: 2 },
  { type: 'synonym', wordA: 'storm', wordB: 'thunder', multiplier: 2 },
  { type: 'synonym', wordA: 'magic', wordB: 'spell', multiplier: 2 },
  { type: 'synonym', wordA: 'dungeon', wordB: 'labyrinth', multiplier: 2 },
  { type: 'synonym', wordA: 'eternity', wordB: 'time', multiplier: 2 },
  { type: 'synonym', wordA: 'synonym', wordB: 'homonym', multiplier: 2 },

  // ── Collocations (x2.5) ───────────────────────────────────
  { type: 'collocation', wordA: 'cut', wordB: 'head', multiplier: 2.5 },
  { type: 'collocation', wordA: 'shout', wordB: 'noise', multiplier: 2.5 },
  { type: 'collocation', wordA: 'order', wordB: 'peace', multiplier: 2.5 },
  { type: 'collocation', wordA: 'light', wordB: 'torch', multiplier: 2.5 },
  { type: 'collocation', wordA: 'time', wordB: 'eternity', multiplier: 2.5 },
  { type: 'collocation', wordA: 'shield', wordB: 'sword', multiplier: 2.5 },
  { type: 'collocation', wordA: 'magic', wordB: 'spell', multiplier: 2.5 },
  { type: 'collocation', wordA: 'shadow', wordB: 'echo', multiplier: 2.5 },
  { type: 'collocation', wordA: 'spirit', wordB: 'ghost', multiplier: 2.5 },
  { type: 'collocation', wordA: 'fortress', wordB: 'shield', multiplier: 2.5 },
  { type: 'collocation', wordA: 'memory', wordB: 'dream', multiplier: 2.5 },
  { type: 'collocation', wordA: 'prophecy', wordB: 'oracle', multiplier: 2.5 },
  { type: 'collocation', wordA: 'destiny', wordB: 'fate', multiplier: 2.5 },
  { type: 'collocation', wordA: 'alchemy', wordB: 'transmute', multiplier: 2.5 },
  { type: 'collocation', wordA: 'void', wordB: 'abyss', multiplier: 2.5 },
  { type: 'collocation', wordA: 'mantra', wordB: 'lexicon', multiplier: 2.5 },
  { type: 'collocation', wordA: 'run', wordB: 'walk', multiplier: 2.5 },
  { type: 'collocation', wordA: 'earth', wordB: 'sky', multiplier: 2.5 },
  { type: 'collocation', wordA: 'star', wordB: 'moon', multiplier: 2.5 },
  { type: 'collocation', wordA: 'metaphor', wordB: 'symbol', multiplier: 2.5 },
];


/** Defense effectiveness: attack type -> defense word -> damage reduction fraction */
const DEFENSE_EFFECTIVENESS: Record<string, Record<string, number>> = {
  physical: { shield: 0.5, block: 0.5, armor: 0.6, protect: 0.5, fortress: 0.7 },
  elemental: { resist: 0.5, absorb: 0.6, water: 0.4, ice: 0.4, fire: 0.4 },
  mental: { focus: 0.5, will: 0.5, calm: 0.5, brave: 0.5, peace: 0.5, courage: 0.5 },
  shadow: { light: 0.6, torch: 0.5, blessing: 0.6, purify: 0.6, visible: 0.4 },
};

/** Pick 2 random words from weakness pool for current turn */
function pickCurrentWeakness(pool: string[]): string[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}


/* ============================================================
   Monster Database (rebalanced HP and attack)
   ============================================================ */

export const MONSTER_DATABASE: MonsterData[] = [
  {
    id: 'm001', wordId: 'w001', displayName: 'Fire Wisp', maxHp: 80, attack: 10, actionInterval: 3000,
    weaknessPool: ['water', 'ice', 'cold', 'dark', 'shadow'], weaknessMultiplier: 4, themeColor: '#E74C3C',
    description: 'A small flame spirit.', tier: 1, type: 'concrete',
    lore: 'The first spark of the lexicon.',
    attackType: 'elemental',
  },
  {
    id: 'm002', wordId: 'w002', displayName: 'Water Sprite', maxHp: 90, attack: 12, actionInterval: 3000,
    weaknessPool: ['fire', 'hot', 'light', 'torch', 'sun'], weaknessMultiplier: 4, themeColor: '#3498DB',
    description: 'A playful water spirit.', tier: 1, type: 'concrete',
    lore: 'Born from the first rain.',
    attackType: 'elemental',
  },
  {
    id: 'm003', wordId: 'w004', displayName: 'Blade Phantom', maxHp: 100, attack: 14, actionInterval: 2800,
    weaknessPool: ['shield', 'armor', 'block', 'protect', 'fortress'], weaknessMultiplier: 4, themeColor: '#95A5A6',
    description: 'A phantom wielding spectral blades.', tier: 1, type: 'concrete',
    lore: 'Every cut leaves a scar on reality.',
    attackType: 'physical',
  },
  {
    id: 'm004', wordId: 'w006', displayName: 'Shadow Moth', maxHp: 110, attack: 13, actionInterval: 3000,
    weaknessPool: ['light', 'torch', 'visible', 'sun', 'blessing'], weaknessMultiplier: 4, themeColor: '#8E44AD',
    description: 'A moth that feeds on darkness.', tier: 1, type: 'abstract',
    lore: 'It fears the light that defines it.',
    attackType: 'shadow',
  },
  {
    id: 'm005', wordId: 'w021', displayName: 'Dread Wraith', maxHp: 150, attack: 18, actionInterval: 2800,
    weaknessPool: ['brave', 'courage', 'light', 'calm', 'strong'], weaknessMultiplier: 4, themeColor: '#34495E',
    description: 'An ethereal shadow that feeds on fear.', tier: 2, type: 'abstract',
    lore: 'Where hope fades, the Wraith grows stronger.',
    attackType: 'mental',
  },
  {
    id: 'm006', wordId: 'w023', displayName: 'Storm Harpy', maxHp: 160, attack: 20, actionInterval: 2600,
    weaknessPool: ['calm', 'peace', 'silence', 'shield', 'order'], weaknessMultiplier: 4, themeColor: '#1ABC9C',
    description: 'A creature of thunder and wind.', tier: 2, type: 'abstract',
    lore: 'Its scream drowns all thought.',
    attackType: 'elemental',
  },
  {
    id: 'm007', wordId: 'w025', displayName: 'Silence Specter', maxHp: 170, attack: 22, actionInterval: 2700,
    weaknessPool: ['shout', 'noise', 'thunder', 'storm', 'resist'], weaknessMultiplier: 4, themeColor: '#BDC3C7',
    description: 'A ghostly figure of absolute silence.', tier: 2, type: 'abstract',
    lore: 'In its realm, no word can exist.',
    attackType: 'mental',
  },
  {
    id: 'm008', wordId: 'w044', displayName: 'Fear Eater', maxHp: 180, attack: 24, actionInterval: 2500,
    weaknessPool: ['brave', 'strong', 'courage', 'will', 'hope'], weaknessMultiplier: 4, themeColor: '#E040FB',
    description: 'A creature that devours courage.', tier: 3, type: 'abstract',
    lore: 'It grows fat on the fears of adventurers.',
    attackType: 'mental',
  },
  {
    id: 'm009', wordId: 'w046', displayName: 'Chaos Amalgam', maxHp: 200, attack: 26, actionInterval: 2400,
    weaknessPool: ['order', 'peace', 'calm', 'focus', 'shield'], weaknessMultiplier: 4, themeColor: '#FF5722',
    description: 'A swirling mass of discord.', tier: 3, type: 'abstract',
    lore: 'Born from shattered grammar.',
    attackType: 'elemental',
  },
  {
    id: 'm010', wordId: 'w050', displayName: 'Thunder Drake', maxHp: 220, attack: 28, actionInterval: 2300,
    weaknessPool: ['silence', 'calm', 'ice', 'water', 'resist'], weaknessMultiplier: 4, themeColor: '#9C27B0',
    description: 'A dragon made of living lightning.', tier: 3, type: 'concrete',
    lore: 'Its roar is the word before creation.',
    attackType: 'elemental',
  },
  {
    id: 'm011', wordId: 'w061', displayName: 'Phantom Stalker', maxHp: 250, attack: 30, actionInterval: 2200,
    weaknessPool: ['see', 'look', 'visible', 'light', 'torch'], weaknessMultiplier: 4, themeColor: '#607D8B',
    description: 'Barely visible until it strikes.', tier: 4, type: 'abstract',
    lore: 'Those who cannot see are its prey.',
    attackType: 'shadow',
  },
  {
    id: 'm012', wordId: 'w063', displayName: 'Chronos Golem', maxHp: 280, attack: 32, actionInterval: 2100,
    weaknessPool: ['stop', 'slow', 'end', 'eternity', 'absorb'], weaknessMultiplier: 4, themeColor: '#D4A017',
    description: 'A clockwork guardian of time.', tier: 4, type: 'concrete',
    lore: 'Forged in the hourglass of eternity.',
    attackType: 'physical',
  },
  {
    id: 'm013', wordId: 'w065', displayName: 'Homonym Tyrant', maxHp: 350, attack: 35, actionInterval: 2000,
    weaknessPool: ['synonym', 'lexicon', 'homonym', 'mantra', 'inscription'], weaknessMultiplier: 4, themeColor: '#FFD700',
    description: 'Three faces, each speaking a different truth.', tier: 5, type: 'boss',
    lore: 'The final keeper. It wears words as shields.',
    attackType: 'mental',
  },
  {
    id: 'm014', wordId: 'w081', displayName: 'Abyss Reaper', maxHp: 400, attack: 40, actionInterval: 1800,
    weaknessPool: ['light', 'blessing', 'torch', 'purify', 'reality'], weaknessMultiplier: 4, themeColor: '#2C3E50',
    description: 'A void that hungers for all words.', tier: 5, type: 'boss',
    lore: 'It is the silence between all syllables.',
    attackType: 'shadow',
  },
];

/* ============================================================
   Helper Functions
   ============================================================ */

function findWord(word: string): WordEntry | undefined {
  return WORD_DATABASE.find(w => w.word.toLowerCase() === word.toLowerCase());
}

function findSemanticRelation(wordA: string, wordB: string): SemanticRelation | undefined {
  const a = wordA.toLowerCase();
  const b = wordB.toLowerCase();
  return SEMANTIC_RELATIONS.find(
    r => (r.wordA === a && r.wordB === b) || (r.wordA === b && r.wordB === a)
  );
}

/** Rebalanced damage formula — weaker single attacks, combos matter */
function calculateBaseDamage(word: WordEntry): number {
  const lengthBonus = Math.max(0, word.word.length - 3);
  const tierBonus = word.tier * 2;
  const base = 3 + lengthBonus + tierBonus;
  const wearDecay = Math.max(0.05, 1 - word.wear * 0.02);
  return Math.max(1, Math.floor(base * wearDecay));
}

/** Weakness hint Chinese translations */
export const WEAKNESS_ZH: Record<string, string> = {
  'ice water': '冰+水 (Ice + Water)',
  'fire hot': '火+热 (Fire + Hot)',
  'cut head': '切割+头部 (Cut + Head)',
  'light torch': '光+火把 (Light + Torch)',
  'brave courage': '勇敢+勇气 (Brave + Courage)',
  'calm peace': '平静+和平 (Calm + Peace)',
  'shout noise': '喊叫+噪音 (Shout + Noise)',
  'brave strong': '勇敢+强壮 (Brave + Strong)',
  'order peace': '秩序+和平 (Order + Peace)',
  'silence calm': '寂静+平静 (Silence + Calm)',
  'see look': '看见+看 (See + Look)',
  'stop slow': '停止+慢 (Stop + Slow)',
  'synonym lexicon': '同义词+词汇 (Synonym + Lexicon)',
  'light blessing': '光+祝福 (Light + Blessing)',
};

function getMonsterForTier(tier: number): MonsterData {
  const candidates = MONSTER_DATABASE.filter(m => m.tier === tier);
  if (candidates.length === 0) {
    // Fallback to nearest tier
    const nearest = MONSTER_DATABASE.filter(m => m.tier <= tier);
    return nearest[nearest.length - 1] || MONSTER_DATABASE[0];
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function generateDungeonRooms(tier: number): RoomNode[] {
  const roomNames = ['Kitchen', 'Forest', 'Arena', 'Library', 'Crypt', 'Hallway', 'Cellar', 'Chamber', 'Gallery', 'Vault'];
  const backgrounds = [
    '/dungeon-room-kitchen.jpg',
    '/dungeon-room-forest.jpg',
    '/dungeon-room-battle.jpg',
    '/dungeon-room-library.jpg',
    '/dungeon-room-crypt.jpg',
  ];
  // More rooms for higher tiers
  const roomCount = 3 + tier * 2;
  const rooms: RoomNode[] = [];

  for (let i = 0; i < roomCount; i++) {
    const isBoss = i === roomCount - 1;
    const isAltar = i === Math.floor(roomCount / 2);
    const isTreasure = i > 0 && i < roomCount - 1 && i % 3 === 0;
    const monster = !isBoss && !isAltar && !isTreasure ? getMonsterForTier(tier) : undefined;
    
    rooms.push({
      id: `room-${i}`,
      name: isBoss ? 'Boss Chamber' : isAltar ? 'Word Altar' : isTreasure ? 'Treasure Room' : roomNames[i % roomNames.length],
      type: isBoss ? 'boss' : isAltar ? 'altar' : isTreasure ? 'treasure' : 'battle',
      monsterId: monster?.id,
      connections: i < roomCount - 1 ? [`room-${i + 1}`] : [],
      cleared: false,
      background: backgrounds[i % backgrounds.length],
    });
  }

  // Branching paths for higher tiers
  if (roomCount > 4) {
    rooms[1].connections.push('room-3');
  }
  if (roomCount > 6) {
    rooms[3].connections.push('room-5');
  }

  return rooms;
}

/* ============================================================
   Zustand Store
   ============================================================ */

let battleLogIdCounter = 0;

export const useGameStore = create<GameState>((set, get) => {
  const saved = loadSave();

  return {
  // Player (load from save if available)
  playerHp: saved?.playerHp ?? 100,
  playerMaxHp: saved?.playerMaxHp ?? 100,
  xp: saved?.xp ?? 0,
  level: saved?.level ?? 1,

  // Progression (load from save)
  maxTierUnlocked: saved?.maxTierUnlocked ?? 1,
  highestLevelReached: saved?.highestLevelReached ?? 1,
  totalWordsInscribed: saved?.totalWordsInscribed ?? 0,
  totalMonstersDefeated: saved?.totalMonstersDefeated ?? 0,

  // Current run (always fresh)
  currentTier: 1,
  currentFloor: 1,
  roomsCleared: 0,
  totalRooms: 0,
  currentRoomId: null,
  dungeonRooms: [],
  runStatus: 'active',

  // Vocabulary (load from save)
  vocabulary: saved?.vocabulary ?? [...WORD_DATABASE],
  inscribed: saved?.inscribed ?? [],

  // Combat (always fresh)
  currentMonster: null,
  monsterHp: 0,
  isPlayerTurn: true,
  comboWords: null,
  battleLog: [],

  // Stats (load from save)
  totalDamageDealt: saved?.totalDamageDealt ?? 0,
  totalDamageTaken: saved?.totalDamageTaken ?? 0,
  bestCombo: saved?.bestCombo ?? null,
  wordsLearnedThisRun: [],
  monstersDefeatedThisRun: 0,

  // Language (load from save)
  languageLevel: saved?.languageLevel ?? 1,

  // Game flow
  isPaused: false,
  lastMonsterAttackAt: 0,
  currentWeakness: [],
  currentDefenseResult: null,

  // ─── Actions ──────────────────────────────────────────────

  setLanguageLevel: (level) => set(() => ({
    languageLevel: Math.max(1, Math.min(4, level)),
  })),

  checkLanguageUpgrade: () => set((state) => {
    const newLevel =
      state.level >= 10 ? 4 :
      state.level >= 6 ? 3 :
      state.level >= 3 ? 2 : 1;
    if (newLevel > state.languageLevel) {
      return { languageLevel: newLevel };
    }
    return {};
  }),

  inscribeWord: (wordId) => set((s) => {
    if (!s.vocabulary.find(w => w.wordId === wordId)) return {};
    if (s.inscribed.includes(wordId)) return {};

    return {
      inscribed: [...s.inscribed, wordId],
      totalWordsInscribed: s.totalWordsInscribed + 1,
      vocabulary: s.vocabulary.map(w =>
        w.wordId === wordId ? { ...w, wear: 0 } : w
      ),
    };
  }),

  unlockTier: (tier) => set((state) => ({
    maxTierUnlocked: Math.max(state.maxTierUnlocked, tier),
  })),

  startDungeon: (tier) => set(() => {
    const rooms = generateDungeonRooms(tier);
    return {
      currentTier: tier,
      currentFloor: 1,
      roomsCleared: 0,
      totalRooms: rooms.length,
      dungeonRooms: rooms,
      currentRoomId: rooms[0]?.id || null,
      playerHp: 100 + (tier - 1) * 20,
      playerMaxHp: 100 + (tier - 1) * 20,
      battleLog: [],
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      bestCombo: null,
      wordsLearnedThisRun: [],
      monstersDefeatedThisRun: 0,
      runStatus: 'active',
    };
  }),

  enterRoom: (roomId) => set((state) => {
    const room = state.dungeonRooms.find(r => r.id === roomId);
    if (!room) return {};

    if (room.type === 'battle' || room.type === 'boss') {
      const monster = MONSTER_DATABASE.find(m => m.id === room.monsterId) || getMonsterForTier(state.currentTier);
      battleLogIdCounter = 0;
      return {
        currentRoomId: roomId,
        currentMonster: monster,
        monsterHp: monster.maxHp,
        isPlayerTurn: true,
        comboWords: null,
        currentWeakness: pickCurrentWeakness(monster.weaknessPool),
        currentDefenseResult: null,
        battleLog: [
          {
            id: `log-${++battleLogIdCounter}`,
            text: `A ${monster.displayName} appears! HP: ${monster.maxHp}`,
            type: 'system',
            timestamp: Date.now(),
          },
        ],
      };
    }

    if (room.type === 'altar') {
      return {
        currentRoomId: roomId,
      };
    }

    if (room.type === 'treasure') {
      const healAmount = 20 + state.currentTier * 10;
      return {
        currentRoomId: roomId,
        playerHp: Math.min(state.playerMaxHp, state.playerHp + healAmount),
        dungeonRooms: state.dungeonRooms.map(r =>
          r.id === roomId ? { ...r, cleared: true } : r
        ),
        roomsCleared: state.roomsCleared + 1,
        battleLog: [
          ...state.battleLog,
          {
            id: `log-${++battleLogIdCounter}`,
            text: `Treasure found! Healed ${healAmount} HP!`,
            type: 'heal',
            timestamp: Date.now(),
          },
        ],
      };
    }

    return { currentRoomId: roomId };
  }),

  playerCast: (word) => {
    const state = get();
    if (!state.isPlayerTurn || !state.currentMonster || state.runStatus !== 'active') return null;
    if (state.monsterHp <= 0) return null;

    const lowered = word.trim().toLowerCase();
    const wordEntry = findWord(word);
    const inVocab = !!wordEntry && state.vocabulary.some(v => v.word.toLowerCase() === lowered);
    if (!wordEntry || !inVocab) {
      set((s) => ({
        battleLog: [
          ...s.battleLog,
          {
            id: `log-${++battleLogIdCounter}`,
            text: `"${word}" is not in your vocabulary!`,
            type: 'system',
            timestamp: Date.now(),
          },
        ],
      }));
      return null;
    }

    // Verify word is valid for current tier
    if (wordEntry.tier > state.currentTier) {
      set((s) => ({
        battleLog: [
          ...s.battleLog,
          {
            id: `log-${++battleLogIdCounter}`,
            text: `"${word}" is too advanced for this tier! (Tier ${wordEntry.tier})`,
            type: 'system',
            timestamp: Date.now(),
          },
        ],
      }));
      return null;
    }

    const baseDamage = calculateBaseDamage(wordEntry);
    const result: DamageResult = {
      damage: baseDamage,
      isCombo: false,
      isWeakness: false,
      isAntonym: false,
      isSynonym: false,
      isCollocation: false,
      multiplier: 1,
      words: [word],
    };

    const newMonsterHp = Math.max(0, state.monsterHp - baseDamage);
    const killsMonster = newMonsterHp === 0;

    const nextWeaknessAfterCast = newMonsterHp > 0 && state.currentMonster
      ? pickCurrentWeakness(state.currentMonster.weaknessPool)
      : state.currentWeakness;

    set((s) => ({
      monsterHp: newMonsterHp,
      isPlayerTurn: false, // ALWAYS switch to monster turn after player attacks
      currentWeakness: nextWeaknessAfterCast,
      currentDefenseResult: null,
      totalDamageDealt: s.totalDamageDealt + baseDamage,
      battleLog: [
        ...s.battleLog,
        {
          id: `log-${++battleLogIdCounter}`,
          text: `"${word}" deals ${baseDamage} damage! (Monster HP: ${newMonsterHp}/${s.currentMonster!.maxHp})`,
          type: 'player',
          timestamp: Date.now(),
        },
      ],
      vocabulary: s.vocabulary.map(w =>
        w.wordId === wordEntry.wordId
          ? { ...w, wear: w.wear + 1 }
          : w
      ),
      wordsLearnedThisRun: !s.wordsLearnedThisRun.includes(wordEntry.word)
        ? [...s.wordsLearnedThisRun, wordEntry.word]
        : s.wordsLearnedThisRun,
      monstersDefeatedThisRun: s.monstersDefeatedThisRun + (killsMonster ? 1 : 0),
    }));

    return result;
  },

  playerCombo: (wordA, wordB) => {
    const state = get();
    if (!state.isPlayerTurn || !state.currentMonster || state.runStatus !== 'active') return null;
    if (state.monsterHp <= 0) return null;

    const entryA = findWord(wordA);
    const entryB = findWord(wordB);
    const aLower = wordA.trim().toLowerCase();
    const bLower = wordB.trim().toLowerCase();
    const inVocabA = !!entryA && state.vocabulary.some(v => v.word.toLowerCase() === aLower);
    const inVocabB = !!entryB && state.vocabulary.some(v => v.word.toLowerCase() === bLower);

    if (!entryA || !entryB || !inVocabA || !inVocabB) {
      set((s) => ({
        battleLog: [
          ...s.battleLog,
          {
            id: `log-${++battleLogIdCounter}`,
            text: 'One or both words are not in your vocabulary!',
            type: 'system',
            timestamp: Date.now(),
          },
        ],
      }));
      return null;
    }

    if (entryA.tier > state.currentTier || entryB.tier > state.currentTier) {
      set((s) => ({
        battleLog: [
          ...s.battleLog,
          {
            id: `log-${++battleLogIdCounter}`,
            text: 'Words too advanced for this tier!',
            type: 'system',
            timestamp: Date.now(),
          },
        ],
      }));
      return null;
    }

    const relation = findSemanticRelation(wordA, wordB);
    const isWeakness =
      state.currentWeakness.includes(wordA.toLowerCase()) &&
      state.currentWeakness.includes(wordB.toLowerCase());

    let multiplier = relation?.multiplier || 1;
    let damage = (calculateBaseDamage(entryA) + calculateBaseDamage(entryB)) * multiplier;

    if (isWeakness) {
      multiplier = state.currentMonster.weaknessMultiplier;
      damage = Math.floor(state.currentMonster.maxHp * 0.6); // 60% max HP, not instant kill
    }

    const result: DamageResult = {
      damage,
      isCombo: true,
      isWeakness,
      isAntonym: relation?.type === 'antonym' || false,
      isSynonym: relation?.type === 'synonym' || false,
      isCollocation: relation?.type === 'collocation' || false,
      multiplier,
      words: [wordA, wordB],
    };

    const newMonsterHp = Math.max(0, state.monsterHp - damage);
    const killsMonster = newMonsterHp === 0;

    let logText = `"${wordA}" + "${wordB}" combo: ${damage} damage!`;
    let logType: BattleLogEntry['type'] = 'combo';
    if (isWeakness) {
      logText = `WEAKNESS STRIKE! "${wordA}" + "${wordB}" deals massive ${damage} damage!`;
      logType = 'weakness';
    } else if (relation?.type === 'antonym') {
      logText = `ANTONYM POWER! "${wordA}" + "${wordB}" = ${damage} damage!`;
    } else if (relation?.type === 'synonym') {
      logText = `SYNERGY! "${wordA}" + "${wordB}" = ${damage} damage!`;
    } else if (relation?.type === 'collocation') {
      logText = `COLLOCATION! "${wordA}" + "${wordB}" = ${damage} damage!`;
    }

    const bestCombo = state.bestCombo;
    const newBestCombo = !bestCombo || damage > bestCombo.damage
      ? { words: `${wordA} + ${wordB}`, damage }
      : bestCombo;

    // Regenerate weakness for next turn if monster survives
    const nextWeakness = newMonsterHp > 0 && state.currentMonster
      ? pickCurrentWeakness(state.currentMonster.weaknessPool)
      : state.currentWeakness;

    set((s) => ({
      monsterHp: newMonsterHp,
      isPlayerTurn: false, // ALWAYS switch to monster turn after combo
      comboWords: [wordA, wordB] as [string, string],
      currentWeakness: nextWeakness,
      currentDefenseResult: null,
      totalDamageDealt: s.totalDamageDealt + damage,
      bestCombo: newBestCombo,
      battleLog: [
        ...s.battleLog,
        {
          id: `log-${++battleLogIdCounter}`,
          text: logText + ` (Monster HP: ${newMonsterHp}/${s.currentMonster!.maxHp})`,
          type: logType,
          timestamp: Date.now(),
        },
      ],
      vocabulary: s.vocabulary.map(w => {
        if (w.wordId === entryA.wordId || w.wordId === entryB.wordId) {
          return { ...w, wear: w.wear + 1 };
        }
        return w;
      }),
      wordsLearnedThisRun: (() => {
        const newWords = [...s.wordsLearnedThisRun];
        if (!newWords.includes(entryA.word)) newWords.push(entryA.word);
        if (!newWords.includes(entryB.word)) newWords.push(entryB.word);
        return newWords;
      })(),
      monstersDefeatedThisRun: s.monstersDefeatedThisRun + (killsMonster ? 1 : 0),
    }));

    return result;
  },

  monsterAttack: () => {
    const state = get();
    if (!state.currentMonster || state.runStatus !== 'active') return;
    // Defensive: prevent rapid-fire attacks (minimum 1.5s between attacks)
    const now = Date.now();
    if (state.lastMonsterAttackAt && now - state.lastMonsterAttackAt < 1500) return;

    // Check if player used defense this turn
    let damage = state.currentMonster.attack;
    let defenseWord = '';
    let reduction = 0;
    if (state.currentDefenseResult) {
      defenseWord = state.currentDefenseResult.word;
      reduction = state.currentDefenseResult.reduction;
      damage = Math.max(1, Math.floor(damage * (1 - reduction)));
    }

    const newHp = Math.max(0, state.playerHp - damage);
    const attackType = state.currentMonster.attackType;

    let logText: string;
    if (defenseWord) {
      logText = `${state.currentMonster.displayName} attacks! You cast "${defenseWord}" — ${Math.round(reduction * 100)}% ${attackType} damage blocked! You take ${damage} damage! (Your HP: ${newHp}/${state.playerMaxHp})`;
    } else {
      logText = `${state.currentMonster.displayName} attacks! You take ${damage} damage! (Your HP: ${newHp}/${state.playerMaxHp})`;
    }

    set((s) => ({
      playerHp: newHp,
      isPlayerTurn: true,
      totalDamageTaken: s.totalDamageTaken + damage,
      lastMonsterAttackAt: now,
      currentDefenseResult: null,
      currentWeakness: pickCurrentWeakness(s.currentMonster!.weaknessPool),
      battleLog: [
        ...s.battleLog,
        {
          id: `log-${++battleLogIdCounter}`,
          text: logText,
          type: 'monster',
          timestamp: Date.now(),
        },
      ],
    }));

    if (newHp <= 0) {
      set({ runStatus: 'lost' });
    }
  },

  /** Player defense during monster turn — type a word to reduce damage */
  playerDefend: (word) => {
    const state = get();
    if (!state.currentMonster || state.isPlayerTurn || state.runStatus !== 'active') return null;

    const w = word.trim().toLowerCase();
    const attackType = state.currentMonster.attackType;
    const rawEffectiveness = DEFENSE_EFFECTIVENESS[attackType]?.[w] || 0;
    const effectiveness = Math.max(0, Math.min(0.95, rawEffectiveness));

    if (effectiveness > 0) {
      set(() => ({
        currentDefenseResult: { word: w, reduction: effectiveness },
      }));
      return { word: w, reduction: effectiveness, type: attackType };
    }

    // Wrong defense word — no protection
    return null;
  },

  healPlayer: (amount) => {
    set((s) => ({
      playerHp: Math.min(s.playerMaxHp, s.playerHp + amount),
      battleLog: [
        ...s.battleLog,
        {
          id: `log-${++battleLogIdCounter}`,
          text: `Healed for ${amount} HP!`,
          type: 'heal',
          timestamp: Date.now(),
        },
      ],
    }));
  },

  endBattle: (won) => {
    set((s) => {
      const updatedRooms = s.dungeonRooms.map(r =>
        r.id === s.currentRoomId ? { ...r, cleared: true } : r
      );
      const clearedCount = updatedRooms.filter(r => r.cleared).length;
      const isBossRoom = s.currentMonster?.type === 'boss';
      const allCleared = updatedRooms.every(r => r.cleared);
      const runOver = isBossRoom || allCleared;

      if (won) {
        const xpGain = s.currentMonster ? s.currentMonster.tier * 15 + 25 : 25;
        const newXp = s.xp + xpGain;
        const newLevel = Math.floor(newXp / 100) + 1;
        const tierUnlock = newLevel >= 10 ? 5 : newLevel >= 7 ? 4 : newLevel >= 5 ? 3 : newLevel >= 3 ? 2 : s.maxTierUnlocked;

        return {
          dungeonRooms: updatedRooms,
          roomsCleared: clearedCount,
          xp: newXp,
          level: newLevel,
          maxTierUnlocked: Math.max(s.maxTierUnlocked, tierUnlock),
          highestLevelReached: Math.max(s.highestLevelReached, newLevel),
          totalMonstersDefeated: s.totalMonstersDefeated + s.monstersDefeatedThisRun,
          currentMonster: null,
          comboWords: null,
          // Only mark run as won when boss is defeated or all rooms cleared
          runStatus: runOver ? 'won' : 'active',
          battleLog: [
            ...s.battleLog,
            {
              id: `log-${++battleLogIdCounter}`,
              text: runOver ? 'DUNGEON CLEARED! VICTORY!' : 'Monster defeated! Press onward...',
              type: 'system',
              timestamp: Date.now(),
            },
          ],
        };
      }

      return {
        dungeonRooms: updatedRooms,
        currentMonster: null,
        runStatus: 'lost',
        battleLog: [
          ...s.battleLog,
          {
            id: `log-${++battleLogIdCounter}`,
            text: 'You have been defeated...',
            type: 'system',
            timestamp: Date.now(),
          },
        ],
      };
    });
  },

  returnToCamp: () => set(() => ({
    currentMonster: null,
    comboWords: null,
    isPaused: false,
    runStatus: 'active',
    currentWeakness: [],
    currentDefenseResult: null,
  })),

  returnToDungeon: () => set(() => ({
    runStatus: 'active',
    currentDefenseResult: null,
  })),

  clearAltarRoom: (roomId) => set((state) => {
    const room = state.dungeonRooms.find(r => r.id === roomId);
    if (!room || room.cleared) return {};
    const healAmount = 15 + state.currentTier * 5;
    return {
      playerHp: Math.min(state.playerMaxHp, state.playerHp + healAmount),
      dungeonRooms: state.dungeonRooms.map(r =>
        r.id === roomId ? { ...r, cleared: true } : r
      ),
      roomsCleared: state.roomsCleared + 1,
      battleLog: [
        ...state.battleLog,
        {
          id: `log-${++battleLogIdCounter}`,
          text: `The altar restores ${healAmount} HP and whispers secrets of the dungeon...`,
          type: 'heal',
          timestamp: Date.now(),
        },
      ],
    };
  }),

  nextFloor: () => set((state) => {
    const rooms = generateDungeonRooms(state.currentTier);
    return {
      currentFloor: state.currentFloor + 1,
      roomsCleared: 0,
      totalRooms: rooms.length,
      dungeonRooms: rooms,
      currentRoomId: rooms[0]?.id || null,
      currentMonster: null,
      monsterHp: 0,
      isPlayerTurn: true,
      comboWords: null,
      battleLog: [],
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      bestCombo: null,
      wordsLearnedThisRun: [],
      monstersDefeatedThisRun: 0,
      runStatus: 'active',
      isPaused: false,
      lastMonsterAttackAt: 0,
      currentWeakness: [],
      currentDefenseResult: null,
    };
  }),

  resetRun: () => set(() => ({
    playerHp: 100,
    playerMaxHp: 100,
    currentFloor: 1,
    roomsCleared: 0,
    totalRooms: 0,
    dungeonRooms: [],
    currentRoomId: null,
    currentMonster: null,
    monsterHp: 0,
    isPlayerTurn: true,
    comboWords: null,
    battleLog: [],
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    bestCombo: null,
    wordsLearnedThisRun: [],
    monstersDefeatedThisRun: 0,
    runStatus: 'active',
    isPaused: false,
    lastMonsterAttackAt: 0,
    currentWeakness: [],
    currentDefenseResult: null,
  })),

  resetGame: () => set(() => ({
    playerHp: 100,
    playerMaxHp: 100,
    xp: 0,
    level: 1,
    maxTierUnlocked: 1,
    highestLevelReached: 1,
    totalWordsInscribed: 0,
    totalMonstersDefeated: 0,
    currentTier: 1,
    currentFloor: 1,
    roomsCleared: 0,
    totalRooms: 0,
    currentRoomId: null,
    dungeonRooms: [],
    runStatus: 'active',
    vocabulary: [...WORD_DATABASE],
    inscribed: [],
    currentMonster: null,
    monsterHp: 0,
    isPlayerTurn: true,
    comboWords: null,
    battleLog: [],
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    bestCombo: null,
    wordsLearnedThisRun: [],
    monstersDefeatedThisRun: 0,
    languageLevel: 1,
    isPaused: false,
    lastMonsterAttackAt: 0,
    currentWeakness: [],
    currentDefenseResult: null,
  })),

  togglePause: () => set((s) => ({ isPaused: !s.isPaused })),
}});

// Auto-save on state changes — safe boundaries only (never mid-battle or mid-run-between-rooms)
useGameStore.subscribe(
  (state) => {
    if (
      !state.currentMonster &&
      (state.dungeonRooms.length === 0 || state.runStatus !== 'active')
    ) {
      saveSave(state);
    }
  }
);
