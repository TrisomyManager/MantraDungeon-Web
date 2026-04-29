import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Skull,
  Swords,
  Heart,
  Pause,
  Play,
  LogOut,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useGameStore, WEAKNESS_ZH, SEMANTIC_RELATIONS, DEFENSE_WORDS_BY_TYPE, WEAKNESS_DEFENSE_BY_TYPE, getWordBySpell } from '@/store/gameStore';
import type { DamageResult, BattleLogEntry } from '@/store/gameStore';
import { useGameText } from '@/hooks/useGameText';

/* ============================================================
   Tier Colors
   ============================================================ */

const TIER_COLORS: Record<number, { primary: string; secondary: string; accent: string; glow: string; name: string }> = {
  1: { primary: '#D4A017', secondary: '#8B4513', accent: '#FFD700', glow: 'rgba(212,160,23,0.6)', name: 'Ember' },
  2: { primary: '#2ECC71', secondary: '#1B6B2E', accent: '#39FF14', glow: 'rgba(46,204,113,0.6)', name: 'Verdant' },
  3: { primary: '#1ABC9C', secondary: '#0D4F4F', accent: '#00E5FF', glow: 'rgba(26,188,156,0.6)', name: 'Abyssal' },
  4: { primary: '#8E44AD', secondary: '#4A1A6B', accent: '#E040FB', glow: 'rgba(142,68,173,0.6)', name: 'Void' },
  5: { primary: '#2980B9', secondary: '#0C1445', accent: '#00BFFF', glow: 'rgba(41,128,185,0.6)', name: 'Deep Space' },
};

/* ============================================================
   TTS (Text-to-Speech) Helper
   ============================================================ */

function speakWord(word: string, audioOn: boolean) {
  if (!audioOn || typeof window === 'undefined' || !window.speechSynthesis) return;
  // Cancel any ongoing speech to prevent queue buildup
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(word);
  utter.lang = 'en-US';
  utter.rate = 0.9;
  utter.pitch = 1.0;
  utter.volume = 1.0;
  window.speechSynthesis.speak(utter);
}

/* ============================================================
   Word Popup Type
   ============================================================ */

