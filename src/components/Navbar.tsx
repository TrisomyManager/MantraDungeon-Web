import React from 'react';
import { useLocation } from 'react-router';
import { useGameStore } from '@/store/gameStore';
import { Heart, Sword } from 'lucide-react';

const TIER_COLORS: Record<number, { primary: string; name: string }> = {
  1: { primary: '#D4A017', name: 'Ember' },
  2: { primary: '#2ECC71', name: 'Verdant' },
  3: { primary: '#1ABC9C', name: 'Abyssal' },
  4: { primary: '#8E44AD', name: 'Void' },
  5: { primary: '#2980B9', name: 'Deep Space' },
};

const NAV_PATH_PREFIXES = ['/camp', '/dungeon', '/battle', '/altar', '/bestiary'];

const Navbar: React.FC = React.memo(function Navbar() {
  const { playerHp, playerMaxHp, xp, level, currentTier } = useGameStore();
  const { pathname } = useLocation();

  const showNav = NAV_PATH_PREFIXES.some(p => pathname === p || pathname.startsWith(`${p}/`));
  if (!showNav) return null;

  const tierInfo = TIER_COLORS[currentTier] || TIER_COLORS[1];
  const hpPercent = (playerHp / playerMaxHp) * 100;
  const xpPercent = (xp % 100);
  const hpSegments = 5;
  const filledSegments = Math.ceil((hpPercent / 100) * hpSegments);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4"
      style={{
        height: '48px',
        backgroundColor: 'rgba(10,10,15,0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(232,224,208,0.12)',
      }}
    >
      {/* HP Bar (Left) */}
      <div className="flex items-center gap-2">
        <Heart className="w-4 h-4 text-[#E74C3C]" />
        <div className="flex gap-[2px]">
          {Array.from({ length: hpSegments }).map((_, i) => (
            <div
              key={i}
              className="transition-all duration-200"
              style={{
                width: '20px',
                height: '14px',
                borderRadius: '3px',
                backgroundColor: i < filledSegments ? '#E74C3C' : 'rgba(231,76,60,0.2)',
                border: '1px solid rgba(231,76,60,0.3)',
              }}
            />
          ))}
        </div>
        <span className="font-fira-code text-caption text-text-secondary ml-1">
          {playerHp}/{playerMaxHp}
        </span>
      </div>

      {/* Tier Badge (Center) */}
      <div
        className="flex items-center gap-2 px-3 py-1 rounded-full"
        style={{
          backgroundColor: `${tierInfo.primary}20`,
          border: `1px solid ${tierInfo.primary}50`,
        }}
      >
        <Sword className="w-3 h-3" style={{ color: tierInfo.primary }} />
        <span
          className="font-cinzel text-caption font-semibold tracking-wider"
          style={{ color: tierInfo.primary }}
        >
          TIER {currentTier} — {tierInfo.name.toUpperCase()}
        </span>
      </div>

      {/* XP Bar (Right) */}
      <div className="flex items-center gap-2">
        <span className="font-fira-code text-caption text-text-muted">LV {level}</span>
        <div
          className="relative overflow-hidden rounded-sm"
          style={{ width: '80px', height: '4px', backgroundColor: 'rgba(212,160,23,0.2)' }}
        >
          <div
            className="h-full transition-all duration-300 ease-out rounded-sm"
            style={{ width: `${xpPercent}%`, backgroundColor: tierInfo.primary }}
          />
        </div>
        <span className="font-fira-code text-caption text-text-muted">{xp} XP</span>
      </div>
    </nav>
  );
});

export default Navbar;
