import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  Sword,
  Skull,
  Trophy,
  TrendingUp,
  Zap,
  BookOpen,
  Star,
  RotateCcw,
  Home,
  Heart,
  Target,
  ArrowRight,
} from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useGameText } from '@/hooks/useGameText';

/* ============================================================
   Tier Configuration
   ============================================================ */

const TIER_CONFIG: Record<number, { primary: string; name: string }> = {
  1: { primary: '#D4A017', name: 'Ember Halls' },
  2: { primary: '#2ECC71', name: 'Verdant Depths' },
  3: { primary: '#1ABC9C', name: 'Abyssal Ruins' },
  4: { primary: '#8E44AD', name: 'Void Chambers' },
  5: { primary: '#2980B9', name: 'Deep Space' },
};

/* ============================================================
   Defeat Quotes
   ============================================================ */

const DEFEAT_QUOTES = [
  'Every defeat is a lesson inscribed in blood.',
  'The dungeon remembers those who return.',
  'Words are your weapons. Sharpen them.',
  'Even the greatest lexicon walkers have fallen.',
  'Your vocabulary grows with every attempt.',
];

const VICTORY_QUOTES = [
  'The dungeon yields its secrets to those who speak true.',
  'Words have power. You have proven it.',
  'Through knowledge, victory.',
  'The lexicon grows stronger with you.',
];

/* ============================================================
   Typewriter Hook
   ============================================================ */

function useTypewriter(text: string, speed: number = 40, delay: number = 600) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const delayTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(delayTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) return;

    const timer = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, speed);

    return () => clearTimeout(timer);
  }, [started, displayed, text, speed]);

  return displayed;
}

/* ============================================================
   Stat Card Component
   ============================================================ */

interface StatCardProps {
  icon: React.ElementType;
  value: string | number;
  label: string;
  color?: string;
  delay?: number;
}

const StatCard = React.memo(function StatCard({
  icon: Icon,
  value,
  label,
  color = '#E8E0D0',
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      className="flex items-center gap-3 rounded-radius-md p-3"
      style={{
        backgroundColor: 'rgba(20,20,30,0.6)',
        border: '1px solid rgba(232,224,208,0.08)',
        backdropFilter: 'blur(4px)',
      }}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
    >
      <div
        className="flex items-center justify-center rounded-radius-sm"
        style={{
          width: '36px',
          height: '36px',
          backgroundColor: `${color}15`,
        }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="flex flex-col">
        <span
          className="font-fira-code text-mono-md leading-tight"
          style={{ color }}
        >
          {value}
        </span>
        <span className="font-inter text-caption text-text-secondary tracking-wide">
          {label}
        </span>
      </div>
    </motion.div>
  );
});

/* ============================================================
   Word Pill Component
   ============================================================ */

interface WordPillProps {
  word: string;
  wear: number;
  index: number;
}

function getWearColor(wear: number): string {
  if (wear > 30) return '#E74C3C';
  if (wear > 15) return '#E67E22';
  if (wear > 5) return '#D4A017';
  return '#2ECC71';
}

const WordPill = React.memo(function WordPill({ word, wear, index }: WordPillProps) {
  return (
    <motion.div
      className="flex items-center gap-2 px-4 py-3 rounded-radius-pill whitespace-nowrap"
      style={{
        backgroundColor: '#1E1E2E',
        border: '1px solid rgba(232,224,208,0.12)',
      }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.3,
        delay: 0.4 + index * 0.05,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      }}
      whileHover={{ y: -2, borderColor: 'rgba(212,160,23,0.5)' }}
    >
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: getWearColor(wear) }}
      />
      <span className="font-fira-code text-mono-sm text-text-primary uppercase tracking-wider">
        {word}
      </span>
    </motion.div>
  );
});

/* ============================================================
   Victory Particles Component
   ============================================================ */

