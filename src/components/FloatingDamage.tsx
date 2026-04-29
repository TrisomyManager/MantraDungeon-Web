import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DamageNumber {
  id: number;
  value: string;
  x: number;
  color: string;
  type: 'normal' | 'combo' | 'weakness' | 'heal';
}

interface FloatingDamageProps {
  damages: DamageNumber[];
}

let nextId = 0;

export function useDamageFloater() {
  const [numbers, setNumbers] = useState<DamageNumber[]>([]);

  const spawn = (value: number | string, type: DamageNumber['type'] = 'normal') => {
    const id = nextId++;
    const x = Math.random() * 60 - 30; // random offset -30 to 30
    const colors = {
      normal: '#FFFFFF',
      combo: '#FFD700',
      weakness: '#FF4444',
      heal: '#00FF88',
    };
    const newNum: DamageNumber = {
      id,
      value: String(value),
      x,
      color: colors[type],
      type,
    };
    setNumbers(prev => [...prev.slice(-5), newNum]);
  };

  const clear = () => setNumbers([]);

  return { numbers, spawn, clear };
}

const FloatingDamage: React.FC<FloatingDamageProps> = ({ damages }) => {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ zIndex: 50 }}>
      <AnimatePresence>
        {damages.map((d) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 1, y: 0, scale: 0.5 }}
            animate={{ opacity: [1, 1, 0.8, 0], y: [-20, -60, -80, -100], scale: [0.5, 1.2, 1.1, 0.9] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            className="absolute font-cinzel font-bold tracking-wider"
            style={{
              color: d.color,
              fontSize: d.type === 'weakness' ? '2.5rem' : d.type === 'combo' ? '2rem' : '1.5rem',
              textShadow: `0 0 10px ${d.color}40, 0 2px 4px rgba(0,0,0,0.8)`,
              transform: `translateX(${d.x}px)`,
            }}
          >
            {d.type === 'heal' ? '+' : '-'}{d.value}
            {d.type === 'weakness' && '!'}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FloatingDamage;