interface WordPopup {
  id: string;
  word: string;
  meaningZh: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

/* ============================================================
   Monster Sprite Mapping
   ============================================================ */

const MONSTER_SPRITE_MAP: Record<string, string> = {
  m001: 'snake',
  m002: 'fire-elemental',
  m003: 'fear',
  m004: 'time',
  m005: 'silence',
  m006: 'chaos',
  m007: 'invisible',
  m008: 'dark',
  m009: 'boss-homonym',
  m010: 'dragon',
  m011: 'golem',
  m012: 'ghost',
  m013: 'demon',
  m014: 'reaper',
};

function getMonsterSprite(monsterId: string): string {
  return MONSTER_SPRITE_MAP[monsterId] || 'snake';
}

/* ============================================================
   Combo Relation Labels
   ============================================================ */

function getComboLabel(result: DamageResult, t: ReturnType<typeof useGameText>): { label: string; sublabel: string } {
  if (result.isWeakness) return { label: t('weakness_kill'), sublabel: 'INSTANT KILL!' };
  if (result.isAntonym) return { label: t('antonym_annihilation'), sublabel: `×${result.multiplier}` };
  if (result.isSynonym) return { label: t('synonym_synergy'), sublabel: `×${result.multiplier}` };
  if (result.isCollocation) return { label: t('collocation_kill'), sublabel: `×${result.multiplier}` };
  return { label: '', sublabel: '' };
}

/* ============================================================
   Damage Number Component
   ============================================================ */

interface DamageNumberProps {
  id: string;
  damage: number;
  type: 'normal' | 'combo' | 'weakness' | 'antonym' | 'heal' | 'playerDamage';
  x: number;
  onDone: (id: string) => void;
}

const DamageNumber: React.FC<DamageNumberProps> = React.memo(function DamageNumber({
  id,
  damage,
  type,
  x,
  onDone,
}) {
  const colors: Record<string, string> = {
    normal: '#E74C3C',
    combo: '#FFD700',
    weakness: '#FFFFFF',
    antonym: '#FFFFFF',
    heal: '#2ECC71',
    playerDamage: '#E74C3C',
  };

  const sizes: Record<string, string> = {
    normal: '1.25rem',
    combo: '1.75rem',
    weakness: 'clamp(1.5rem, 3vw, 2rem)',
    antonym: 'clamp(1.5rem, 3vw, 2rem)',
    heal: '1.25rem',
    playerDamage: '1.75rem',
  };

  useEffect(() => {
    const timer = setTimeout(() => onDone(id), 1200);
    return () => clearTimeout(timer);
  }, [id, onDone]);

  return (
    <motion.div
      initial={{ opacity: 1, scale: 0.5, y: 0, x }}
      animate={{ opacity: 0, scale: 1.2, y: -80, x }}
      transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
      className="absolute pointer-events-none z-[80] font-fira-code font-bold"
      style={{
        color: colors[type],
        fontSize: sizes[type],
        textShadow: type === 'weakness'
          ? '0 0 12px rgba(255,215,0,0.8), 0 0 4px rgba(255,255,255,0.5)'
          : type === 'antonym'
            ? '0 0 12px rgba(255,255,255,0.8)'
            : `0 0 8px ${colors[type]}40`,
        left: '50%',
        top: '40%',
        marginLeft: '-20px',
      }}
    >
      {damage > 0 ? (type === 'heal' ? '+' : '-') : ''}
      {Math.abs(damage)}
      {type === 'weakness' && '!!'}
      {type === 'antonym' && '!!'}
      {type === 'combo' && '!'}
    </motion.div>
  );
});

/* ============================================================
   Battle Log Entry Component
   ============================================================ */

const LogEntry: React.FC<{ entry: BattleLogEntry }> = React.memo(function LogEntry({ entry }) {
  const colors: Record<string, string> = {
    player: '#E8E0D0',
    monster: '#E74C3C',
    combo: '#FFD700',
    weakness: '#FFFFFF',
    heal: '#2ECC71',
    system: '#9B8B7A',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="font-inter text-body-sm mb-1 flex items-start gap-1"
      style={{
        color: colors[entry.type] || '#9B8B7A',
        textShadow: entry.type === 'weakness' ? '0 0 6px rgba(255,255,255,0.4)' : 'none',
      }}
    >
      <span className="text-text-muted select-none shrink-0">&gt;</span>
      <span>{entry.text}</span>
    </motion.div>
  );
});

/* ============================================================
   Main Battle Component
   ============================================================ */

const Battle: React.FC = React.memo(function Battle() {
  const navigate = useNavigate();
  const t = useGameText();
  const {
    currentMonster,
    monsterHp,
    playerHp,
    playerMaxHp,
    isPlayerTurn,
    battleLog,
    currentTier,
    vocabulary,
    isPaused,
    playerCast,
    playerCombo,
    monsterAttack,
    endBattle,
    returnToCamp,
    returnToDungeon,
    togglePause,
  } = useGameStore();

  // ── Local State ──────────────────────────────────────────
  const [input, setInput] = useState('');
  const [inputState, setInputState] = useState<'idle' | 'typing' | 'correct' | 'wrong'>('idle');
  const [comboMode, setComboMode] = useState(false);
  const [firstWord, setFirstWord] = useState('');
  const [damageNumbers, setDamageNumbers] = useState<Array<{ id: string; damage: number; type: DamageNumberProps['type']; x: number }>>([]);
  const [screenShake, setScreenShake] = useState(false);
  const [screenFlash, setScreenFlash] = useState<'combo' | 'antonym' | 'weakness' | 'gold' | null>(null);
  const [redVignette, setRedVignette] = useState(false);
  const [monsterHit, setMonsterHit] = useState(false);
  const [monsterDefeated, setMonsterDefeated] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [showDefeat, setShowDefeat] = useState(false);
  const [comboResult, setComboResult] = useState<DamageResult | null>(null);
  const [showComboFeedback, setShowComboFeedback] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [weaknessRevealed, setWeaknessRevealed] = useState(false);
  const [audioOn] = useState(() => {
    const saved = localStorage.getItem('dol-audio');
    return saved ? saved === 'true' : true;
  });
  const [hasAttackedOnce, setHasAttackedOnce] = useState(false);
  const [muted, setMuted] = useState(false);
  const [wordPool, setWordPool] = useState<string[]>([]);
  const [defensePool, setDefensePool] = useState<string[]>([]);
  const [wordPopups, setWordPopups] = useState<WordPopup[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const comboTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const battleEndedRef = useRef(false);

  const tierColor = TIER_COLORS[currentTier] || TIER_COLORS[1];

  // ── Word Pool + Weakness: unified generation ──────────────
  // Weakness is drawn FROM the word pool, ensuring consistency
  const generateWordPool = useCallback(() => {
    if (!currentMonster) return;

    // Get all available words for this tier
    const available = vocabulary
      .filter(w => w.tier <= currentTier)
      .map(w => w.word);

    // Must include weakness candidates from monster weaknessPool
    const weaknessCandidates = currentMonster.weaknessPool.filter(w => available.includes(w));

    // Fill rest with random words from vocabulary
    const remaining = available.filter(w => !weaknessCandidates.includes(w));
    const shuffled = [...remaining].sort(() => Math.random() - 0.5);

    const poolSize = 5;
    // Include at least 1 weakness word, up to 2
    const weaknessPicks = weaknessCandidates.length > 0
      ? weaknessCandidates.slice(0, Math.min(2, weaknessCandidates.length))
      : [];
    const needed = poolSize - weaknessPicks.length;
    const picked = shuffled.slice(0, Math.max(0, needed));

    const finalPool = [...weaknessPicks, ...picked];
    // Shuffle so weakness isn't always first
    const shuffledPool = finalPool.sort(() => Math.random() - 0.5);
    setWordPool(shuffledPool);

    // Update currentWeakness in store to match the actual pool
    const poolWeakness = shuffledPool.filter(w => currentMonster.weaknessPool.includes(w));
    // Pick 2 from poolWeakness as the active weakness for this turn
    const activeWeakness = poolWeakness.slice(0, Math.min(2, poolWeakness.length));
    useGameStore.setState({ currentWeakness: activeWeakness });
  }, [currentMonster, currentTier, vocabulary]);

  // ── Defense Pool: Generate defense words for monster turn ───
  const generateDefensePool = useCallback(() => {
    if (!currentMonster) return;

    const attackType = currentMonster.attackType;
    const typeWords = DEFENSE_WORDS_BY_TYPE[attackType] || [];

    // Randomly pick 5 defense words for this turn
    const shuffled = [...typeWords].sort(() => Math.random() - 0.5);
    const pool = shuffled.slice(0, 5);

    setDefensePool(pool);
  }, [currentMonster]);

  // Generate word pool when player turn starts
  useEffect(() => {
    if (isPlayerTurn && currentMonster && monsterHp > 0) {
      generateWordPool();
    }
  }, [isPlayerTurn, currentMonster, monsterHp, generateWordPool]);

  // Generate defense pool when monster turn starts
  useEffect(() => {
    if (!isPlayerTurn && currentMonster && monsterHp > 0) {
      generateDefensePool();
    }
  }, [isPlayerTurn, currentMonster, monsterHp, generateDefensePool]);

  // Reset on mount
  useEffect(() => {
    battleEndedRef.current = false;
    if (currentMonster && isPlayerTurn) {
      generateWordPool();
    }
    return () => {
      battleEndedRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const comboHints = React.useMemo(() => {
    if (!currentMonster) return [];
    const weaknessWords = currentMonster
      ? useGameStore.getState().currentWeakness
      : [];
    const hints: { wordA: string; wordB: string; type: string; multiplier: number }[] = [];

    // Weakness combo (highest priority)
    if (weaknessWords.length === 2) {
      hints.push({
        wordA: weaknessWords[0],
        wordB: weaknessWords[1],
        type: 'weakness',
        multiplier: currentMonster.weaknessMultiplier,
      });
    }

    // Find semantic relations that involve weakness words or related vocabulary
    SEMANTIC_RELATIONS.forEach((rel) => {
      // Only show relations where both words are in current vocabulary tier
      const vocabWords = vocabulary
        .filter((w) => w.tier <= currentTier)
        .map((w) => w.word);
      const hasA = vocabWords.includes(rel.wordA);
      const hasB = vocabWords.includes(rel.wordB);
      if (hasA && hasB) {
        // Avoid duplicates
        const exists = hints.some(
          (h) =>
            (h.wordA === rel.wordA && h.wordB === rel.wordB) ||
            (h.wordA === rel.wordB && h.wordB === rel.wordA)
        );
        if (!exists) {
          hints.push({
            wordA: rel.wordA,
            wordB: rel.wordB,
            type: rel.type,
            multiplier: rel.multiplier,
          });
        }
      }
    });

    // Return top 4 hints (weakness + up to 3 relations)
    return hints.slice(0, 4);
  }, [currentMonster, vocabulary, currentTier]);

  // ── Helpers ──────────────────────────────────────────────
  const addDamageNumber = useCallback((damage: number, type: DamageNumberProps['type']) => {
    const id = `dmg-${Date.now()}-${Math.random()}`;
    const x = (Math.random() - 0.5) * 80;
    setDamageNumbers((prev) => [...prev.slice(-4), { id, damage, type, x }]);
  }, []);

  const removeDamageNumber = useCallback((id: string) => {
    setDamageNumbers((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const spawnWordPopup = useCallback((word: string, meaningZh: string) => {
    const id = `wp-${Date.now()}-${Math.random()}`;
    const x = 50 + (Math.random() - 0.5) * 30; // Center area horizontally
    const y = 20 + Math.random() * 20; // Upper area
    setWordPopups((prev) => [...prev.slice(-2), { id, word, meaningZh, x, y }]);
    // Auto remove after 2 seconds
    setTimeout(() => {
      setWordPopups((prev) => prev.filter((p) => p.id !== id));
    }, 2000);
  }, []);

  const focusInput = useCallback(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // ── Scroll Log ───────────────────────────────────────────
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [battleLog]);

  // ── Keyboard height detection (visualViewport + resize fallback) ──
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) {
      // Fallback for environments without visualViewport (e.g., in-app WebView)
      const onResize = () => {
        const h = window.innerHeight;
        // On most mobile devices, innerHeight shrinks when keyboard opens
        const screenH = window.screen?.availHeight || h;
        const kbH = Math.max(0, screenH - h - 80);
        setKeyboardHeight(kbH);
      };
      window.addEventListener('resize', onResize);
      onResize();
      return () => window.removeEventListener('resize', onResize);
    }
    const update = () => {
      const h = vv ? vv.height : window.innerHeight;
      const kbH = Math.max(0, window.innerHeight - h);
      setKeyboardHeight(kbH);
    };
    vv.addEventListener('resize', update);
    update();
    return () => vv.removeEventListener('resize', update);
  }, []);

  // ── Keyboard-aware: scroll input into view when keyboard opens ──
  const keyboardAnchorRef = useRef<HTMLDivElement>(null);
  const handleInputFocus = useCallback(() => {
    // Triple fallback strategy for cross-environment compatibility
    const scrollToBottom = () => {
      // 1. scrollIntoView on anchor element
      keyboardAnchorRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
      // 2. document scrollTo
      document.documentElement.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      });
      // 3. body scrollTo
      document.body.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth',
      });
    };
    // Short delay for keyboard animation
    setTimeout(scrollToBottom, 200);
    // Longer fallback delay
    setTimeout(scrollToBottom, 500);
  }, []);

  // ── Monster Turn Input Prompt ────────────────────────────
  useEffect(() => {
    if (!isPlayerTurn && currentMonster && monsterHp > 0 && !isPaused) {
      setTimerActive(true);
      setTimerKey((k) => k + 1);
      focusInput(); // Focus input immediately for defense typing
    } else {
      setTimerActive(false);
    }
  }, [isPlayerTurn, currentMonster, monsterHp, isPaused, focusInput]);

  // ── Check Battle End ─────────────────────────────────────
  useEffect(() => {
    if (monsterHp <= 0 && currentMonster && !battleEndedRef.current) {
      battleEndedRef.current = true;
      setMonsterDefeated(true);
      setTimerActive(false);
      if (timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current);

      setTimeout(() => {
        setShowVictory(true);
        setTimeout(() => {
          endBattle(true);
          // Read fresh state after endBattle updates the store
          const freshState = useGameStore.getState();
          const wasBoss = currentMonster?.type === 'boss';
          const allCleared = freshState.dungeonRooms.every(r => r.cleared);
          // Boss fight or all rooms cleared → gameover screen
          // Otherwise → return to dungeon to continue exploring
          if (wasBoss || allCleared) {
            navigate('/gameover');
          } else {
            returnToDungeon();
            navigate('/dungeon');
          }
        }, 2500);
      }, 800);
    }
  }, [monsterHp, currentMonster, endBattle, navigate, returnToDungeon]);

  useEffect(() => {
    if (playerHp <= 0 && !battleEndedRef.current) {
      battleEndedRef.current = true;
      setShowDefeat(true);
      setScreenShake(true);
      setRedVignette(true);
      if (timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current);

      setTimeout(() => {
        endBattle(false);
        navigate('/gameover');
      }, 2500);
    }
  }, [playerHp, endBattle, navigate]);

  // ── Pause: ESC key ───────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        togglePause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePause]);

  // ── Pause: blur input ────────────────────────────────────
  useEffect(() => {
    if (isPaused) {
      inputRef.current?.blur();
    } else {
      focusInput();
    }
  }, [isPaused, focusInput]);

  // ── Cleanup on unmount ───────────────────────────────────
  useEffect(() => {
    return () => {
      if (timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current);
      if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    };
  }, []);

  // ── Focus input on mount ─────────────────────────────────
  useEffect(() => {
    focusInput();
  }, [focusInput]);

  // ── Battle End Navigation Guard ──────────────────────────
  useEffect(() => {
    if (!currentMonster && !showVictory && !showDefeat) {
      navigate('/dungeon');
    }
  }, [currentMonster, showVictory, showDefeat, navigate]);

  // ── Word Casting Logic ───────────────────────────────────
  const handleCast = useCallback((word: string) => {
    if (!word.trim() || !isPlayerTurn || battleEndedRef.current) return;
    const w = word.trim().toLowerCase();

    // Validate: word must be in current word pool
    if (!wordPool.includes(w)) {
      setInputState('wrong');
      setTimeout(() => setInputState('idle'), 600);
      setInput('');
      focusInput();
      return;
    }

    const result = playerCast(w);
    if (result) {
      setInputState('correct');
      setWeaknessRevealed(true);
      setHasAttackedOnce(true);

      // TTS: speak the word aloud
      speakWord(w, audioOn);

      // Word popup: show word + Chinese translation
      const wordEntry = getWordBySpell(w);
      if (wordEntry) {
        spawnWordPopup(w, wordEntry.meaningZh);
      }

      // Visual feedback
      setMonsterHit(true);
      setTimeout(() => setMonsterHit(false), 300);

      // Damage number
      addDamageNumber(result.damage, 'normal');

      // Flash effects
      if (result.isWeakness) {
        setScreenFlash('weakness');
        setTimeout(() => setScreenFlash(null), 600);
      }

      setTimeout(() => setInputState('idle'), 400);
    } else {
      setInputState('wrong');
      setTimeout(() => setInputState('idle'), 400);
    }

    setInput('');
    focusInput();
  }, [isPlayerTurn, playerCast, addDamageNumber, focusInput, wordPool]);

  // ── Combo Logic ──────────────────────────────────────────
  const resolveCombo = useCallback((wordA: string, wordB: string) => {
    if (!isPlayerTurn || battleEndedRef.current) return;

    // CRITICAL: Clear combo timeout to prevent double-attack race condition
    if (comboTimeoutRef.current) {
      clearTimeout(comboTimeoutRef.current);
      comboTimeoutRef.current = null;
    }

    // Validate: both words must be in current word pool
    const wA = wordA.toLowerCase();
    const wB = wordB.toLowerCase();
    if (!wordPool.includes(wA) || !wordPool.includes(wB)) {
      setInputState('wrong');
      setTimeout(() => setInputState('idle'), 600);
      setComboMode(false);
      setFirstWord('');
      setInput('');
      focusInput();
      return;
    }

    const result = playerCombo(wordA, wordB);
    if (result) {
      setInputState('correct');
      setWeaknessRevealed(true);
      setHasAttackedOnce(true);
      setComboResult(result);

      // TTS: speak the combo words
      speakWord(`${wordA} ${wordB}`, audioOn);

      // Word popup: show both words + translations
      const entryA = getWordBySpell(wordA);
      const entryB = getWordBySpell(wordB);
      if (entryA) spawnWordPopup(wordA, entryA.meaningZh);
      if (entryB) {
        setTimeout(() => spawnWordPopup(wordB, entryB.meaningZh), 400);
      }

      // Visual feedback
      setMonsterHit(true);
      setTimeout(() => setMonsterHit(false), 300);

      // Combo flash
      if (result.isAntonym) {
        setScreenFlash('antonym');
        setTimeout(() => setScreenFlash(null), 500);
      } else if (result.isWeakness) {
        setScreenFlash('weakness');
        setTimeout(() => setScreenFlash(null), 600);
      } else if (result.isCombo) {
        setScreenFlash('combo');
        setTimeout(() => setScreenFlash(null), 500);
      }

      // Damage number type
      let dmgType: DamageNumberProps['type'] = 'combo';
      if (result.isWeakness) dmgType = 'weakness';
      else if (result.isAntonym) dmgType = 'antonym';
      else if (result.isSynonym || result.isCollocation) dmgType = 'combo';
      addDamageNumber(result.damage, dmgType);

      // Show combo feedback overlay
      if (result.isCombo || result.isWeakness) {
        setShowComboFeedback(true);
        setTimeout(() => setShowComboFeedback(false), 1800);
      }

      setTimeout(() => setInputState('idle'), 400);
    } else {
      // No combo — just cast the second word
      const singleResult = playerCast(wordB);
      if (singleResult) {
        setMonsterHit(true);
        setTimeout(() => setMonsterHit(false), 300);
        addDamageNumber(singleResult.damage, 'normal');
      }
      setInputState(singleResult ? 'correct' : 'wrong');
      setTimeout(() => setInputState('idle'), 400);
    }

    setComboMode(false);
    setFirstWord('');
    setInput('');
    focusInput();
  }, [isPlayerTurn, playerCombo, playerCast, addDamageNumber, focusInput, wordPool]);

  // ── Input Submit Handler ─────────────────────────────────
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!isPlayerTurn) {
      // Monster turn — defense input, then resolve monster attack immediately
      const result = useGameStore.getState().playerDefend(input.trim().toLowerCase());
      if (result) {
        setInputState('correct');
        setTimeout(() => setInputState('idle'), 400);
      } else {
        setInputState('wrong');
        setTimeout(() => setInputState('idle'), 400);
      }
      setInput('');

      // Resolve monster attack after player defense input
      setTimeout(() => {
        if (battleEndedRef.current) return;
        setScreenShake(true);
        setRedVignette(true);
        monsterAttack();
        const monsterDmg = currentMonster?.attack ?? 0;
        if (monsterDmg > 0) {
          addDamageNumber(monsterDmg, 'playerDamage');
        }
        setTimerActive(false);
        setTimeout(() => {
          setScreenShake(false);
          setRedVignette(false);
          focusInput();
        }, 500);
      }, 300);

      return;
    }

    if (comboMode) {
      // Clear combo timeout before resolving to prevent race with monster timer
      if (comboTimeoutRef.current) {
        clearTimeout(comboTimeoutRef.current);
        comboTimeoutRef.current = null;
      }
      resolveCombo(firstWord, input.trim().toLowerCase());
    } else {
      handleCast(input);
    }
  }, [input, isPlayerTurn, comboMode, firstWord, handleCast, resolveCombo, monsterAttack, currentMonster, addDamageNumber, focusInput]);

