import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  Swords,
  Zap,
  Shield,
  Lock,
  Sparkles,
  Search,
  X,
  HelpCircle,
  Skull,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useGameText } from '@/hooks/useGameText';
import { MONSTER_DATABASE } from '@/store/gameStore';
import type { MonsterData } from '@/store/gameStore';

/* ============================================================
   Constants & Helpers
   ============================================================ */

const TIER_COLORS: Record<number, { primary: string; secondary: string; accent: string; name: string }> = {
  1: { primary: '#D4A017', secondary: '#8B4513', accent: '#FFD700', name: 'Ember' },
  2: { primary: '#2ECC71', secondary: '#1B6B2E', accent: '#39FF14', name: 'Verdant' },
  3: { primary: '#1ABC9C', secondary: '#0D4F4F', accent: '#00E5FF', name: 'Abyssal' },
  4: { primary: '#8E44AD', secondary: '#4A1A6B', accent: '#E040FB', name: 'Void' },
  5: { primary: '#2980B9', secondary: '#0C1445', accent: '#00BFFF', name: 'Deep Space' },
};

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  concrete: { label: '具象', color: '#D4A017' },
  abstract: { label: '抽象', color: '#8E44AD' },
  adjective: { label: '形容词', color: '#2ECC71' },
  boss: { label: 'Boss', color: '#E74C3C' },
};

function getMonsterSprite(id: string): string {
  const map: Record<string, string> = {
    m001: 'monster-snake.png',
    m002: 'monster-fire-elemental.png',
    m003: 'monster-fear.png',
    m004: 'monster-time.png',
    m005: 'monster-silence.png',
    m006: 'monster-chaos.png',
    m007: 'monster-invisible.png',
    m008: 'monster-dark.png',
    m009: 'monster-boss-homonym.png',
  };
  return `/${map[id] || 'monster-snake.png'}`;
}

function getSpeedLabel(interval: number): { label: string; color: string } {
  if (interval <= 3000) return { label: 'Fast', color: '#E74C3C' };
  if (interval <= 4500) return { label: 'Normal', color: '#D4A017' };
  return { label: 'Slow', color: '#2ECC71' };
}

const STORAGE_KEY = 'bestiary-discovered';

function loadDiscovered(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  // Default: first 3 monsters discovered as demo
  return new Set(['m001', 'm002', 'm004']);
}

