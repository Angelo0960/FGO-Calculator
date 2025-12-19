import React, { useState } from 'react';
import Icon from './AppIcon';
import MobileMenuOverlay from './MobileMenuOverlay';

const MobileHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-100 bg-card border-b border-border md:hidden">
        <div className="flex items-center justify-between h-[60px] px-4">
          <button
            onClick={toggleMenu}
            className="p-2 rounded-md hover:bg-muted transition-colors duration-150"
            aria-label="Open navigation menu"
            aria-expanded={isMenuOpen}
          >
            <Icon name="Menu" size={24} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Sparkles" size={20} color="var(--color-primary)" />
            </div>
            <span className="text-base font-semibold text-foreground">FGO Calculator</span>
          </div>

          <div className="w-10" />
        </div>
      </header>

      <MobileMenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

export default MobileHeader;