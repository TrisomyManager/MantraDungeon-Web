import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Volume2, VolumeX, X, Sparkles } from 'lucide-react';
import { useGameText } from '@/hooks/useGameText';

/* ============================================================
   EmberParticle — isolated perpetual animation component
   ============================================================ */

const EmberParticle: React.FC<{ delay: number; duration: number; left: string; size: number }> = React.memo(
  function EmberParticle({ delay, duration, left, size }) {
    return (
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          left,
          bottom: '-10px',
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: '#D4A017',
          opacity: 0,
          animation: `emberFloat ${duration}s ease-in-out ${delay}s infinite`,
        }}
      />
    );
  }
);

/* ============================================================
   RuneDecoration — floating rune symbol
   ============================================================ */

const RuneDecoration: React.FC<{ char: string; top: string; left: string; delay: number }> = React.memo(
  function RuneDecoration({ char, top, left, delay }) {
    return (
      <motion.div
        className="absolute font-medieval text-text-gold pointer-events-none select-none"
        style={{ top, left, fontSize: '2rem', opacity: 0.08 }}
        animate={{
          y: [0, -6, 0],
          rotate: [0, 3, 0, -3, 0],
        }}
        transition={{
          duration: 4,
          ease: 'easeInOut',
          repeat: Infinity,
          delay,
        }}
      >
        {char}
      </motion.div>
    );
  }
);

/* ============================================================
   HowToPlayModal
   ============================================================ */

