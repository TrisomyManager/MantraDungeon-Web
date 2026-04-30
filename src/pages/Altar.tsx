import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scroll,
  ArrowLeft,
  Sword,
  Hammer,
  BookOpen,
  CheckCircle,
} from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import type { WordEntry } from '@/store/gameStore';
import { useGameText, useLangLevel, getText } from '@/hooks/useGameText';
import Layout from '@/components/Layout';

/* ============================================================
   Constants
   ============================================================ */

const TIER_COLORS: Record<number, string> = {
  1: '#D4A017',
  2: '#2ECC71',
  3: '#1ABC9C',
  4: '#8E44AD',
  5: '#2980B9',
};

const EASE_DRAMATIC = [0.16, 1, 0.3, 1] as [number, number, number, number];
const EASE_SMOOTH = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

/* ============================================================
   Helpers
   ============================================================ */

function getTierColor(tier: number): string {
  return TIER_COLORS[tier] ?? '#D4A017';
}

/* ============================================================
   Floating Runes Background
   ============================================================ */

const RUNE_CHARS = ['A', 'W', '火', '文', '詞', '咒', 'R', 'L'];

interface RuneParticle {
  id: number;
  char: string;
  x: number;
  startY: number;
  duration: number;
  delay: number;
  size: number;
}

const FloatingRunes: React.FC = React.memo(function FloatingRunes() {
  const runes = useMemo<RuneParticle[]>(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      char: RUNE_CHARS[i % RUNE_CHARS.length],
      x: 5 + Math.random() * 90,
      startY: 100 + Math.random() * 20,
      duration: 12 + Math.random() * 8,
      delay: Math.random() * 10,
      size: 14 + Math.random() * 10,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {runes.map((r) => (
        <motion.span
          key={r.id}
          className="absolute font-cinzel select-none"
          style={{
            left: `${r.x}%`,
            top: `${r.startY}%`,
            fontSize: r.size,
            color: '#D4A017',
            opacity: 0.06,
          }}
          animate={{
            y: [0, -30 - Math.random() * 20],
            x: [0, (Math.random() - 0.5) * 30],
            opacity: [0.04, 0.08, 0.04],
            rotate: [0, (Math.random() - 0.5) * 10],
          }}
          transition={{
            duration: r.duration,
            delay: r.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {r.char}
        </motion.span>
      ))}
    </div>
  );
});

/* ============================================================
   Word Card
   ============================================================ */

interface WordCardProps {
  word: WordEntry;
  isSelected: boolean;
  isInscribed: boolean;
  onClick: () => void;
  index: number;
}

const WordCard: React.FC<WordCardProps> = React.memo(function WordCard({
  word,
  isSelected,
  isInscribed,
  onClick,
  index,
}) {
  const langLevel = useLangLevel();
  const tierColor = getTierColor(word.tier);
  const meaningText = getText(langLevel, word.meaningZh || word.meaning, word.meaning);

  // Wear decay display
  const wearPercent = Math.min(100, word.wear * 2);
  const wearColor = wearPercent > 80 ? '#E74C3C' : wearPercent > 50 ? '#E67E22' : '#2ECC71';

  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-1 cursor-pointer relative overflow-hidden"
      style={{
        minHeight: '110px',
        backgroundColor: 'rgba(20,20,30,0.95)',
        borderRadius: '8px',
        border: isSelected
          ? '2px solid #D4A017'
          : isInscribed
            ? '1px solid rgba(46,204,113,0.35)'
            : '1px solid rgba(232,224,208,0.1)',
        padding: '12px',
        boxShadow: isSelected ? '0 0 12px rgba(212,160,23,0.3)' : 'none',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.02,
        duration: 0.3,
        ease: EASE_SMOOTH,
      }}
      whileHover={{
        y: -4,
        borderColor: 'rgba(212,160,23,0.5)',
      }}
      onClick={onClick}
      layout
    >
      {/* Inscribed indicator */}
      {isInscribed && (
        <CheckCircle
          className="absolute top-2 right-2 w-3 h-3"
          style={{ color: '#2ECC71' }}
        />
      )}

      {/* Word (English) */}
      <span
        className="font-fira-code text-mono-md text-text-primary uppercase text-center"
        style={{ fontSize: '1.1rem' }}
      >
        {word.word}
      </span>

      {/* Meaning */}
      <span className="font-inter text-caption-sm text-text-secondary text-center leading-tight">
        {meaningText}
      </span>

      {/* Wear bar */}
      <div className="w-full mt-1">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-caption text-text-muted flex items-center gap-1">
            <Hammer className="w-3 h-3" /> 磨损
          </span>
          <span className="font-caption" style={{ color: wearColor }}>
            {word.wear}
          </span>
        </div>
        <div
          className="w-full h-1 rounded-full"
          style={{ backgroundColor: 'rgba(232,224,208,0.08)' }}
        >
          <div
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: `${wearPercent}%`,
              backgroundColor: wearColor,
            }}
          />
        </div>
      </div>

      {/* Bottom row: tier badge */}
      <div className="flex items-center justify-between w-full mt-1">
        <span
          className="font-caption px-1.5 py-0.5 rounded-radius-sm"
          style={{
            backgroundColor: `${tierColor}15`,
            color: tierColor,
            border: `1px solid ${tierColor}30`,
          }}
        >
          T{word.tier}
        </span>
        <span className="font-caption text-text-muted">
          {word.pos}
        </span>
      </div>
    </motion.div>
  );
});

