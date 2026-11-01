import React from 'react';
import { Users, Plus, Trophy } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'players' | 'score' | 'board';
  onTabChange: (tab: 'players' | 'score' | 'board') => void;
  hasPlayers: boolean;
  visible?: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  hasPlayers,
  visible = true,
}) => {
  if (!visible) return null;

  const tabs = [
    { id: 'players' as const, label: 'Players', icon: Users },
    { id: 'score' as const, label: 'Score', icon: Plus },
    { id: 'board' as const, label: 'Board', icon: Trophy },
  ];

  return (
    <nav className="shrink-0 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)] print:hidden">
      <div className="flex">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          const isDisabled = (id === 'score' || id === 'board') && !hasPlayers;

          return (
            <button
              key={id}
              onClick={() => !isDisabled && onTabChange(id)}
              disabled={isDisabled}
              aria-label={label}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-primary-600'
                  : isDisabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon
                size={22}
                className={isActive ? 'scale-110 transition-transform' : ''}
              />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
