import React from 'react';
import { Flag, RotateCcw } from 'lucide-react';
import { useGame } from '../hooks/useGame';

const Footer = () => {
  const { finishGame, startNewGame, players } = useGame();
  const hasPlayers = players.length > 0;

  const handleNewGame = () => {
    if (window.confirm('Start a new game? This clears all players and scores.')) {
      startNewGame();
    }
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200 px-4 py-4 print:hidden">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={finishGame}
          disabled={!hasPlayers}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <Flag size={16} />
          Finish Game
        </button>
        <button
          onClick={handleNewGame}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          <RotateCcw size={16} />
          New Game
        </button>
      </div>
      <div className="mt-3 text-center">
        <a href="/privacy" className="text-xs text-gray-400 hover:text-gray-600">
          Privacy
        </a>
      </div>
    </footer>
  );
};

export default Footer;
