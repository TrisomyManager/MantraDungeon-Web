import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion } from 'framer-motion';
import { Home, Swords, BookOpen, Scroll, Compass } from 'lucide-react';

interface NavItem {
  path: string;
  icon: React.ReactNode;
  label: string;
}

export const MobileNav: React.FC = React.memo(function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const items: NavItem[] = [
    { path: '/camp', icon: <Home className="w-5 h-5" />, label: 'Camp' },
    { path: '/dungeon', icon: <Compass className="w-5 h-5" />, label: 'Map' },
    { path: '/altar', icon: <Scroll className="w-5 h-5" />, label: 'Words' },
    { path: '/bestiary', icon: <BookOpen className="w-5 h-5" />, label: 'Monsters' },
    { path: '/dungeon', icon: <Swords className="w-5 h-5" />, label: 'Fight' },
  ];

  // Don't show nav on home, battle, or gameover
  const hideOn = ['/', '/gameover'];
  const isBattle = location.pathname.startsWith('/battle');
  if (hideOn.includes(location.pathname) || isBattle) return null;

  return (
    <div className="mobile-nav">
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <motion.button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center justify-center gap-0.5 w-16 h-full touch-btn"
            whileTap={{ scale: 0.9 }}
          >
            <div
              className="transition-colors duration-200"
              style={{
                color: isActive ? '#D4A017' : '#9B8B7A',
              }}
            >
              {item.icon}
            </div>
            <span
              className="text-[10px] font-cinzel tracking-wider"
              style={{
                color: isActive ? '#D4A017' : '#9B8B7A',
              }}
            >
              {item.label}
            </span>
            {isActive && (
              <motion.div
                className="absolute bottom-1.5 w-1 h-1 rounded-full"
                style={{ backgroundColor: '#D4A017' }}
                layoutId="nav-indicator"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
});