const VictoryParticles = React.memo(function VictoryParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 6 + Math.random() * 6,
        size: 2 + Math.random() * 3,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            bottom: '-10px',
            width: p.size,
            height: p.size,
            backgroundColor: '#D4A017',
            boxShadow: '0 0 6px rgba(212,160,23,0.6)',
          }}
          animate={{
            y: [0, -(typeof window !== 'undefined' ? window.innerHeight + 50 : 900)],
            x: [0, Math.sin(p.id) * 50],
            opacity: [0, 0.8, 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
});

/* ============================================================
   Main GameOver Component
   ============================================================ */

const GameOver: React.FC = React.memo(function GameOver() {
  const navigate = useNavigate();
  const t = useGameText();
  const {
    playerHp,
    totalDamageDealt,
    totalDamageTaken,
    bestCombo,
    roomsCleared,
    totalRooms,
    currentTier,
    currentFloor,
    vocabulary,
    runStatus,
    resetRun,
    startDungeon,
    nextFloor,
  } = useGameStore();

  const isVictory = runStatus === 'won';
  const tierConfig = TIER_CONFIG[currentTier] || TIER_CONFIG[1];

  // Get words used this run (sorted by wear increase)
  const discoveredWords = useMemo(
    () =>
      vocabulary
        .filter(v => v.wear > 0)
        .sort((a, b) => b.wear - a.wear)
        .slice(0, 12),
    [vocabulary]
  );

  // Get all vocabulary words for defeat screen
  const encounteredWords = useMemo(
    () => vocabulary.slice(0, 10),
    [vocabulary]
  );

  // Typewriter quote for defeat
  const randomQuote = useMemo(
    () => DEFEAT_QUOTES[Math.floor(Math.random() * DEFEAT_QUOTES.length)],
    []
  );
  const victoryQuote = useMemo(
    () => VICTORY_QUOTES[Math.floor(Math.random() * VICTORY_QUOTES.length)],
    []
  );
  const typewriterText = useTypewriter(
    isVictory ? victoryQuote : randomQuote,
    40,
    isVictory ? 800 : 600
  );

  // Handle play again (same tier, reset to floor 1)
  const handlePlayAgain = () => {
    resetRun();
    startDungeon(currentTier);
    navigate('/dungeon');
  };

  // Handle next floor (keep progress, advance floor)
  const handleNextFloor = () => {
    nextFloor();
    // Auto-enter first room if it's a battle
    const state = useGameStore.getState();
    const firstRoom = state.dungeonRooms[0];
    if (firstRoom && (firstRoom.type === 'battle' || firstRoom.type === 'boss')) {
      state.enterRoom(firstRoom.id);
      navigate(`/battle/${firstRoom.id}`);
    } else {
      navigate('/dungeon');
    }
  };

  // Handle return to camp
  const handleCamp = () => {
    resetRun();
    navigate('/camp');
  };

  // Animation variants
  const titleAnimation = {
    initial: { scale: 0.5, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
      },
    },
  };

  const victoryPulse = isVictory
    ? {
        animate: {
          scale: [1, 1.02, 1],
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: [0.37, 0, 0.63, 1] as [number, number, number, number],
          },
        },
      }
    : {};

  const subtitleAnimation = {
    initial: { opacity: 0, y: 15 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.3,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      },
    },
  };

  const cardAnimation = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.5,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  const buttonsAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: 0.8,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background image with slow zoom */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${isVictory ? '/gameover-victory.jpg' : '/gameover-defeat.jpg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        initial={{ scale: 1 }}
        animate={{ scale: 1.1 }}
        transition={{ duration: 20, ease: 'linear' }}
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: isVictory
            ? 'rgba(10,10,15,0.7)'
            : 'rgba(10,10,15,0.8)',
        }}
      />

      {/* Victory/Defeat colored gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: isVictory
            ? 'radial-gradient(ellipse at 50% 0%, rgba(212,160,23,0.2) 0%, transparent 60%)'
            : 'radial-gradient(ellipse at center, rgba(41,128,185,0.15) 0%, transparent 60%)',
        }}
      />

      {/* Victory particles */}
      {isVictory && <VictoryParticles />}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-4 py-8 w-full max-w-full">
        {/* Result Title */}
        <motion.div
          className="text-center mb-2"
          {...titleAnimation}
          {...(isVictory ? victoryPulse : {})}
        >
          {isVictory ? (
            <div className="flex items-center justify-center gap-3 mb-2">
              <Trophy className="w-10 h-10 text-accent-combo" />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 mb-2">
              <Skull className="w-10 h-10 text-accent-damage" />
            </div>
          )}
          <h1
            className="font-cinzel font-display-lg tracking-[0.15em]"
            style={{
              color: isVictory ? '#D4A017' : '#E74C3C',
              textShadow: isVictory
                ? '0 0 30px rgba(212,160,23,0.5), 0 0 80px rgba(212,160,23,0.2)'
                : '0 0 30px rgba(231,76,60,0.4), 0 0 80px rgba(231,76,60,0.15)',
            }}
          >
            {isVictory ? t('victory') : t('defeat')}
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="font-medieval text-body-lg text-text-secondary text-center mb-6 italic"
          {...subtitleAnimation}
        >
          {isVictory
            ? 'The dungeon yields its secrets to those who speak true.'
            : 'Your light has faded. But words, once learned, are never truly lost.'}
        </motion.p>

        {/* Statistics Summary Card */}
        <motion.div
          className="w-full rounded-radius-lg p-5 mb-6"
          style={{
            backgroundColor: 'rgba(20,20,30,0.95)',
            border: '1px solid rgba(232,224,208,0.12)',
            borderTop: isVictory
              ? '3px solid #D4A017'
              : '3px solid #E74C3C',
            backdropFilter: 'blur(8px)',
          }}
          {...cardAnimation}
        >
          {/* Header row */}
          <div className="text-center mb-4">
            <p className="font-inter text-body-sm text-text-secondary">
              {t('dungeon_run')}: {tierConfig.name} (Tier {currentTier})
            </p>
            <div className="flex items-center justify-center gap-3 mt-1">
              <span className="font-fira-code text-mono-sm text-text-primary">
                {t('floor_reached')}: {currentFloor}
              </span>
              <span className="font-fira-code text-mono-sm text-text-primary">
                {t('rooms_stat')}: {roomsCleared}/{totalRooms}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div
            className="w-full mb-4"
            style={{ height: '1px', backgroundColor: 'rgba(232,224,208,0.08)' }}
          />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={Sword}
              value={totalDamageDealt}
              label={t('stat_damage_dealt')}
              color="#E74C3C"
              delay={0.56}
            />
            <StatCard
              icon={Target}
              value={totalDamageTaken}
              label={t('stat_damage_taken')}
              color="#E74C3C"
              delay={0.62}
            />
            <StatCard
              icon={BookOpen}
              value={discoveredWords.length}
              label={t('stat_words_found')}
              color="#D4A017"
              delay={0.68}
            />
            <StatCard
              icon={Zap}
              value={useGameStore.getState().vocabulary.reduce((s, w) => s + w.wear, 0)}
              label="Total Wear"
              color="#FFD700"
              delay={0.74}
            />
            <StatCard
              icon={TrendingUp}
              value={roomsCleared}
              label={t('stat_rooms')}
              color="#2ECC71"
              delay={0.8}
            />
            <StatCard
              icon={Heart}
              value={`${playerHp}/${useGameStore.getState().playerMaxHp}`}
              label={t('stat_hp_left')}
              color="#2ECC71"
              delay={0.86}
            />
          </div>

          {/* Best Combo */}
          {bestCombo && (
            <motion.div
              className="mt-4 pt-4"
              style={{
                borderTop: '1px solid rgba(232,224,208,0.08)',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.92 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="font-cinzel text-caption text-text-gold tracking-wider">
                  BEST COMBO
                </span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <span
                  className="font-fira-code text-mono-md text-text-primary px-3 py-1 rounded-radius-pill"
                  style={{
                    backgroundColor: '#1E1E2E',
                    border: '1px solid rgba(232,224,208,0.12)',
                  }}
                >
                  {bestCombo.words.split('+')[0]?.trim()}
                </span>
                <ArrowRight className="w-4 h-4 text-accent-combo" />
                <span
                  className="font-fira-code text-mono-md text-text-primary px-3 py-1 rounded-radius-pill"
                  style={{
                    backgroundColor: '#1E1E2E',
                    border: '1px solid rgba(232,224,208,0.12)',
                  }}
                >
                  {bestCombo.words.split('+')[1]?.trim()}
                </span>
              </div>
              <p className="text-center font-fira-code text-mono-lg mt-2" style={{ color: '#E74C3C' }}>
                -{bestCombo.damage} damage!
              </p>
            </motion.div>
          )}

          {/* Divider */}
          <div
            className="w-full my-4"
            style={{ height: '1px', backgroundColor: 'rgba(232,224,208,0.08)' }}
          />

          {/* Rewards row */}
          <motion.div
            className="flex items-center justify-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <span className="font-fira-code text-mono-sm text-text-gold flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />+{totalRooms * 10 + (isVictory ? 100 : 0)} XP
            </span>
            <span className="font-fira-code text-mono-sm text-accent-heal flex items-center gap-1">
              <Star className="w-4 h-4" />
              {discoveredWords.length} Used
            </span>
          </motion.div>
        </motion.div>

        {/* New Words Discovered Section */}
        {discoveredWords.length > 0 && (
          <motion.div
            className="w-full mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="font-cinzel text-caption text-text-secondary text-center tracking-wider mb-3">
              {isVictory ? 'WORDS DISCOVERED THIS RUN' : 'WORDS ENCOUNTERED'}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {discoveredWords.map((word, i) => (
                <WordPill
                  key={word.wordId}
                  word={word.word}
                  wear={word.wear}
                  index={i}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Defeat: encountered words */}
        {!isVictory && encounteredWords.length > 0 && discoveredWords.length === 0 && (
          <motion.div
            className="w-full mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="font-cinzel text-caption text-text-secondary text-center tracking-wider mb-3">
              WORDS YOU ENCOUNTERED
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {encounteredWords.map((word, i) => (
                <WordPill
                  key={word.wordId}
                  word={word.word}
                  wear={word.wear}
                  index={i}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Typewriter Quote (Defeat) or Victory Quote */}
        <motion.div
          className="text-center mb-6 min-h-[3rem]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <p className="font-medieval text-body-lg text-text-secondary italic">
            {typewriterText}
            <motion.span
              className="inline-block w-[2px] h-5 ml-0.5 align-middle"
              style={{ backgroundColor: isVictory ? '#D4A017' : '#9B8B7A' }}
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col items-stretch gap-3 px-4 w-full"
          {...buttonsAnimation}
        >
          {/* Victory: Next Floor button (primary) */}
          {isVictory && (
            <motion.button
              onClick={handleNextFloor}
              className="flex items-center gap-2 px-4 py-3 rounded-radius-md font-cinzel text-sm tracking-wider transition-all duration-200 cursor-pointer"
              style={{
                backgroundColor: '#2ECC71',
                color: '#0A0A0F',
                boxShadow: '0 0 20px rgba(46,204,113,0.3)',
              }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(46,204,113,0.5)' }}
              whileTap={{ scale: 0.97 }}
            >
              <ArrowRight className="w-4 h-4" />
              NEXT FLOOR (Floor {currentFloor + 1})
            </motion.button>
          )}

          <motion.button
            onClick={handlePlayAgain}
            className="flex items-center gap-2 px-4 py-3 rounded-radius-md font-cinzel text-sm tracking-wider transition-all duration-200 cursor-pointer"
            style={{
              backgroundColor: isVictory ? 'transparent' : tierConfig.primary,
              color: isVictory ? '#9B8B7A' : '#0A0A0F',
              border: isVictory ? '1px solid rgba(232,224,208,0.12)' : 'none',
            }}
            whileHover={{
              scale: 1.05,
              backgroundColor: isVictory ? 'rgba(20,20,30,0.8)' : undefined,
              borderColor: isVictory ? 'rgba(212,160,23,0.5)' : undefined,
              color: isVictory ? '#E8E0D0' : undefined,
            }}
            whileTap={{ scale: 0.97 }}
          >
            {isVictory ? (
              <>
                <RotateCcw className="w-4 h-4" />
                REPLAY THIS TIER
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                {t('try_again')}
              </>
            )}
          </motion.button>

          <motion.button
            onClick={handleCamp}
            className="flex items-center gap-2 px-4 py-3 rounded-radius-md font-cinzel text-sm tracking-wider transition-all duration-200 cursor-pointer"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid rgba(232,224,208,0.12)',
              color: '#9B8B7A',
            }}
            whileHover={{
              scale: 1.03,
              backgroundColor: 'rgba(20,20,30,0.8)',
              borderColor: 'rgba(212,160,23,0.5)',
              color: '#E8E0D0',
            }}
            whileTap={{ scale: 0.97 }}
          >
            <Home className="w-4 h-4" />
            RETURN TO CAMP
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
});

export default GameOver;