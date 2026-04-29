import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scroll,
  Globe,
  BookOpen,
  Sword,
  Flame,
  Lock,
  X,
  Shield,
  TrendingUp,
  Hammer,
} from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import type { WordEntry, GameState } from '@/store/gameStore';
import { useGameText } from '@/hooks/useGameText';
import Layout from '@/components/Layout';

/* ============================================================
   Constants
   ============================================================ */

const TIER_DATA = [
  {
    tier: 1,
    name: 'Ember Halls',
    theme: '起源营地',
    range: '1-1000词',
    color: '#D4A017',
    secondary: '#8B4513',
    description: 'The warm halls of origin. Most common words dwell here.',
  },
  {
    tier: 2,
    name: 'Verdant Depths',
    theme: '日常平原',
    range: '1001-2000词',
    color: '#2ECC71',
    secondary: '#1B6B2E',
    description: 'Lush plains of everyday vocabulary.',
  },
  {
    tier: 3,
    name: 'Abyssal Ruins',
    theme: '知识森林',
    range: '2001-4000词',
    color: '#1ABC9C',
    secondary: '#0D4F4F',
    description: 'The forest of knowledge. Intermediate words thrive.',
  },
  {
    tier: 4,
    name: 'Void Sanctum',
    theme: '专业高塔',
    range: '4001-6000词',
    color: '#8E44AD',
    secondary: '#4A1A6B',
    description: 'The tower of specialization. Advanced vocabulary.',
  },
  {
    tier: 5,
    name: 'Deep Space',
    theme: '深渊禁书库',
    range: '6001-8000词',
    color: '#2980B9',
    secondary: '#0C1445',
    description: 'The forbidden archives. Expert-level words.',
  },
];

const NAV_CARDS = [
  {
    titleKey: 'word_altar',
    descKey: 'word_altar_desc',
    icon: Scroll,
    path: '/altar',
    screen: 'altar' as const,
  },
  {
    titleKey: 'tier_portal',
    descKey: 'tier_portal_desc',
    icon: Globe,
    action: 'tier',
  },
  {
    titleKey: 'bestiary',
    descKey: 'bestiary_desc',
    icon: BookOpen,
    path: '/bestiary',
    screen: 'bestiary' as const,
  },
  {
    titleKey: 'enter_dungeon_btn',
    descKey: 'enter_dungeon_btn',
    icon: Sword,
    action: 'dungeon',
  },
];

const EASE_DRAMATIC = [0.16, 1, 0.3, 1] as [number, number, number, number];
const EASE_SMOOTH = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

/* ============================================================
   Tier Colors Helper
   ============================================================ */

function getTierColor(tier: number): string {
  return TIER_DATA[tier - 1]?.color ?? '#D4A017';
}

/* ============================================================
   Ember Particles (isolated perpetual animation)
   ============================================================ */

interface EmberParticle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

const EmberParticles: React.FC = React.memo(function EmberParticles() {
  const particles = useMemo<EmberParticle[]>(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 40 + Math.random() * 20,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 3,
      size: 2 + Math.random() * 3,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[5]">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            bottom: '30%',
            width: p.size,
            height: p.size,
            backgroundColor: '#D4A017',
            boxShadow: '0 0 6px rgba(212,160,23,0.6)',
          }}
          animate={{
            y: [0, -120 - Math.random() * 80],
            x: [0, (Math.random() - 0.5) * 40],
            opacity: [0, 0.7, 0.4, 0],
            scale: [0.5, 1, 0.8, 0.3],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
});

/* ============================================================
   Campfire Glow (isolated perpetual animation)
   ============================================================ */

const CampfireGlow: React.FC = React.memo(function CampfireGlow() {
  return (
    <motion.div
      className="absolute pointer-events-none z-[2]"
      style={{
        left: '50%',
        top: '60%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        height: '400px',
        borderRadius: '50%',
        background:
          'radial-gradient(ellipse at center, rgba(212,160,23,0.15) 0%, rgba(212,160,23,0.05) 30%, transparent 60%)',
      }}
      animate={{
        opacity: [0.6, 1, 0.6],
        scale: [0.95, 1.05, 0.95],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: [0.37, 0, 0.63, 1] as [number, number, number, number],
      }}
    />
  );
});

/* ============================================================
   Tier Selection Modal
   ============================================================ */

interface TierModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: number;
  onSelectTier: (tier: number) => void;
  onConfirm: (tier: number) => void;
}