function saveDiscovered(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

/* ============================================================
   Sub-components
   ============================================================ */

const MonsterCard: React.FC<{
  monster: MonsterData;
  discovered: boolean;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}> = React.memo(function MonsterCard({ monster, discovered, isSelected, onClick, index }) {
  const tierColor = TIER_COLORS[monster.tier] || TIER_COLORS[1];
  const typeInfo = TYPE_LABELS[monster.type] || TYPE_LABELS.concrete;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      onClick={onClick}
      className="relative cursor-pointer group"
      style={{
        backgroundColor: 'rgba(20,20,30,0.95)',
        border: `1px solid ${isSelected ? tierColor.primary : 'rgba(232,224,208,0.12)'}`,
        borderRadius: '12px',
        padding: '0',
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
        boxShadow: isSelected ? `0 0 16px ${tierColor.primary}30` : 'none',
      }}
      whileHover={{
        y: -4,
        boxShadow: `0 8px 24px rgba(0,0,0,0.4), 0 0 12px ${tierColor.primary}20`,
        borderColor: tierColor.primary,
      }}
    >
      {/* Image Area */}
      <div
        className="relative flex items-center justify-center"
        style={{
          height: '160px',
          background: discovered
            ? `radial-gradient(circle at center, ${tierColor.primary}15 0%, rgba(10,10,15,0.8) 70%)`
            : 'rgba(10,10,15,0.95)',
        }}
      >
        {discovered ? (
          <motion.img
            src={getMonsterSprite(monster.id)}
            alt={monster.displayName}
            className="h-full w-full object-contain p-4"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <HelpCircle
              className="w-16 h-16"
              style={{ color: 'rgba(92,83,70,0.4)' }}
            />
            <span
              className="font-fira-code text-caption"
              style={{ color: '#5C5346' }}
            >
              ???
            </span>
          </div>
        )}

        {/* Undiscovered overlay */}
        {!discovered && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(10,10,15,0.6)' }}
          >
            <Lock className="w-8 h-8" style={{ color: '#5C5346' }} />
          </div>
        )}

        {/* Type badge */}
        <div
          className="absolute top-2 right-2 px-2 py-0.5 rounded-radius-pill font-caption"
          style={{
            backgroundColor: `${typeInfo.color}20`,
            color: typeInfo.color,
            border: `1px solid ${typeInfo.color}40`,
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}
        >
          {typeInfo.label}
        </div>

        {/* Tier badge */}
        <div
          className="absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center font-fira-code text-caption font-bold"
          style={{
            backgroundColor: `${tierColor.primary}20`,
            color: tierColor.primary,
            border: `1px solid ${tierColor.primary}50`,
          }}
        >
          {monster.tier}
        </div>
      </div>

      {/* Info Area */}
      <div className="p-4">
        <h3
          className="font-cinzel text-body text-text-primary tracking-wider truncate"
        >
          {discovered ? monster.displayName : '???'}
        </h3>
        <p
          className="font-inter text-caption mt-1 line-clamp-2"
          style={{ color: '#9B8B7A' }}
        >
          {discovered ? monster.description : '未遭遇此怪物'}
        </p>

        {discovered && (
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-accent-damage" />
              <span className="font-fira-code text-caption text-accent-damage">
                {monster.maxHp}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Swords className="w-3 h-3 text-accent-combo" />
              <span className="font-fira-code text-caption text-accent-combo">
                {monster.attack}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});

const MonsterDetail: React.FC<{
  monster: MonsterData;
  discovered: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}> = React.memo(function MonsterDetail({
  monster, discovered, onClose, onPrev, onNext, hasPrev, hasNext,
}) {
  const tierColor = TIER_COLORS[monster.tier] || TIER_COLORS[1];
  const typeInfo = TYPE_LABELS[monster.type] || TYPE_LABELS.concrete;
  const speedInfo = getSpeedLabel(monster.actionInterval);
  const weaknessWords = monster.weaknessPool;

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
        }}
      />

      {/* Modal Content */}
      <motion.div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: '#14141E',
          border: '1px solid rgba(232,224,208,0.12)',
          borderRadius: '16px',
        }}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full transition-colors cursor-pointer"
          style={{ backgroundColor: 'rgba(10,10,15,0.8)' }}
        >
          <X className="w-5 h-5 text-text-secondary" />
        </button>

        <div className="flex flex-col lg:flex-row">
          {/* Left: Monster Image */}
          <div
            className="relative flex items-center justify-center lg:w-1/2"
            style={{
              minHeight: '320px',
              background: discovered
                ? `radial-gradient(circle at center, ${tierColor.primary}12 0%, #0A0A0F 70%)`
                : '#0A0A0F',
              borderRadius: '16px 0 0 16px',
            }}
          >
            {discovered ? (
              <motion.img
                src={getMonsterSprite(monster.id)}
                alt={monster.displayName}
                className="max-h-72 w-auto object-contain p-6"
                style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.6))' }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <HelpCircle className="w-24 h-24" style={{ color: 'rgba(92,83,70,0.3)' }} />
                <span className="font-cinzel text-2xl text-text-muted">???</span>
              </div>
            )}

            {!discovered && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  backgroundColor: 'rgba(10,10,15,0.7)',
                  borderRadius: '16px 0 0 16px',
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  <Lock className="w-12 h-12 text-text-muted" />
                  <span className="font-inter text-body-sm text-text-muted">未遭遇</span>
                </div>
              </div>
            )}

            {/* Navigation arrows */}
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors cursor-pointer"
              style={{
                backgroundColor: 'rgba(10,10,15,0.7)',
                opacity: hasPrev ? 1 : 0.3,
                pointerEvents: hasPrev ? 'auto' : 'none',
              }}
            >
              <ChevronLeft className="w-6 h-6 text-text-primary" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors cursor-pointer"
              style={{
                backgroundColor: 'rgba(10,10,15,0.7)',
                opacity: hasNext ? 1 : 0.3,
                pointerEvents: hasNext ? 'auto' : 'none',
              }}
            >
              <ChevronRight className="w-6 h-6 text-text-primary" />
            </button>
          </div>

          {/* Right: Details */}
          <div className="lg:w-1/2 p-6 lg:p-8 flex flex-col gap-6">
            {/* Name & Badges */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span
                  className="px-2 py-0.5 rounded-radius-pill font-caption font-semibold"
                  style={{
                    backgroundColor: `${tierColor.primary}20`,
                    color: tierColor.primary,
                    border: `1px solid ${tierColor.primary}40`,
                    fontSize: '0.65rem',
                  }}
                >
                  TIER {monster.tier} — {tierColor.name.toUpperCase()}
                </span>
                <span
                  className="px-2 py-0.5 rounded-radius-pill font-caption font-semibold"
                  style={{
                    backgroundColor: `${typeInfo.color}15`,
                    color: typeInfo.color,
                    border: `1px solid ${typeInfo.color}30`,
                    fontSize: '0.65rem',
                  }}
                >
                  {typeInfo.label}
                </span>
              </div>
              <h2 className="font-cinzel font-display-md text-text-primary tracking-wider uppercase">
                {discovered ? monster.displayName : '???'}
              </h2>
              {discovered && (
                <p className="font-medieval text-body-lg text-text-gold mt-1">
                  {monster.displayName.toUpperCase()}
                </p>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex items-center gap-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-accent-damage" />
                <div>
                  <div className="font-caption text-text-muted uppercase tracking-wider">HP</div>
                  <div className="font-fira-code text-mono-sm text-accent-damage">{monster.maxHp}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-accent-combo" />
                <div>
                  <div className="font-caption text-text-muted uppercase tracking-wider">ATK</div>
                  <div className="font-fira-code text-mono-sm text-accent-combo">{monster.attack}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" style={{ color: speedInfo.color }} />
                <div>
                  <div className="font-caption text-text-muted uppercase tracking-wider">SPD</div>
                  <div className="font-fira-code text-mono-sm" style={{ color: speedInfo.color }}>
                    {speedInfo.label}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Lore */}
            {discovered && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <h4 className="font-caption text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Skull className="w-3 h-3" /> LORE
                </h4>
                <p className="font-medieval text-body-sm text-text-secondary leading-relaxed">
                  {monster.lore}
                </p>
              </motion.div>
            )}

            {/* Weakness */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              <h4 className="font-caption text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
                <Shield className="w-3 h-3" /> WEAKNESS
              </h4>
              {discovered ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {weaknessWords.map((word, i) => (
                      <React.Fragment key={i}>
                        <span
                          className="px-3 py-1 rounded-radius-md font-fira-code text-mono-sm"
                          style={{
                            backgroundColor: 'rgba(212,160,23,0.15)',
                            color: '#FFD700',
                            border: '1px solid rgba(212,160,23,0.3)',
                            textTransform: 'uppercase',
                          }}
                        >
                          {word}
                        </span>
                        {i < weaknessWords.length - 1 && (
                          <span className="font-fira-code text-accent-combo text-lg">+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <div
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-radius-sm w-fit"
                    style={{
                      backgroundColor: 'rgba(231,76,60,0.15)',
                      color: '#E74C3C',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                    }}
                  >
                    <Sparkles className="w-3 h-3" />
                    INSTANT KILL COMBO
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-radius-md font-fira-code text-mono-sm"
                      style={{
                        backgroundColor: 'rgba(92,83,70,0.15)',
                        color: '#5C5346',
                        border: '1px solid rgba(92,83,70,0.2)',
                      }}
                    >
                      ???
                    </span>
                    <span className="font-fira-code text-text-muted">+</span>
                    <span
                      className="px-3 py-1 rounded-radius-md font-fira-code text-mono-sm"
                      style={{
                        backgroundColor: 'rgba(92,83,70,0.15)',
                        color: '#5C5346',
                        border: '1px solid rgba(92,83,70,0.2)',
                      }}
                    >
                      ???
                    </span>
                    <Lock className="w-4 h-4 text-text-muted ml-1" />
                  </div>
                  <p className="font-inter text-caption text-text-muted italic mt-1">
                    Defeat this monster to reveal its weakness
                  </p>
                </div>
              )}
            </motion.div>

            {/* Description / Strategy */}
            {discovered && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <h4 className="font-caption text-text-secondary uppercase tracking-wider mb-2">
                  STRATEGY
                </h4>
                <p className="font-inter text-body-sm text-text-secondary">
                  {monster.description}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

const DiscoveryToast: React.FC<{ monsterName: string; onDone: () => void }> = React.memo(
  function DiscoveryToast({ monsterName, onDone }) {
    const t = useGameText();
    useEffect(() => {
      const timer = setTimeout(onDone, 3500);
      return () => clearTimeout(timer);
    }, [onDone]);

    return (
      <motion.div
        className="fixed top-20 left-1/2 z-[300] px-4 py-3 rounded-radius-lg flex items-center gap-3"
        style={{
          backgroundColor: '#14141E',
          border: '1px solid rgba(212,160,23,0.4)',
          boxShadow: '0 0 24px rgba(212,160,23,0.2)',
        }}
        initial={{ y: -60, x: '-50%', opacity: 0 }}
        animate={{ y: 0, x: '-50%', opacity: 1 }}
        exit={{ y: -60, x: '-50%', opacity: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
        }}
      >
        <Sparkles className="w-5 h-5 text-text-gold" />
        <div>
          <div className="font-cinzel text-body-sm text-text-gold tracking-wider">
            {t('new_discovery')}
          </div>
          <div className="font-inter text-caption text-text-secondary">
            {monsterName} added to Bestiary
          </div>
        </div>
      </motion.div>
    );
  }
);

/* ============================================================
   Main Bestiary Page
   ============================================================ */

const Bestiary: React.FC = React.memo(function Bestiary() {
  const navigate = useNavigate();
  const t = useGameText();
  const [tierFilter, setTierFilter] = useState<number | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonsterId, setSelectedMonsterId] = useState<string | null>(null);
  const [discovered, setDiscovered] = useState<Set<string>>(loadDiscovered);
  const [discoveryToast, setDiscoveryToast] = useState<string | null>(null);

  const allTypes = useMemo(() => {
    const types = new Set(MONSTER_DATABASE.map((m) => m.type));
    return ['all', ...Array.from(types)];
  }, []);

  const filteredMonsters = useMemo(() => {
    return MONSTER_DATABASE.filter((m) => {
      const tierMatch = tierFilter === 'all' || m.tier === tierFilter;
      const typeMatch = typeFilter === 'all' || m.type === typeFilter;
      const searchMatch =
        searchQuery === '' ||
        m.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase());
      return tierMatch && typeMatch && searchMatch;
    });
  }, [tierFilter, typeFilter, searchQuery]);

  const selectedMonster = useMemo(
    () => MONSTER_DATABASE.find((m) => m.id === selectedMonsterId) || null,
    [selectedMonsterId]
  );

  const selectedIndex = useMemo(
    () => filteredMonsters.findIndex((m) => m.id === selectedMonsterId),
    [filteredMonsters, selectedMonsterId]
  );

  const handleMonsterClick = useCallback(
    (monster: MonsterData) => {
      // If first time discovering, trigger celebration
      if (!discovered.has(monster.id)) {
        const next = new Set(discovered);
        next.add(monster.id);
        setDiscovered(next);
        saveDiscovered(next);
        setDiscoveryToast(monster.displayName);
      }
      setSelectedMonsterId(monster.id);
    },
    [discovered]
  );

  const handleNavPrev = useCallback(() => {
    if (selectedIndex > 0) {
      const prev = filteredMonsters[selectedIndex - 1];
      setSelectedMonsterId(prev.id);
    }
  }, [selectedIndex, filteredMonsters]);

  const handleNavNext = useCallback(() => {
    if (selectedIndex < filteredMonsters.length - 1) {
      const next = filteredMonsters[selectedIndex + 1];
      setSelectedMonsterId(next.id);
    }
  }, [selectedIndex, filteredMonsters]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!selectedMonsterId) return;
      if (e.key === 'Escape') setSelectedMonsterId(null);
      if (e.key === 'ArrowLeft') handleNavPrev();
      if (e.key === 'ArrowRight') handleNavNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedMonsterId, handleNavPrev, handleNavNext]);

  const discoveredCount = MONSTER_DATABASE.filter((m) => discovered.has(m.id)).length;

  return (
    <Layout>
      <div
        className="min-h-[100dvh] flex flex-col relative"
        style={{
          backgroundImage: 'url(/bestiary-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Dark overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: 'rgba(10,10,15,0.88)' }}
        />

        {/* Subtle paper texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col flex-1 px-4 py-6 md:px-4 lg:px-4 max-w-7xl mx-auto w-full">
          {/* Header */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
          >
            <motion.h1
              className="font-cinzel font-display-lg text-text-primary tracking-wider"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
            >
              怪物图鉴
            </motion.h1>
            <motion.p
              className="font-cinzel text-body text-text-secondary tracking-[0.15em] mt-1 uppercase"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
            >
              {t('bestiary_title')}
            </motion.p>
            <motion.p
              className="font-medieval text-body-lg text-text-secondary italic mt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.4,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
            >
              &ldquo;Know your enemy. Know their True Name.&rdquo;
            </motion.p>
            <motion.div
              className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-radius-pill"
              style={{
                backgroundColor: 'rgba(212,160,23,0.1)',
                border: '1px solid rgba(212,160,23,0.2)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <Sparkles className="w-3 h-3 text-text-gold" />
              <span className="font-fira-code text-caption text-text-gold">
                已发现 {discoveredCount} / {MONSTER_DATABASE.length}
              </span>
            </motion.div>
          </motion.div>

          {/* Filter Bar */}
          <motion.div
            className="mb-6"
            style={{
              backgroundColor: 'rgba(10,10,15,0.92)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(232,224,208,0.08)',
              borderRadius: '12px',
              padding: '12px 16px',
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: 0.3,
              ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
            }}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              {/* Tier Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-caption text-text-muted mr-1">TIER</span>
                <button
                  onClick={() => setTierFilter('all')}
                  className="px-3 py-1 rounded-radius-pill font-fira-code text-caption tracking-wider transition-all duration-200 cursor-pointer"
                  style={{
                    backgroundColor: tierFilter === 'all' ? 'rgba(212,160,23,0.2)' : 'transparent',
                    border: `1px solid ${tierFilter === 'all' ? 'rgba(212,160,23,0.5)' : 'rgba(232,224,208,0.12)'}`,
                    color: tierFilter === 'all' ? '#D4A017' : '#9B8B7A',
                  }}
                >
                  ALL
                </button>
                {[1, 2, 3, 4, 5].map((t) => {
                  const tc = TIER_COLORS[t];
                  const active = tierFilter === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setTierFilter(active ? 'all' : t)}
                      className="px-3 py-1 rounded-radius-pill font-fira-code text-caption tracking-wider transition-all duration-200 cursor-pointer"
                      style={{
                        backgroundColor: active ? `${tc.primary}25` : 'transparent',
                        border: `1px solid ${active ? `${tc.primary}60` : 'rgba(232,224,208,0.12)'}`,
                        color: active ? tc.primary : '#9B8B7A',
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              {/* Divider */}
              <div
                className="hidden md:block w-px h-6"
                style={{ backgroundColor: 'rgba(232,224,208,0.12)' }}
              />

              {/* Type Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-caption text-text-muted mr-1">TYPE</span>
                {allTypes.map((t) => {
                  const label = t === 'all' ? 'All' : TYPE_LABELS[t]?.label || t;
                  const color = t === 'all' ? '#D4A017' : TYPE_LABELS[t]?.color || '#9B8B7A';
                  const active = typeFilter === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className="px-3 py-1 rounded-radius-pill font-inter text-caption tracking-wider transition-all duration-200 cursor-pointer"
                      style={{
                        backgroundColor: active ? `${color}20` : 'transparent',
                        border: `1px solid ${active ? `${color}50` : 'rgba(232,224,208,0.12)'}`,
                        color: active ? color : '#9B8B7A',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-radius-md font-inter text-body-sm text-text-primary placeholder-text-muted outline-none transition-all duration-200"
                  style={{
                    backgroundColor: '#1E1E2E',
                    border: '1px solid rgba(232,224,208,0.12)',
                    width: '200px',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212,160,23,0.5)';
                    e.currentTarget.style.boxShadow = '0 0 8px rgba(212,160,23,0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(232,224,208,0.12)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    <X className="w-3 h-3 text-text-muted" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Monster Grid */}
          <div className="flex-1">
            {filteredMonsters.length === 0 ? (
              <motion.div
                className="flex flex-col items-center justify-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <HelpCircle className="w-12 h-12 text-text-muted mb-3" />
                <p className="font-inter text-body text-text-muted">
                  No monsters match your filters
                </p>
              </motion.div>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-8"
                layout
              >
                <AnimatePresence mode="popLayout">
                  {filteredMonsters.map((monster, i) => (
                    <MonsterCard
                      key={monster.id}
                      monster={monster}
                      discovered={discovered.has(monster.id)}
                      isSelected={selectedMonsterId === monster.id}
                      onClick={() => handleMonsterClick(monster)}
                      index={i}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <motion.div
            className="flex items-center py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <button
              onClick={() => navigate('/camp')}
              className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors duration-200 cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="font-inter text-body-sm tracking-wide">
                RETURN TO CAMP
              </span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Monster Detail Modal */}
      <AnimatePresence>
        {selectedMonster && (
          <MonsterDetail
            key={selectedMonster.id}
            monster={selectedMonster}
            discovered={discovered.has(selectedMonster.id)}
            onClose={() => setSelectedMonsterId(null)}
            onPrev={handleNavPrev}
            onNext={handleNavNext}
            hasPrev={selectedIndex > 0}
            hasNext={selectedIndex < filteredMonsters.length - 1}
          />
        )}
      </AnimatePresence>

      {/* Discovery Toast */}
      <AnimatePresence>
        {discoveryToast && (
          <DiscoveryToast
            monsterName={discoveryToast}
            onDone={() => setDiscoveryToast(null)}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
});

export default Bestiary;
