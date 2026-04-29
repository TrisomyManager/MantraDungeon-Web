import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScreenTransitionProps {
  children: React.ReactNode;
  screenKey: string;
}

const ScreenTransition: React.FC<ScreenTransitionProps> = React.memo(function ScreenTransition({
  children,
  screenKey,
}) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 400);
    return () => clearTimeout(timer);
  }, [screenKey]);

  return (
    <>
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            key={`transition-${screenKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            className="fixed inset-0 z-[200]"
            style={{ backgroundColor: '#0A0A0F' }}
          />
        )}
      </AnimatePresence>
      <motion.div
        key={screenKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.2 }}
      >
        {children}
      </motion.div>
    </>
  );
});

export default ScreenTransition;