  // ── Key Handler: Space for Combo (attack turn only) ─────
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isPlayerTurn) return; // No combo during monster turn
    if (e.key === ' ' && !comboMode && input.trim().length > 0) {
      e.preventDefault();
      const word = input.trim().toLowerCase();

      // Validate: first word must be in current word pool
      if (!wordPool.includes(word)) {
        setInputState('wrong');
        setTimeout(() => setInputState('idle'), 400);
        setInput('');
        return;
      }

      setFirstWord(word);
      setComboMode(true);
      setInput('');

      // Combo timeout (5 seconds to enter second word)
      if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
      comboTimeoutRef.current = setTimeout(() => {
        setComboMode(false);
        setFirstWord('');
        // Auto-cast first word if combo timed out (validate pool first)
        if (wordPool.includes(word)) {
          handleCast(word);
        }
      }, 5000);
    }
  }, [input, comboMode, handleCast, wordPool]);

  // ── Input Change Handler ─────────────────────────────────
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Mobile combo trigger: detect trailing space → enter combo mode
    if (!comboMode && val.endsWith(' ')) {
      const raw = val.slice(0, -1).trim(); // remove trailing space
      if (raw.length > 0) {
        const word = raw.toLowerCase();
        if (wordPool.includes(word)) {
          setFirstWord(word);
          setComboMode(true);
          setInput('');
          // Combo timeout
          if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
          comboTimeoutRef.current = setTimeout(() => {
            setComboMode(false);
            setFirstWord('');
            if (wordPool.includes(word)) handleCast(word);
          }, 5000);
          setInputState('typing');
          return;
        }
      }
    }
    setInput(val);
    setInputState(e.target.value.length > 0 ? 'typing' : 'idle');
  }, [comboMode, wordPool, handleCast]);

  // ── Monster HP percent ───────────────────────────────────
  const monsterHpPercent = currentMonster ? (monsterHp / currentMonster.maxHp) * 100 : 0;
  const playerHpPercent = (playerHp / playerMaxHp) * 100;

  // ── Input border color ───────────────────────────────────
  const getInputBorderColor = () => {
    if (!isPlayerTurn && input.trim()) return '#2ECC71';
    switch (inputState) {
      case 'correct': return '#2ECC71';
      case 'wrong': return '#E74C3C';
      case 'typing': return tierColor.accent;
      default: return 'rgba(232,224,208,0.12)';
    }
  };

  const getInputGlow = () => {
    if (!isPlayerTurn && input.trim()) return '0 0 16px rgba(46,204,113,0.4)';
    if (comboMode) return `0 0 20px rgba(255,215,0,0.5), 0 0 40px rgba(255,215,0,0.2)`;
    switch (inputState) {
      case 'correct': return '0 0 12px rgba(46,204,113,0.6), 0 0 4px rgba(46,204,113,0.3)';
      case 'wrong': return '0 0 12px rgba(231,76,60,0.6), 0 0 4px rgba(231,76,60,0.3)';
      case 'typing': return `0 0 16px ${tierColor.glow}`;
      default: return `0 0 8px rgba(212,160,23,0.2)`;
    }
  };

  // ── Combo feedback label ─────────────────────────────────
  const comboLabel = comboResult ? getComboLabel(comboResult, t) : { label: '', sublabel: '' };

  // ── No Monster State ─────────────────────────────────────
  if (!currentMonster) {
    return (
      <div
        className="min-h-[100dvh] flex flex-col items-center justify-center"
        style={{ backgroundColor: '#0A0A0F' }}
      >
        <Skull className="w-12 h-12 text-text-muted mb-4" />
        <p className="font-inter text-body text-text-secondary mb-4">{t('monster_turn')}</p>
        <button
          onClick={() => navigate('/dungeon')}
          className="font-inter text-body-sm text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          Return to Dungeon
        </button>
      </div>
    );
  }

  const monsterSprite = `/monster-${getMonsterSprite(currentMonster.id)}.png`;
  const bgImage = `/dungeon-room-battle.jpg`;

  return (
    <div
      className="relative min-h-[100dvh] flex flex-col overflow-y-auto"
      style={{ cursor: 'crosshair' }}
    >
      {/* ════════════════════════════════════════════════════
          BACKGROUND
          ════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(10,10,15,0.5)' }} />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 40%, rgba(10,10,15,0.7) 100%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${tierColor.glow.replace('0.6', '0.08')} 0%, transparent 60%)`,
        }}
      />

      {/* ════════════════════════════════════════════════════
          SCREEN EFFECTS
          ════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {screenFlash === 'combo' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-[90] pointer-events-none"
            style={{ backgroundColor: 'rgba(255,215,0,0.3)' }}
          />
        )}
        {screenFlash === 'antonym' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-[90] pointer-events-none"
            style={{ backgroundColor: '#FFFFFF' }}
          />
        )}
        {screenFlash === 'weakness' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-[90] pointer-events-none"
            style={{ backgroundColor: 'rgba(255,215,0,0.4)' }}
          />
        )}
        {redVignette && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-[85] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 20%, rgba(231,76,60,0.3) 100%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Screen shake wrapper */}
      <motion.div
        animate={screenShake ? {
          x: [0, -8, 8, -8, 8, -8, 8, -8, 8, 0],
        } : {}}
        transition={{ duration: 0.4 }}
        className="relative z-10 flex flex-col flex-1 overflow-y-auto pb-60"
      >
        {/* ════════════════════════════════════════════════════
            TOP HUD BAR
            ════════════════════════════════════════════════════ */}
        <div
          className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4"
          style={{
            height: '48px',
            backgroundColor: 'rgba(10,10,15,0.92)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid rgba(232,224,208,0.12)',
          }}
        >
          {/* Player HP (Left) */}
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#E74C3C]" />
            <div className="flex gap-[2px]">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="transition-all duration-200"
                  style={{
                    width: '20px',
                    height: '14px',
                    borderRadius: '3px',
                    backgroundColor: i < Math.ceil((playerHpPercent / 100) * 5)
                      ? (playerHpPercent > 30 ? '#E74C3C' : '#8B0000')
                      : 'rgba(231,76,60,0.15)',
                    border: '1px solid rgba(231,76,60,0.3)',
                  }}
                />
              ))}
            </div>
            <span className="font-fira-code text-caption text-text-secondary ml-1">
              {playerHp}/{playerMaxHp}
            </span>
          </div>

          {/* Monster Info (Center) */}
          <div className="flex items-center gap-3">
            <Swords className="w-4 h-4" style={{ color: tierColor.primary }} />
            <span className="font-cinzel text-caption tracking-wider text-text-primary">
              {currentMonster.displayName}
            </span>
            <div
              className="relative overflow-hidden rounded-full"
              style={{ width: '80px', height: '4px', backgroundColor: 'rgba(231,76,60,0.2)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: '#E74C3C' }}
                animate={{ width: `${monsterHpPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <span className="font-fira-code text-caption text-text-muted">
              {monsterHp}/{currentMonster.maxHp}
            </span>
          </div>

          {/* Timer + Pause (Right) */}
          <div className="flex items-center gap-3">
            {!isPlayerTurn && timerActive && (
              <span className="font-fira-code text-mono-sm text-[#E74C3C]">3.0s</span>
            )}
            <button
              onClick={togglePause}
              className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Pause"
            >
              <Pause className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
            MAIN BATTLE AREA
            ════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col items-center justify-center pt-[48px] pb-[160px] px-4">

          {/* Timer Bar */}
          <div className="w-full max-w-full mb-6">
            <div className="flex items-center justify-between mb-1">
              <span className="font-caption text-text-muted">
                {!isPlayerTurn && timerActive
                  ? `${currentMonster?.attackType?.toUpperCase() || 'MONSTER'} ATTACK — DEFEND!`
                  : isPlayerTurn
                    ? t('your_turn')
                    : t('monster_turn') + '...'}
              </span>
              <span className="font-fira-code text-caption text-text-muted">
                {timerActive ? '3.0s' : '---'}
              </span>
            </div>
            <div
              className="h-[6px] rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgba(30,30,46,0.8)' }}
            >
              {!isPlayerTurn && timerActive ? (
                <motion.div
                  key={timerKey}
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 3, ease: 'linear' }}
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #2ECC71 0%, #D4A017 50%, #E74C3C 100%)',
                  }}
                />
              ) : (
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: isPlayerTurn ? '100%' : '0%',
                    backgroundColor: isPlayerTurn ? tierColor.primary : '#E74C3C',
                  }}
                />
              )}
            </div>
          </div>

          {/* Monster Display */}
          <div className="flex flex-col items-center mb-8 relative">
            {/* Monster Name */}
            <motion.h2
              className="font-cinzel font-display-md tracking-[0.15em] mb-3 text-center"
              style={{
                color: hasAttackedOnce ? '#E8E0D0' : '#D4A017',
                textShadow: `0 0 15px ${tierColor.glow}`,
              }}
              animate={monsterDefeated ? {
                opacity: 0,
                x: (Math.random() - 0.5) * 60,
                y: (Math.random() - 0.5) * 40,
                rotate: (Math.random() - 0.5) * 30,
              } : {}}
              transition={{ duration: 0.4, ease: [0.7, 0, 0.84, 0] as [number, number, number, number] }}
            >
              {currentMonster.displayName.toUpperCase()}
            </motion.h2>

            {/* Monster HP Bar */}
            <div className="w-64 h-3 rounded-full overflow-hidden mb-4" style={{ backgroundColor: 'rgba(231,76,60,0.2)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: monsterHpPercent > 50 ? '#E74C3C' : monsterHpPercent > 25 ? '#D4A017' : '#8B44AD' }}
                animate={{ width: `${monsterHpPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>

            {/* Monster Sprite */}
            <motion.div
              className="relative"
              animate={monsterDefeated
                ? { scale: 0.3, opacity: 0, rotate: 15 }
                : monsterHit
                  ? { x: [0, -5, 5, -5, 5, 0], filter: ['brightness(1)', 'brightness(2) saturate(0.5)', 'brightness(1)'] }
                  : { scale: [1, 1.02, 1], y: [0, -4, 0] }
              }
              transition={monsterDefeated
                ? { duration: 0.8, ease: [0.7, 0, 0.84, 0] as [number, number, number, number] }
                : monsterHit
                  ? { duration: 0.3 }
                  : { duration: 3, ease: 'easeInOut', repeat: Infinity }
              }
            >
              <img
                src={monsterSprite}
                alt={currentMonster.displayName}
                className="w-[200px] h-[200px] md:w-[280px] md:h-[280px] object-contain"
                style={{
                  filter: `drop-shadow(0 0 24px ${tierColor.glow})`,
                }}
                draggable={false}
              />
              {/* Hit flash overlay */}
              <AnimatePresence>
                {monsterHit && (
                  <motion.div
                    initial={{ opacity: 0.4 }}
                    animate={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: 'rgba(231,76,60,0.3)' }}
                  />
                )}
              </AnimatePresence>
            </motion.div>

            {/* Word Popups (TTS visual feedback) */}
            <div className="absolute top-0 left-0 right-0 z-[60] pointer-events-none">
              <AnimatePresence>
                {wordPopups.map((popup) => (
                  <motion.div
                    key={popup.id}
                    className="absolute flex flex-col items-center"
                    style={{ left: `${popup.x}%`, top: `${popup.y}%`, transform: 'translateX(-50%)' }}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.9 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  >
                    <div
                      className="px-3 py-1.5 rounded-lg backdrop-blur-sm"
                      style={{
                        backgroundColor: 'rgba(20,20,30,0.85)',
                        border: '1px solid rgba(212,160,23,0.4)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                      }}
                    >
                      <span className="font-cinzel text-sm text-text-gold tracking-wider">
                        {popup.word}
                      </span>
                      <span className="mx-1.5 text-text-muted">·</span>
                      <span className="font-inter text-sm text-text-secondary">
                        {popup.meaningZh}
                      </span>
                    </div>
                    {/* Speaker icon indicator */}
                    <motion.div
                      className="mt-1"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(46,204,113,0.2)', border: '1px solid rgba(46,204,113,0.4)' }}
                      >
                        <span className="text-[10px] text-accent-heal">🔊</span>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <p
              className="mt-3 font-medieval text-body-sm text-text-secondary text-center max-w-[360px]"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
            >
              {currentMonster.description}
            </p>

            {/* Weakness Hint — bilingual */}
            <div className="mt-2 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3" style={{ color: tierColor.accent }} />
                <span className="font-fira-code text-caption text-text-muted">
                  {weaknessRevealed
                    ? `${t('weakness_hint_known')}: ${useGameStore.getState().currentWeakness.join(' ')}`
                    : t('weakness_hint_unknown')}
                </span>
              </div>
              {weaknessRevealed && (
                <span className="font-inter text-caption-sm text-tier1-ember ml-5">
                  {WEAKNESS_ZH[useGameStore.getState().currentWeakness.join(' ')] || ''}
                </span>
              )}
            </div>

            {/* Combo Hints — guide players to use more words */}
            {comboHints.length > 0 && (
              <div className="mt-3 w-full max-w-full">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3 h-3 text-text-gold" />
                  <span className="font-cinzel text-[10px] tracking-wider text-text-muted uppercase">
                    {weaknessRevealed ? 'Known Combos' : 'Try These Combos'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {comboHints.map((hint, idx) => {
                    const typeColor =
                      hint.type === 'weakness'
                        ? '#8B44AD'
                        : hint.type === 'antonym'
                          ? '#D4A017'
                          : hint.type === 'synonym'
                            ? '#2ECC71'
                            : '#1ABC9C';
                    const typeLabel =
                      hint.type === 'weakness'
                        ? 'WEAK'
                        : hint.type === 'antonym'
                          ? 'ANTI'
                          : hint.type === 'synonym'
                            ? 'SYN'
                            : 'COL';
                    return (
                      <motion.div
                        key={`${hint.wordA}-${hint.wordB}`}
                        className="flex items-center gap-1 px-2 py-1 rounded-md"
                        style={{
                          backgroundColor: `${typeColor}15`,
                          border: `1px solid ${typeColor}40`,
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1, duration: 0.3 }}
                      >
                        <span className="font-fira-code text-[10px]" style={{ color: typeColor }}>
                          {typeLabel}
                        </span>
                        <span className="font-fira-code text-[11px] text-text-secondary">
                          {hint.wordA}
                        </span>
                        <span className="text-text-muted text-[10px]">+</span>
                        <span className="font-fira-code text-[11px] text-text-secondary">
                          {hint.wordB}
                        </span>
                        <span className="font-fira-code text-[10px]" style={{ color: typeColor }}>
                          ×{hint.multiplier}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Damage Numbers */}
            <AnimatePresence>
              {damageNumbers.map((dn) => (
                <DamageNumber
                  key={dn.id}
                  id={dn.id}
                  damage={dn.damage}
                  type={dn.type}
                  x={dn.x}
                  onDone={removeDamageNumber}
                />
              ))}
            </AnimatePresence>

            {/* Combo Feedback Overlay */}
            <AnimatePresence>
              {showComboFeedback && comboResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
                  className="absolute inset-0 flex flex-col items-center justify-center z-[75] pointer-events-none"
                >
                  {/* Combo type badge */}
                  <motion.div
                    initial={{ y: -40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
                    className="px-4 py-1 rounded-full mb-2"
                    style={{
                      backgroundColor: comboResult.isAntonym ? '#FFFFFF' : '#FFD700',
                      color: comboResult.isAntonym ? '#0A0A0F' : '#0A0A0F',
                    }}
                  >
                    <span className="font-cinzel text-caption font-bold tracking-wider">
                      {comboLabel.label}
                    </span>
                  </motion.div>

                  {/* Word pills */}
                  <div className="flex items-center gap-3 mb-2">
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.15, duration: 0.3 }}
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: 'rgba(212,160,23,0.2)', border: '1px solid rgba(212,160,23,0.5)' }}
                    >
                      <span className="font-fira-code text-body-sm text-text-gold font-bold">{comboResult.words[0]}</span>
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.25, duration: 0.2 }}
                    >
                      <Sparkles className="w-5 h-5 text-accent-combo" />
                    </motion.div>
                    <motion.div
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.15, duration: 0.3 }}
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: 'rgba(212,160,23,0.2)', border: '1px solid rgba(212,160,23,0.5)' }}
                    >
                      <span className="font-fira-code text-body-sm text-text-gold font-bold">{comboResult.words[1]}</span>
                    </motion.div>
                  </div>

                  {/* Sublabel */}
                  <motion.span
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                    className="font-fira-code text-mono-md font-bold"
                    style={{ color: comboResult.isAntonym ? '#FFFFFF' : '#FFD700' }}
                  >
                    {comboLabel.sublabel}
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
            BOTTOM SECTION: COMBAT LOG + INPUT
            ════════════════════════════════════════════════════ */}
        <div
          ref={keyboardAnchorRef}
          className="fixed left-0 right-0 z-[70] flex flex-col"
          style={{
            bottom: `${keyboardHeight + 8}px`,
            backgroundColor: 'rgba(10,10,15,0.92)',
            backdropFilter: 'blur(8px)',
            borderTop: '1px solid rgba(232,224,208,0.12)',
          }}
        >
          {/* Combat Log */}
          <div
            className="w-full overflow-y-auto px-4 py-2"
            style={{ maxHeight: '100px', minHeight: '60px' }}
          >
            {battleLog.slice(-8).map((entry) => (
              <LogEntry key={entry.id} entry={entry} />
            ))}
            <div ref={logEndRef} />
          </div>

          {/* Input Bar */}
          <div className="px-4 py-3">
            {/* Combo Indicator */}
            <AnimatePresence>
              {comboMode && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center gap-2 mb-2"
                >
                  <span
                    className="font-fira-code text-body-sm font-bold px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: 'rgba(212,160,23,0.2)',
                      border: '1px solid rgba(212,160,23,0.5)',
                      color: '#FFD700',
                    }}
                  >
                    {firstWord}
                  </span>
                  <span className="font-cinzel text-caption text-text-gold">+</span>
                  <span className="font-fira-code text-body-sm text-text-muted italic">___</span>
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="font-caption text-accent-combo ml-2"
                  >
                    COMBO MODE (5s)
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="flex items-center gap-3 max-w-full mx-auto">
              <div
                className="relative flex-1 rounded-radius-md transition-all duration-200"
                style={{
                  backgroundColor: '#14141E',
                  border: `2px solid ${getInputBorderColor()}`,
                  boxShadow: getInputGlow(),
                  transform: inputState === 'typing' ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={handleInputFocus}
                  disabled={isPaused}
                  placeholder={
                    isPaused
                      ? 'PAUSED'
                      : comboMode
                        ? t('speak_word')
                        : isPlayerTurn
                          ? t('speak_word')
                          : currentMonster
                            ? `DEFEND! Type a ${currentMonster.attackType} ward...`
                            : '...'
                  }
                  className="w-full h-14 px-4 bg-transparent font-fira-code text-lg text-text-primary text-center outline-none placeholder:text-[#5C5346] touch-btn"
                  style={{ caretColor: tierColor.accent }}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isPaused}
                className="h-14 px-4 rounded-radius-md font-cinzel text-body-sm font-bold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  backgroundColor: input.trim() && !isPaused
                    ? (isPlayerTurn ? tierColor.primary : '#2ECC71')
                    : 'rgba(30,30,46,0.5)',
                  color: '#0A0A0F',
                  boxShadow: input.trim() && !isPaused
                    ? (isPlayerTurn ? `0 0 12px ${tierColor.glow}` : '0 0 12px rgba(46,204,113,0.4)')
                    : 'none',
                }}
              >
                {isPlayerTurn ? t('cast_btn') : 'DEFEND'}
              </button>
            </form>

            {/* Word Pool — visual reference for current turn (manual typing only) */}
            {isPlayerTurn && wordPool.length > 0 && (
              <motion.div
                className="flex flex-wrap items-center justify-center gap-2 mt-3 mb-1 max-w-full mx-auto select-none pointer-events-none"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <span className="font-cinzel text-[9px] tracking-wider text-text-muted uppercase mr-1">
                  Available
                </span>
                {wordPool.map((w, i) => {
                  const isWeakness = useGameStore.getState().currentWeakness.includes(w);
                  return (
                    <motion.div
                      key={`${w}-${i}`}
                      className="px-3 py-1.5 rounded-md font-fira-code text-xs"
                      style={{
                        backgroundColor: isWeakness
                          ? 'rgba(139,68,173,0.2)'
                          : 'rgba(30,30,46,0.8)',
                        border: isWeakness
                          ? '1px solid rgba(139,68,173,0.5)'
                          : '1px solid rgba(232,224,208,0.08)',
                        color: isWeakness ? '#C084FC' : '#9B8B7A',
                      }}
                    >
                      {w}
                      {isWeakness && (
                        <span className="ml-1 text-[9px] text-text-gold">✦</span>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Defense Pool — monster turn defense word reference */}
            {!isPlayerTurn && defensePool.length > 0 && (
              <motion.div
                className="flex flex-wrap items-center justify-center gap-2 mt-3 mb-1 max-w-full mx-auto select-none pointer-events-none"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <span className="font-cinzel text-[9px] tracking-wider text-text-muted uppercase mr-1">
                  Defense
                </span>
                {defensePool.map((w, i) => {
                  const isWeaknessDef = WEAKNESS_DEFENSE_BY_TYPE[currentMonster?.attackType || '']?.includes(w);
                  return (
                    <motion.div
                      key={`${w}-${i}`}
                      className="px-3 py-1.5 rounded-md font-fira-code text-xs"
                      style={{
                        backgroundColor: isWeaknessDef
                          ? 'rgba(46,204,113,0.15)'
                          : 'rgba(30,30,46,0.8)',
                        border: isWeaknessDef
                          ? '1px solid rgba(46,204,113,0.4)'
                          : '1px solid rgba(232,224,208,0.08)',
                        color: isWeaknessDef ? '#2ECC71' : '#9B8B7A',
                      }}
                    >
                      {w}
                      {isWeaknessDef && (
                        <span className="ml-1 text-[9px] text-accent-heal">🛡</span>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
            <div className="flex items-center justify-between mt-2 max-w-full mx-auto">
              <span className="font-caption text-text-muted">
                {isPlayerTurn ? t('press_esc_pause') : `${currentMonster?.attackType?.toUpperCase()} ATTACK — Cast a defense word!`}
              </span>
              <span className="font-fira-code text-mono-sm text-text-secondary">
                {comboMode
                  ? 'Press ENTER to cast combo'
                  : isPlayerTurn
                    ? t('press_space_combo')
                    : currentMonster
                      ? `Try: ${DEFENSE_WORDS_BY_TYPE[currentMonster.attackType]?.slice(0, 3).join(', ')}...`
                      : ''}
              </span>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: tierColor.primary, boxShadow: `0 0 6px ${tierColor.glow}` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════════
          VICTORY / DEFEAT OVERLAYS
          ════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showVictory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-[95] flex flex-col items-center justify-center pointer-events-none"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.5, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="font-cinzel font-display-lg text-text-gold tracking-[0.15em]"
              style={{ textShadow: '0 0 30px rgba(212,160,23,0.8), 0 0 60px rgba(212,160,23,0.4)' }}
            >
              {t('victory_title')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="font-inter text-body text-text-secondary mt-4"
            >
              {currentMonster?.displayName} {t('defeat_title').toLowerCase()}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDefeat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-[95] flex flex-col items-center justify-center pointer-events-none"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.5, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="font-cinzel font-display-lg text-[#E74C3C] tracking-[0.15em]"
              style={{ textShadow: '0 0 30px rgba(231,76,60,0.8)' }}
            >
              {t('defeat_title')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="font-inter text-body text-text-secondary mt-4"
            >
              The dungeon claims another soul...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════
          PAUSE MENU OVERLAY
          ════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isPaused && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-[110]"
              style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
              onClick={togglePause}
            />
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="absolute inset-0 z-[111] flex items-center justify-center pointer-events-none"
            >
              <div
                className="pointer-events-auto w-full max-w-[360px] rounded-radius-lg p-6 flex flex-col gap-4"
                style={{
                  backgroundColor: '#14141E',
                  border: '1px solid rgba(232,224,208,0.12)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2
                  className="font-cinzel font-display-md text-text-primary text-center tracking-wider mb-2"
                >
                  {t('pause_title')}
                </h2>

                <button
                  onClick={togglePause}
                  className="w-full py-3 rounded-radius-md font-cinzel text-body font-bold transition-all duration-200 hover:brightness-115 cursor-pointer flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: tierColor.primary,
                    color: '#0A0A0F',
                  }}
                >
                  <Play className="w-4 h-4" /> {t('resume_btn')}
                </button>

                <button
                  onClick={() => setMuted((m) => !m)}
                  className="w-full py-3 rounded-radius-md font-inter text-body transition-all duration-200 hover:bg-[#1E1E2E] cursor-pointer flex items-center justify-center gap-2 border"
                  style={{
                    borderColor: 'rgba(232,224,208,0.12)',
                    color: '#E8E0D0',
                  }}
                >
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  {muted ? 'UNMUTE' : 'MUTE'}
                </button>

                <button
                  onClick={() => {
                    togglePause();
                    returnToCamp();
                    navigate('/camp');
                  }}
                  className="w-full py-3 rounded-radius-md font-inter text-body font-bold transition-all duration-200 hover:brightness-115 cursor-pointer flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: '#E74C3C',
                    color: '#FFFFFF',
                  }}
                >
                  <LogOut className="w-4 h-4" /> {t('quit_to_camp')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});

export default Battle;
