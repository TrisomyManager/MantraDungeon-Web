import React from 'react';
import { motion } from 'framer-motion';
import { MobileNav } from './MobileNav';

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
  className?: string;
  fullScreen?: boolean;
}

const Layout: React.FC<LayoutProps> = React.memo(function Layout({
  children,
  showNav = true,
  className = '',
  fullScreen = false,
}) {
  return (
    <div className={`min-h-[100dvh] flex flex-col relative ${className}`}>
      <motion.main
        className={`flex-1 ${fullScreen ? '' : 'pb-16'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        }}
      >
        {children}
      </motion.main>
      {showNav && <MobileNav />}
    </div>
  );
});

export default Layout;
