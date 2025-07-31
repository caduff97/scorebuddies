import React from 'react';
import { ChevronLeft, ChevronRight} from 'lucide-react';
import { useGame } from '../hooks/useGame';


const RoundSelector = () => {
  const {totalRounds, viewingRound, setEditingRound, setViewingRound} = useGame()
  const onRoundChange = (round: number) => {
    setViewingRound(round);
    setEditingRound(null);
  };
  if (totalRounds === 0) return null;


  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onRoundChange(viewingRound - 1)}
            disabled={viewingRound <= 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="text-center">
            <div className="text-sm text-gray-600">Viewing Round</div>
            <div className="text-2xl font-bold text-primary-600">{viewingRound} / {totalRounds +1}</div>
          </div>
          
          <button
            onClick={() => onRoundChange(viewingRound + 1)}
            disabled={viewingRound >= totalRounds + 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default RoundSelector; 