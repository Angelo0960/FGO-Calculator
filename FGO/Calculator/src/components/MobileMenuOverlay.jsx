import React, { useEffect } from 'react';
import Icon from './AppIcon';

const MobileMenuOverlay = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e?.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const navigationItems = [
    {
      label: 'Servant Calculator',
      path: '/servant-calculator',
      icon: 'Calculator',
      description: 'Calculate material requirements',
      color: 'from-fgo-gold/20 to-yellow-900/10',
      iconColor: 'text-fgo-gold'
    },
    {
      label: 'Material Inventory',
      path: '/inventory-manager',
      icon: 'Package',
      description: 'Track and manage your materials',
      color: 'from-fgo-blue/20 to-blue-900/10',
      iconColor: 'text-fgo-blue'
    },
    {
      label: 'Farming Optimizer',
      path: '/farming-optimizer',
      icon: 'TrendingUp',
      description: 'Optimize your farming efficiency',
      color: 'from-fgo-purple/20 to-purple-900/10',
      iconColor: 'text-fgo-purple'
    },
    {
      label: 'Quest Database',
      path: '/quest-database',
      icon: 'Database',
      description: 'Browse quest information and drops',
      color: 'from-fgo-red/20 to-red-900/10',
      iconColor: 'text-fgo-red'
    }
  ];

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] md:hidden transition-all duration-300 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <aside
        className="fixed top-0 left-0 bottom-0 w-[300px] z-[201] md:hidden transform transition-all duration-300 ease-out shadow-2xl"
        role="dialog"
        aria-label="Mobile navigation menu"
        aria-modal="true"
        style={{
          background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          borderRight: '2px solid rgba(245, 158, 11, 0.2)'
        }}
      >
        {/* Decorative header with FGO pattern */}
        <div className="relative h-32 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-b border-fgo-gold/20">
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_var(--tw-gradient-stops))] from-fgo-gold via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,_var(--tw-gradient-stops))] from-fgo-blue via-transparent to-transparent"></div>
          </div>
          
          {/* Header content */}
          <div className="relative z-10 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fgo-gold via-yellow-600 to-fgo-gold p-0.5">
                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                  <Icon name="Swords" size={24} className="text-fgo-gold" />
                </div>
              </div>
              <div>
                <div className="text-xl font-bold bg-gradient-to-r from-fgo-gold via-yellow-300 to-fgo-gold bg-clip-text text-transparent">
                  FGO Calculator
                </div>
                <div className="text-xs text-gray-400 mt-1">Material Planner v2.0</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 hover:border-fgo-gold/50 flex items-center justify-center transition-all duration-300 hover:scale-110"
              aria-label="Close menu"
            >
              <Icon name="X" size={20} className="text-gray-300 hover:text-fgo-gold transition-colors" />
            </button>
          </div>
          
          {/* Decorative line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-fgo-gold to-transparent"></div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navigationItems?.map((item) => (
            <button
              key={item?.path}
              onClick={() => {
                console.log(`Navigate to: ${item?.path}`);
                onClose();
              }}
              className={`
                relative w-full text-left p-4 rounded-xl
                bg-gradient-to-r from-gray-800/50 to-gray-900/50
                border border-gray-700/30
                hover:border-${item.iconColor.split('-')[1]}/30
                hover:scale-[1.02]
                transition-all duration-300
                group
              `}
              style={{
                background: `linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)`
              }}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                   style={{
                     background: `radial-gradient(circle at center, ${item.iconColor.split('-')[1] === 'fgo-gold' ? 'rgba(245, 158, 11, 0.1)' : 
                       item.iconColor.split('-')[1] === 'fgo-blue' ? 'rgba(59, 130, 246, 0.1)' :
                       item.iconColor.split('-')[1] === 'fgo-purple' ? 'rgba(168, 85, 247, 0.1)' :
                       'rgba(239, 68, 68, 0.1)'} 0%, transparent 70%)`
                   }}>
              </div>
              
              <div className="relative z-10 flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} border border-gray-600/30 flex items-center justify-center flex-shrink-0`}>
                  <Icon name={item?.icon} size={24} className={item.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white mb-1 flex items-center gap-2">
                    {item?.label}
                    <Icon name="ArrowRight" size={14} className="text-gray-400 group-hover:text-fgo-gold transition-colors" />
                  </div>
                  <div className="text-sm text-gray-400">
                    {item?.description}
                  </div>
                </div>
              </div>
              
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-fgo-gold/20 rounded-tr-xl"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-fgo-gold/20 rounded-bl-xl"></div>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800/50 bg-gradient-to-t from-gray-900 to-transparent">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-2">© 2025 Fate/Grand Order Calculator</div>
            <div className="text-[10px] text-gray-600 tracking-wider">NOT OFFICIAL FATE/GRAND ORDER CONTENT</div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default MobileMenuOverlay;