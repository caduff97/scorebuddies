import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGame } from '../hooks/useGame';

const RoundSelector = () => {
  const { totalRounds, viewingRound, setEditingRound, setViewingRound } = useGame();
  const onRoundChange = (round: number) => {
    setViewingRound(round);
    setEditingRound(null);
  };
  if (totalRounds === 0) return null;

  return (
    <div className="shrink-0 bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => onRoundChange(viewingRound - 1)}
          disabled={viewingRound <= 1}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="text-center">
          <div className="text-[11px] text-gray-500 leading-tight">Viewing Round</div>
          <div className="text-lg font-bold text-primary-600 leading-tight">
            {viewingRound} / {totalRounds + 1}
          </div>
        </div>

        <button
          onClick={() => onRoundChange(viewingRound + 1)}
          disabled={viewingRound >= totalRounds + 1}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default RoundSelector;
