import React from 'react';

const Footer: React.FC = React.memo(function Footer() {
  return (
    <footer
      className="w-full py-4 text-center"
      style={{
        borderTop: '1px solid rgba(232,224,208,0.12)',
        backgroundColor: 'rgba(10,10,15,0.8)',
      }}
    >
      <p className="font-caption text-text-muted">
        真言地牢 Dungeon of Lexicon — v1.0.0 Prototype
      </p>
    </footer>
  );
});

export default Footer;
