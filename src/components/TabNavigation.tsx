import React from 'react';
import { Users, Plus, Trophy } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'players' | 'score' | 'board';
  onTabChange: (tab: 'players' | 'score' | 'board') => void;
  hasPlayers: boolean;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  hasPlayers 
}) => {
  const tabs = [
    { id: 'players' as const, label: 'Players', icon: Users },
    { id: 'score' as const, label: 'Score', icon: Plus },
    { id: 'board' as const, label: 'Board', icon: Trophy }
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="flex">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          const isDisabled = (id === 'score' || id === 'board') && !hasPlayers;
          
          return (
            <button
              key={id}
              onClick={() => !isDisabled && onTabChange(id)}
              disabled={isDisabled}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium
                transition-all duration-200 border-b-2
                ${isActive 
                  ? 'text-primary-600 border-primary-600 bg-primary-50' 
                  : isDisabled
                    ? 'text-gray-400 cursor-not-allowed border-transparent'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Icon size={18} />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default TabNavigation; 