const TierModal: React.FC<TierModalProps> = React.memo(function TierModal({
  isOpen,
  onClose,
  currentTier,
  onSelectTier,
  onConfirm,
}) {
  const t = useGameText();
  const [selectedTier, setSelectedTier] = useState(currentTier);
  const maxTierUnlocked = useGameStore((s) => s.maxTierUnlocked);

  const handleConfirm = useCallback(() => {
    onSelectTier(selectedTier);
    onConfirm(selectedTier);
  }, [selectedTier, onSelectTier, onConfirm]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="relative w-full overflow-hidden"
            style={{
              maxWidth: '640px',
              backgroundColor: '#14141E',
              borderRadius: '12px',
              border: '1px solid rgba(232,224,208,0.12)',
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_DRAMATIC }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(232,224,208,0.12)' }}>
              <div>
                <h2 className="font-cinzel font-display-md text-text-primary tracking-wider">
                  {t('tier_select_title')}
                </h2>
                <p className="font-inter text-body-sm text-text-secondary mt-1">
                  {t('tier_desc')}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-radius-md hover:bg-bg-elevated transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Tier List */}
            <div className="p-6 flex flex-col gap-4">
              {TIER_DATA.map((tier, index) => {
                const isUnlocked = tier.tier <= maxTierUnlocked;
                const isSelected = selectedTier === tier.tier;

                return (
                  <motion.div
                    key={tier.tier}
                    className="relative flex items-center gap-3 p-4 rounded-radius-md cursor-pointer transition-all duration-200"
                    style={{
                      backgroundColor: isSelected
                        ? `${tier.color}10`
                        : `${tier.color}05`,
                      border: isSelected
                        ? `2px solid ${tier.color}`
                        : '1px solid rgba(232,224,208,0.08)',
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: index * 0.06,
                      duration: 0.4,
                      ease: EASE_DRAMATIC,
                    }}
                    onClick={() => isUnlocked && setSelectedTier(tier.tier)}
                    whileHover={isUnlocked ? { y: -2 } : {}}
                  >
                    {/* Tier Badge */}
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-cinzel font-bold text-sm"
                      style={{
                        backgroundColor: `${tier.color}20`,
                        border: `2px solid ${tier.color}`,
                        color: tier.color,
                      }}
                    >
                      {tier.tier}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-cinzel text-heading tracking-wider"
                          style={{ color: isUnlocked ? tier.color : '#5C5346' }}
                        >
                          {tier.name}
                        </span>
                        <span className="font-medieval text-body-sm text-text-secondary">
                          {tier.theme}
                        </span>
                      </div>
                      <p className="font-fira-code text-caption text-text-secondary mt-0.5">
                        {tier.range}
                      </p>
                    </div>

                    {/* Lock / Select */}
                    <div className="flex-shrink-0">
                      {!isUnlocked ? (
                        <div className="flex items-center gap-1 text-text-muted">
                          <Lock className="w-4 h-4" />
                          <span className="font-caption">Locked</span>
                        </div>
                      ) : isSelected ? (
                        <div
                          className="px-3 py-1 rounded-radius-sm font-caption"
                          style={{
                            backgroundColor: `${tier.color}30`,
                            color: tier.color,
                            border: `1px solid ${tier.color}60`,
                          }}
                        >
                          SELECTED
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-end gap-3 p-6 border-t"
              style={{ borderColor: 'rgba(232,224,208,0.12)' }}
            >
              <button
                onClick={onClose}
                className="px-4 py-3 rounded-radius-md font-cinzel text-body-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                {t('tier_cancel')}
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-3 rounded-radius-md font-cinzel text-body-sm cursor-pointer transition-all duration-200 hover:brightness-115 active:scale-95"
                style={{
                  backgroundColor: getTierColor(selectedTier),
                  color: '#0A0A0F',
                }}
              >
                {t('tier_confirm')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

/* ============================================================
   Stat Row Component
   ============================================================ */

const StatRow: React.FC<{ label: string; value: React.ReactNode }> = React.memo(
  function StatRow({ label, value }) {
    return (
      <div className="flex items-center justify-between">
        <span className="font-caption text-text-secondary tracking-wider">{label}</span>
        <span className="font-fira-code text-body-sm text-text-primary">{value}</span>
      </div>
    );
  }
);

/* ============================================================
   Main Camp Component
   ============================================================ */

const Camp: React.FC = React.memo(function Camp() {
  const navigate = useNavigate();
  const t = useGameText();
  const {
    playerHp,
    playerMaxHp,
    xp,
    level,
    currentTier,
    vocabulary,
    languageLevel,
    setScreen,
    startDungeon,
  } = useGameStore();

  const [showTierModal, setShowTierModal] = useState(false);

  // Derive stats
  const wordsKnown = vocabulary.length;
  const totalWear = useMemo(() => {
    return vocabulary.reduce((sum, w: WordEntry) => sum + w.wear, 0);
  }, [vocabulary]);

  const tierInfo = TIER_DATA[currentTier - 1] || TIER_DATA[0];

  // Navigation handlers
  const handleNavigate = useCallback(
    (path: string, screen: string) => {
      setScreen(screen as GameState['screen']);
      navigate(path);
    },
    [navigate, setScreen]
  );

  const handleCardClick = useCallback(
    (card: (typeof NAV_CARDS)[number]) => {
      if (card.action === 'tier') {
        setShowTierModal(true);
      } else if (card.action === 'dungeon') {
        startDungeon(currentTier);
        const state = useGameStore.getState();
        const firstRoom = state.dungeonRooms[0];
        if (firstRoom) {
          if (firstRoom.type === 'battle' || firstRoom.type === 'boss') {
            state.enterRoom(firstRoom.id);
            navigate(`/battle/${firstRoom.id}`);
          } else {
            setScreen('dungeon');
            navigate('/dungeon');
          }
        }
      } else if (card.path && card.screen) {
        handleNavigate(card.path, card.screen);
      }
    },
    [currentTier, handleNavigate, navigate, setScreen, startDungeon]
  );

  const handleSelectTier = useCallback(
    (tier: number) => {
      useGameStore.setState({ currentTier: tier });
    },
    []
  );

  const handleConfirmTier = useCallback(
    (tier: number) => {
      setShowTierModal(false);
      startDungeon(tier);
      // After generating dungeon, check the first room and enter it directly
      const state = useGameStore.getState();
      const firstRoom = state.dungeonRooms[0];
      if (firstRoom) {
        if (firstRoom.type === 'battle' || firstRoom.type === 'boss') {
          state.enterRoom(firstRoom.id);
          navigate(`/battle/${firstRoom.id}`);
        } else {
          // For altar/treasure rooms, go to dungeon map
          navigate('/dungeon');
        }
      }
    },
    [startDungeon, navigate]
  );

  return (
    <Layout>
      {/* Background */}
      <div
        className="min-h-[100dvh] relative overflow-hidden"
        style={{
          backgroundImage: 'url(/camp-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay */}
        <div
          className="absolute inset-0 z-[1]"
          style={{ backgroundColor: 'rgba(10,10,15,0.72)' }}
        />

        {/* Campfire glow */}
        <CampfireGlow />

        {/* Ember particles */}
        <EmberParticles />

        {/* Content container */}
        <div className="relative z-10 min-h-[100dvh] flex flex-col">
          {/* Main content area */}
          <div className="flex-1 flex items-center px-4 py-8 gap-6">
            {/* Left Panel — Player Stats */}
            <motion.div
              className="hidden lg:flex flex-col w-[220px] flex-shrink-0"
              style={{
                backgroundColor: 'rgba(20,20,30,0.95)',
                borderRadius: '8px',
                border: '1px solid rgba(232,224,208,0.12)',
                padding: '24px',
                gap: '16px',
              }}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: EASE_DRAMATIC, delay: 0.2 }}
            >
              {/* Avatar */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    border: '2px solid #D4A017',
                    backgroundColor: 'rgba(212,160,23,0.1)',
                  }}
                >
                  <Flame className="w-8 h-8 text-text-gold" />
                </div>
                <span className="font-cinzel text-heading text-text-primary tracking-wider text-center">
                  LEXICON WALKER
                </span>
                <span className="font-fira-code text-body-sm text-text-gold">
                  Level {level}
                </span>
              </div>

              {/* Divider */}
              <div
                className="w-full h-px"
                style={{ backgroundColor: 'rgba(232,224,208,0.12)' }}
              />

              {/* Stats */}
              <div className="flex flex-col gap-3">
                <StatRow label={t('hp_label')} value={`${playerHp}/${playerMaxHp}`} />
                <StatRow label={t('xp_label')} value={`${xp}`} />
                <div
                  className="w-full h-1 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'rgba(212,160,23,0.2)' }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: tierInfo.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(xp % 100)}%` }}
                    transition={{ duration: 0.8, ease: EASE_SMOOTH, delay: 0.5 }}
                  />
                </div>

                <div
                  className="w-full h-px my-1"
                  style={{ backgroundColor: 'rgba(232,224,208,0.08)' }}
                />

                <StatRow label={t('words_known')} value={wordsKnown} />
                <StatRow
                  label="总磨损"
                  value={
                    <span style={{ color: '#D4A017' }}>
                      {totalWear}
                    </span>
                  }
                />
                <StatRow
                  label="平均磨损"
                  value={wordsKnown > 0 ? (totalWear / wordsKnown).toFixed(1) : '0'}
                />
                <StatRow
                  label={t('current_tier')}
                  value={
                    <span style={{ color: tierInfo.color }}>
                      T{tierInfo.tier}
                    </span>
                  }
                />
              </div>
            </motion.div>

            {/* Center — Campfire Scene + Navigation Cards */}
            <div className="flex-1 flex flex-col items-center justify-center gap-8">
              {/* Camp title (subtle) */}
              <motion.div
                className="text-center mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE_DRAMATIC }}
              >
                <h1 className="font-cinzel font-display-lg text-text-primary tracking-[0.15em]">
                  {t('camp_title')}
                </h1>
                <p className="font-medieval text-body-lg text-text-secondary mt-1 tracking-wider">
                  {t('camp_subtitle')}
                </p>
              </motion.div>

              {/* Navigation Cards */}
              <div className="flex flex-wrap justify-center gap-6">
                {NAV_CARDS.map((card, index) => {
                  const Icon = card.icon;
                  return (
                    <motion.button
                      key={card.titleKey}
                      className="flex flex-col items-center justify-center gap-3 cursor-pointer group"
                      style={{
                        width: '160px',
                        height: '180px',
                        backgroundColor: 'rgba(20,20,30,0.95)',
                        borderRadius: '8px',
                        border: '1px solid rgba(232,224,208,0.12)',
                        padding: '16px',
                      }}
                      initial={{ opacity: 0, y: 40, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        delay: 0.4 + index * 0.1,
                        duration: 0.4,
                        ease: EASE_DRAMATIC,
                      }}
                      whileHover={{
                        y: -6,
                        boxShadow: `0 0 20px ${tierInfo.color}40`,
                        borderColor: tierInfo.color,
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCardClick(card)}
                    >
                      <Icon
                        className="w-12 h-12 transition-colors duration-200"
                        style={{ color: '#9B8B7A' }}
                      />
                      <div className="text-center">
                        <div className="font-cinzel text-heading text-text-primary tracking-wider text-sm">
                          {t(card.titleKey as any)}
                        </div>
                        <div className="font-medieval text-caption text-text-secondary mt-1">
                          {t(card.descKey as any)}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Right Panel — Quick Info */}
            <motion.div
              className="hidden lg:flex flex-col w-[200px] flex-shrink-0"
              style={{
                backgroundColor: 'rgba(20,20,30,0.95)',
                borderRadius: '8px',
                border: '1px solid rgba(232,224,208,0.12)',
                padding: '20px',
                gap: '16px',
              }}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: EASE_DRAMATIC, delay: 0.3 }}
            >
              <div className="text-center">
                <span className="font-caption text-text-secondary tracking-wider">
                  {t('words_discovered')}
                </span>
                <div
                  className="font-display-md mt-1"
                  style={{ color: '#D4A017' }}
                >
                  {wordsKnown}
                </div>
              </div>

              <div
                className="w-full h-px"
                style={{ backgroundColor: 'rgba(232,224,208,0.12)' }}
              />

              <div>
                <span className="font-caption text-text-secondary tracking-wider">
                  磨损状态
                </span>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(212,160,23,0.2)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${wordsKnown > 0 ? Math.min(100, (totalWear / wordsKnown) * 2) : 0}%`,
                        backgroundColor: '#D4A017',
                      }}
                    />
                  </div>
                  <span className="font-fira-code text-caption text-text-gold">
                    {wordsKnown > 0 ? (totalWear / wordsKnown).toFixed(1) : 0} 平均
                  </span>
                </div>
              </div>

              <div
                className="w-full h-px"
                style={{ backgroundColor: 'rgba(232,224,208,0.12)' }}
              />

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Hammer className="w-4 h-4 text-text-gold" />
                  <span className="font-caption text-text-secondary">总磨损</span>
                  <span className="ml-auto font-fira-code text-body-sm text-text-primary">
                    {totalWear}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Sword className="w-4 h-4 text-accent-heal" />
                  <span className="font-caption text-text-secondary">高磨损词汇</span>
                  <span className="ml-auto font-fira-code text-body-sm text-text-primary">
                    {vocabulary.filter((w: WordEntry) => w.wear > 20).length}
                  </span>
                </div>
              </div>

              {/* Current tier badge */}
              <div
                className="flex items-center justify-center gap-2 px-3 py-3 rounded-full mt-2"
                style={{
                  backgroundColor: `${tierInfo.color}15`,
                  border: `1px solid ${tierInfo.color}40`,
                }}
              >
                <Shield className="w-3 h-3" style={{ color: tierInfo.color }} />
                <span
                  className="font-cinzel text-caption font-semibold tracking-wider"
                  style={{ color: tierInfo.color }}
                >
                  T{t('current_tier')} {currentTier}
                </span>
              </div>

              {/* Language Level Indicator */}
              <div
                className="flex flex-col gap-2 px-3 py-3 rounded-lg mt-2"
                style={{
                  backgroundColor: 'rgba(10,10,15,0.95)',
                  border: '1px solid rgba(212,160,23,0.2)',
                }}
              >
                <span className="font-cinzel text-caption text-text-muted tracking-wider">
                  {t('lang_level')}
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((lvl) => (
                      <div
                        key={lvl}
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor:
                            lvl <= languageLevel
                              ? lvl === 1
                                ? '#D4A01730'
                                : lvl === 2
                                  ? '#1ABC9C30'
                                  : lvl === 3
                                    ? '#9B59B630'
                                    : '#3498DB30'
                              : 'rgba(232,224,208,0.08)',
                          border: `1px solid ${
                            lvl <= languageLevel
                              ? lvl === 1
                                ? '#D4A017'
                                : lvl === 2
                                  ? '#1ABC9C'
                                  : lvl === 3
                                    ? '#9B59B6'
                                    : '#3498DB'
                              : 'rgba(232,224,208,0.1)'
                          }`,
                          fontSize: '9px',
                          color:
                            lvl <= languageLevel
                              ? lvl === 1
                                ? '#D4A017'
                                : lvl === 2
                                  ? '#1ABC9C'
                                  : lvl === 3
                                    ? '#9B59B6'
                                    : '#3498DB'
                              : '#555',
                        }}
                      >
                        {lvl}
                      </div>
                    ))}
                  </div>
                  <span className="font-fira-code text-caption ml-auto" style={{ color: '#D4A017' }}>
                    {languageLevel}/4
                  </span>
                </div>
                <span className="font-inter text-caption-sm text-text-secondary">
                  {languageLevel === 1
                    ? t('lang_beginner')
                    : languageLevel === 2
                      ? t('lang_elementary')
                      : languageLevel === 3
                        ? t('lang_intermediate')
                        : t('lang_advanced')}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Mobile stats bar */}
          <motion.div
            className="lg:hidden flex items-center justify-around px-4 py-3"
            style={{
              backgroundColor: 'rgba(10,10,15,0.92)',
              borderTop: '1px solid rgba(232,224,208,0.12)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-text-gold" />
              <span className="font-fira-code text-caption text-text-primary">LV {level}</span>
            </div>
            <div className="flex items-center gap-1">
              <Hammer className="w-4 h-4 text-text-gold" />
              <span className="font-fira-code text-caption text-text-primary">{totalWear}</span>
            </div>
            <div className="flex items-center gap-1">
              <Sword className="w-4 h-4 text-accent-heal" />
              <span className="font-fira-code text-caption text-text-primary">{vocabulary.filter((w: WordEntry) => w.wear > 20).length}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tier Selection Modal */}
      <TierModal
        isOpen={showTierModal}
        onClose={() => setShowTierModal(false)}
        currentTier={currentTier}
        onSelectTier={handleSelectTier}
        onConfirm={handleConfirmTier}
      />
    </Layout>
  );
});

export default Camp;