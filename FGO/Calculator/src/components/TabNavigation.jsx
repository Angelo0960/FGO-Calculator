import React, { useState } from 'react';
import Icon from './AppIcon';

const TabNavigation = () => {
  const [activeTab, setActiveTab] = useState('calculator');
  
  const tabs = [
    {
      id: 'calculator',
      label: 'Calculator',
      icon: 'Calculator',
      path: '/servant-calculator'
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: 'Package',
      path: '/inventory-manager'
    },
    {
      id: 'farming',
      label: 'Farming',
      icon: 'TrendingUp',
      path: '/farming-optimizer'
    },
    {
      id: 'quests',
      label: 'Quests',
      icon: 'Database',
      path: '/quest-database'
    }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    console.log(`Navigating to: ${tabs.find(t => t.id === tabId)?.path}`);
    // You can add actual navigation logic here if needed
  };

  return (
    <nav className="flex items-center space-x-1 border-b border-border mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={`
            px-4 py-3 flex items-center space-x-2 text-sm font-medium
            transition-all duration-200 ease-out
            ${activeTab === tab.id
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }
          `}
        >
          <Icon name={tab.icon} size={16} />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default TabNavigation;