/* ============================================================
   Word Detail Panel
   ============================================================ */

interface WordDetailPanelProps {
  word: WordEntry | null;
  isInscribed: boolean;
  onInscribe: (wordId: string) => void;
  onClose: () => void;
}

const WordDetailPanel: React.FC<WordDetailPanelProps> = React.memo(
  function WordDetailPanel({ word, isInscribed, onInscribe, onClose }) {
    const langLevel = useLangLevel();
    if (!word) return null;
    const detailMeaning = getText(langLevel, word.meaningZh || word.meaning, word.meaning);

    const tierColor = getTierColor(word.tier);
    const tierNames = ['', 'Ember', 'Verdant', 'Abyssal', 'Void', 'Deep Space'];

    const wearPercent = Math.min(100, word.wear * 2);
    const wearColor = wearPercent > 80 ? '#E74C3C' : wearPercent > 50 ? '#E67E22' : '#2ECC71';
    const damageDecay = Math.max(0.05, 1 - word.wear * 0.02);

    return (
      <motion.div
        className="fixed inset-0 z-[150] flex flex-col justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={onClose}
        />

        {/* Panel */}
        <motion.div
          className="relative w-full overflow-y-auto"
          style={{
            maxHeight: '50vh',
            backgroundColor: '#14141E',
            borderTop: '2px solid #D4A017',
            borderRadius: '12px 12px 0 0',
            padding: '32px',
          }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.4, ease: EASE_DRAMATIC }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-radius-md hover:bg-bg-elevated transition-colors cursor-pointer"
          >
            <span className="text-text-secondary text-lg">×</span>
          </button>

          <div className="max-w-2xl mx-auto">
            {/* Word Header */}
            <div className="flex items-center gap-3 mb-4">
              <h2
                className="font-fira-code text-text-primary uppercase"
                style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', letterSpacing: '0.08em' }}
              >
                {word.word}
              </h2>
              <span
                className="font-caption px-2 py-1 rounded-radius-sm"
                style={{
                  backgroundColor: `${tierColor}15`,
                  color: tierColor,
                  border: `1px solid ${tierColor}40`,
                }}
              >
                {tierNames[word.tier] || `Tier ${word.tier}`}
              </span>
            </div>

            {/* Phonetic + POS */}
            <div className="flex items-center gap-3 mb-4">
              <span className="font-inter text-body-sm text-text-secondary">
                /{word.word}/
              </span>
              <span
                className="font-caption px-2 py-0.5 rounded-radius-sm"
                style={{
                  backgroundColor: 'rgba(212,160,23,0.1)',
                  color: '#9B8B7A',
                }}
              >
                {word.pos}
              </span>
            </div>

            {/* Meaning */}
            <p className="font-inter text-body-lg text-text-primary mb-2">
              {detailMeaning}
            </p>
            {langLevel <= 2 && (
              <p className="font-fira-code text-body-sm text-text-secondary mb-2">
                {word.meaning}
              </p>
            )}

            {/* Divider */}
            <div
              className="w-full h-px my-4"
              style={{ backgroundColor: 'rgba(232,224,208,0.12)' }}
            />

            {/* Wear Stats */}
            <div className="flex flex-col gap-3 mb-6">
              <span className="font-cinzel text-caption text-text-secondary tracking-wider">
                磨损状态
              </span>
              <div className="flex flex-wrap gap-4 mt-1">
                <div className="flex items-center gap-2">
                  <Hammer className="w-4 h-4" style={{ color: wearColor }} />
                  <span className="font-inter text-body-sm text-text-primary">
                    磨损值: {word.wear}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Sword className="w-4 h-4 text-text-gold" />
                  <span className="font-inter text-body-sm text-text-primary">
                    威力衰减: {Math.round((1 - damageDecay) * 100)}%
                  </span>
                </div>
              </div>
              <div
                className="w-full h-2 rounded-full mt-1"
                style={{ backgroundColor: 'rgba(232,224,208,0.08)' }}
              >
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${wearPercent}%`,
                    backgroundColor: wearColor,
                  }}
                />
              </div>
              <p className="font-inter text-caption-sm text-text-secondary mt-1">
                每使用一次，磨损+1。磨损越高，该单词造成的伤害越低。
                当磨损达到50时，威力降至0%。
              </p>
            </div>

            {/* Inscribe Action */}
            {isInscribed ? (
              <div className="flex items-center gap-2 text-[#2ECC71]">
                <CheckCircle className="w-4 h-4" />
                <span className="font-cinzel text-body-sm tracking-wider">已铭刻 — 磨损已重置</span>
              </div>
            ) : (
              <motion.button
                className="flex items-center gap-2 px-4 py-2 rounded-radius-md font-cinzel text-body-sm tracking-wider cursor-pointer"
                style={{
                  backgroundColor: '#D4A017',
                  color: '#0A0A0F',
                }}
                whileHover={{ scale: 1.03, filter: 'brightness(1.15)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { onInscribe(word!.wordId); onClose(); }}
              >
                <BookOpen className="w-4 h-4" />
                铭刻此词 — 重置磨损
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  }
);

/* ============================================================
   Empty State
   ============================================================ */

const EmptyState: React.FC<{ onEnterDungeon: () => void }> = React.memo(
  function EmptyState({ onEnterDungeon }) {
    const t = useGameText();
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-16 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Scroll
          className="w-[120px] h-[120px]"
          style={{ color: '#5C5346', opacity: 0.2 }}
        />
        <h3 className="font-cinzel text-heading text-text-secondary tracking-wider">
          {t('no_words_yet')}
        </h3>
        <p className="font-inter text-body-sm text-text-secondary text-center max-w-md">
          Venture into the dungeon to discover words.
        </p>
        <motion.button
          className="mt-4 px-4 py-3 rounded-radius-md font-cinzel text-body-sm tracking-wider cursor-pointer transition-all duration-200"
          style={{
            backgroundColor: '#D4A017',
            color: '#0A0A0F',
          }}
          whileHover={{ scale: 1.03, filter: 'brightness(1.15)' }}
          whileTap={{ scale: 0.97 }}
          onClick={onEnterDungeon}
        >
          ENTER DUNGEON
        </motion.button>
      </motion.div>
    );
  }
);

/* ============================================================
   Main Altar Component
   ============================================================ */

const Altar: React.FC = React.memo(function Altar() {
  const navigate = useNavigate();
  const t = useGameText();
  const {
    vocabulary,
    inscribed,
    inscribeWord,
    startDungeon,
    currentTier,
  } = useGameStore();

  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Sort words by tier (frequency), then by wear descending
  const sortedWords = useMemo(() => {
    return [...vocabulary]
      .filter((w) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          w.word.toLowerCase().includes(q) ||
          w.meaningZh.toLowerCase().includes(q) ||
          w.meaning.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (a.tier !== b.tier) return a.tier - b.tier;
        return b.wear - a.wear;
      });
  }, [vocabulary, searchQuery]);

  const selectedWord = useMemo(
    () => vocabulary.find((w) => w.wordId === selectedWordId) || null,
    [vocabulary, selectedWordId]
  );

  // Stats
  const stats = useMemo(() => {
    const total = vocabulary.length;
    const totalWear = vocabulary.reduce((sum, w) => sum + w.wear, 0);
    const avgWear = total > 0 ? (totalWear / total).toFixed(1) : '0';
    const highWear = vocabulary.filter((w) => w.wear > 20).length;
    return { total, totalWear, avgWear, highWear };
  }, [vocabulary]);

  const handleWordClick = useCallback((wordId: string) => {
    setSelectedWordId((prev) => (prev === wordId ? null : wordId));
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedWordId(null);
  }, []);

  const handleEnterDungeon = useCallback(() => {
    startDungeon(currentTier);
    navigate('/dungeon');
  }, [currentTier, navigate, startDungeon]);

  const handleBackToCamp = useCallback(() => {
    navigate('/camp');
  }, [navigate]);

  return (
    <Layout>
      {/* Background */}
      <div
        className="min-h-[100dvh] relative"
        style={{
          backgroundImage: 'url(/altar-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay */}
        <div
          className="absolute inset-0 z-[1]"
          style={{ backgroundColor: 'rgba(10,10,15,0.3)' }}
        />

        {/* Floating runes */}
        <FloatingRunes />

        {/* Scrollable content */}
        <div className="relative z-10 min-h-[100dvh] flex flex-col">
          {/* Header */}
          <motion.div
            className="text-center pt-8 pb-4 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_DRAMATIC }}
          >
            <h1 className="font-cinzel font-display-lg text-text-primary tracking-[0.1em]">
              {t('altar_title')}
            </h1>
            <motion.p
              className="font-medieval text-body-lg text-text-secondary mt-1"
              style={{ letterSpacing: '0.3em' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              词库祭坛
            </motion.p>
            <motion.p
              className="font-medieval text-body-lg text-text-secondary mt-2 italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              「 words wear out with use — seek new ones to grow 」
            </motion.p>
          </motion.div>

          {/* Stats Summary Bar */}
          <motion.div
            className="flex items-center justify-center gap-6 md:gap-12 py-4 px-4 border-y"
            style={{
              borderColor: 'rgba(232,224,208,0.08)',
              backgroundColor: 'rgba(10,10,15,0.5)',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: EASE_SMOOTH }}
          >
            <div className="flex flex-col items-center gap-1">
              <motion.span
                className="font-display-md font-semibold text-text-gold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {stats.total}
              </motion.span>
              <span className="font-caption text-text-secondary tracking-wider">词汇总量</span>
            </div>
            <div className="w-px h-10 hidden sm:block" style={{ backgroundColor: 'rgba(232,224,208,0.12)' }} />
            <div className="flex flex-col items-center gap-1">
              <motion.span
                className="font-display-md font-semibold text-text-gold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {stats.totalWear}
              </motion.span>
              <span className="font-caption text-text-secondary tracking-wider">总磨损</span>
            </div>
            <div className="w-px h-10 hidden sm:block" style={{ backgroundColor: 'rgba(232,224,208,0.12)' }} />
            <div className="flex flex-col items-center gap-1">
              <motion.span
                className="font-display-md font-semibold"
                style={{ color: stats.highWear > 0 ? '#E74C3C' : '#2ECC71' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {stats.avgWear}
              </motion.span>
              <span className="font-caption text-text-secondary tracking-wider">平均磨损</span>
            </div>
          </motion.div>

          {/* Search Bar */}
          <div
            className="sticky top-[48px] z-[90] flex items-center justify-center px-4 py-3 border-b"
            style={{
              backgroundColor: 'rgba(10,10,15,0.92)',
              backdropFilter: 'blur(8px)',
              borderColor: 'rgba(232,224,208,0.12)',
            }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索单词 / 中文释义..."
              className="w-full max-w-md px-4 py-2 rounded-radius-md font-inter text-body-sm bg-bg-elevated text-text-primary placeholder:text-text-muted border border-transparent focus:border-text-gold outline-none transition-colors"
            />
          </div>

          {/* Word Grid */}
          <div className="flex-1 px-4 md:px-4 py-6">
            <div className="max-w-[1200px] mx-auto">
              {sortedWords.length === 0 ? (
                <EmptyState onEnterDungeon={handleEnterDungeon} />
              ) : (
                <motion.div
                  className="grid gap-4"
                  style={{
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(160px, 1fr))',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {sortedWords.map((word, index) => (
                    <WordCard
                      key={word.wordId}
                      word={word}
                      isSelected={selectedWordId === word.wordId}
                      isInscribed={inscribed.includes(word.wordId)}
                      onClick={() => handleWordClick(word.wordId)}
                      index={index}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div
            className="sticky bottom-0 z-[80] flex items-center px-4"
            style={{
              height: '56px',
              backgroundColor: 'rgba(10,10,15,0.92)',
              borderTop: '1px solid rgba(232,224,208,0.12)',
            }}
          >
            <motion.button
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors duration-200 cursor-pointer"
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleBackToCamp}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-inter text-body-sm tracking-wider">
                {t('back_to_camp')}
              </span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Word Detail Panel */}
      <AnimatePresence>
        {selectedWord && (
          <WordDetailPanel
            key={selectedWord.wordId}
            word={selectedWord}
            isInscribed={inscribed.includes(selectedWord.wordId)}
            onInscribe={inscribeWord}
            onClose={handleCloseDetail}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
});

export default Altar;
