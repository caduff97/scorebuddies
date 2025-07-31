import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useGame } from '../hooks/useGame';

const Footer = () => {
    const {resetGame} = useGame()

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the game? This will clear all players and scores.')) {
      resetGame();
    }
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200 px-6 py-4 text-center">
      <button
        onClick={handleReset}
        className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors duration-200"
      >
        <RotateCcw size={16} />
        Reset Game
      </button>
    </footer>
  );
};

export default Footer; 