const HowToPlayModal: React.FC<{ isOpen: boolean; onClose: () => void }> = React.memo(
  function HowToPlayModal({ isOpen, onClose }) {
    const t = useGameText();
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[150] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0"
              style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
            />
            {/* Panel */}
            <motion.div
              className="relative w-full max-w-full max-h-[80vh] overflow-y-auto rounded-radius-lg p-6"
              style={{
                backgroundColor: '#14141E',
                border: '1px solid rgba(232,224,208,0.12)',
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="font-cinzel font-display-md text-text-primary mb-6 text-center tracking-wider">
                {t('rules_title')}
              </h2>

              <div className="space-y-5">
                <div>
                  <h3 className="font-cinzel text-heading text-tier1-ember mb-1 tracking-wider">{t('spellcasting_title')}</h3>
                  <p className="font-inter text-body text-text-secondary leading-relaxed">
                    {t('spellcasting_desc')}
                  </p>
                </div>
                <div>
                  <h3 className="font-cinzel text-heading text-tier2-verdant mb-1 tracking-wider">{t('combo_title')}</h3>
                  <p className="font-inter text-body text-text-secondary leading-relaxed">
                    {t('combo_desc')}
                  </p>
                </div>
                <div>
                  <h3 className="font-cinzel text-heading text-tier3-abyssal mb-1 tracking-wider">{t('weakness_title')}</h3>
                  <p className="font-inter text-body text-text-secondary leading-relaxed">
                    {t('weakness_desc')}
                  </p>
                </div>
                <div>
                  <h3 className="font-cinzel text-heading text-tier4-void mb-1 tracking-wider">{t('memory_title')}</h3>
                  <p className="font-inter text-body text-text-secondary leading-relaxed">
                    {t('memory_desc')}
                  </p>
                </div>
                <div>
                  <h3 className="font-cinzel text-heading text-tier5-deepspace mb-1 tracking-wider">{t('tier_title')}</h3>
                  <p className="font-inter text-body text-text-secondary leading-relaxed">
                    {t('tier_desc')}
                  </p>
                </div>
              </div>

              {/* Damage multipliers legend */}
              <div className="mt-6 pt-4" style={{ borderTop: '1px solid rgba(232,224,208,0.12)' }}>
                <h3 className="font-cinzel text-caption text-text-muted mb-3 tracking-wider">{t('combo_mult_label')}</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-fira-code text-sm text-accent-heal">x2</span>
                    <span className="font-inter text-body-sm text-text-secondary">{t('synonym_label')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-fira-code text-sm text-accent-combo">x3</span>
                    <span className="font-inter text-body-sm text-text-secondary">{t('collocation_label')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-fira-code text-sm text-accent-damage">x5</span>
                    <span className="font-inter text-body-sm text-text-secondary">{t('antonym_label')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-accent-wipe" />
                    <span className="font-inter text-body-sm text-text-secondary">{t('weakness_kill_label')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

/* ============================================================
   Home Page — Title Screen
   ============================================================ */

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [audioOn, setAudioOn] = useState(() => {
    const saved = localStorage.getItem('dol-audio');
    return saved ? saved === 'true' : true;
  });
  const navigate = useNavigate();
  const t = useGameText();

  const toggleAudio = useCallback(() => {
    setAudioOn((prev: boolean) => {
      const next = !prev;
      localStorage.setItem('dol-audio', String(next));
      return next;
    });
  }, []);

  // Generate ember particles
  const embers = useMemo(() => {
    return Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      delay: Math.random() * 12,
      duration: 8 + Math.random() * 7,
      left: `${Math.random() * 100}%`,
      size: 2 + Math.random() * 2,
    }));
  }, []);

  // Generate floating runes
  const runes = useMemo(() => {
    const chars = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛈ', 'ᛇ', 'ᛉ'];
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      char: chars[i % chars.length],
      top: `${10 + Math.random() * 80}%`,
      left: `${5 + Math.random() * 90}%`,
      delay: Math.random() * 4,
    }));
  }, []);

  const handleEnterDungeon = useCallback(() => {
    navigate('/camp');
  }, [navigate]);

  return (
    <div className="relative min-h-[100dvh] overflow-hidden flex flex-col items-center justify-center select-none">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/title-bg.jpg)' }}
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-radial-dark"
        style={{ backgroundColor: 'rgba(10,10,15,0.65)' }}
      />

      {/* Ember particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {embers.map((e) => (
          <EmberParticle key={e.id} delay={e.delay} duration={e.duration} left={e.left} size={e.size} />
        ))}
      </div>

      {/* Floating runes */}
      {runes.map((r) => (
        <RuneDecoration key={r.id} char={r.char} top={r.top} left={r.left} delay={r.delay} />
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        {/* Game Title */}
        <div className="flex flex-col items-center mb-6">
          <motion.h1
            className="font-cinzel font-display-xl text-text-primary uppercase tracking-[0.15em]"
            style={{
              textShadow: '0 0 20px rgba(212,160,23,0.4), 0 0 60px rgba(212,160,23,0.1)',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              delay: 0,
            }}
          >
            DUNGEON OF
          </motion.h1>

          <motion.h1
            className="font-cinzel font-display-xl text-text-primary uppercase tracking-[0.15em]"
            style={{
              textShadow: '0 0 20px rgba(212,160,23,0.4), 0 0 60px rgba(212,160,23,0.1)',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              delay: 0.4,
            }}
          >
            LEXICON
          </motion.h1>

          {/* Gold separator line */}
          <motion.div
            className="my-4"
            style={{
              height: '1px',
              backgroundColor: 'rgba(212,160,23,0.3)',
            }}
            initial={{ width: 0 }}
            animate={{ width: 200 }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
              delay: 1.0,
            }}
          />

          {/* Chinese subtitle */}
          <motion.p
            className="font-medieval text-body-lg text-text-secondary tracking-[0.3em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.6,
              ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
              delay: 1.3,
            }}
          >
            {t('game_title')}
          </motion.p>
        </div>

        {/* Flavor text */}
        <motion.p
          className="font-medieval text-body-lg italic text-text-secondary mb-10 max-w-md"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
            delay: 1.5,
          }}
        >
          {t('flavor_quote')}
        </motion.p>

        {/* Buttons */}
        <motion.button
          className="flex items-center gap-3 px-4 py-4 rounded-radius-md font-cinzel text-lg font-semibold tracking-wider transition-all duration-200 cursor-pointer"
          style={{
            backgroundColor: '#D4A017',
            color: '#0A0A0F',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            delay: 1.9,
          }}
          whileHover={{
            filter: 'brightness(1.15)',
            scale: 1.05,
            boxShadow: '0 0 30px rgba(212,160,23,0.3)',
          }}
          whileTap={{ scale: 0.97 }}
          onClick={handleEnterDungeon}
        >
          <Sword className="w-5 h-5" />
          {t('enter_dungeon')}
        </motion.button>

        <motion.button
          className="mt-4 px-4 py-3 rounded-radius-md font-cinzel text-sm font-medium tracking-wider transition-all duration-200 cursor-pointer"
          style={{
            backgroundColor: 'transparent',
            color: '#E8E0D0',
            border: '1px solid rgba(232,224,208,0.12)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            delay: 2.0,
          }}
          whileHover={{
            backgroundColor: '#1E1E2E',
            borderColor: 'rgba(212,160,23,0.5)',
          }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
        >
          {t('how_to_play')}
        </motion.button>
      </div>

      {/* Audio toggle */}
      <motion.button
        className="absolute bottom-6 right-6 w-10 h-10 flex items-center justify-center rounded-radius-circle transition-all duration-200 cursor-pointer"
        style={{
          backgroundColor: 'transparent',
          color: '#9B8B7A',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.4 }}
        whileHover={{ color: '#E8E0D0', backgroundColor: 'rgba(232,224,208,0.08)' }}
        onClick={toggleAudio}
        aria-label="Toggle audio"
      >
        {audioOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
      </motion.button>

      {/* Version label */}
      <motion.p
        className="absolute bottom-4 left-1/2 -translate-x-1/2 font-caption text-text-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.4 }}
      >
        v1.0.0 — Prototype
      </motion.p>

      {/* How to Play Modal */}
      <HowToPlayModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
