import React from 'react';
import { Crown } from 'lucide-react';
import { useGame } from '../hooks/useGame';

const WinnerBanner = () => {
    const {getWinner} = useGame()
    const winner = getWinner()
    if (!winner) return null;

    return (
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-6 py-4 text-center border-t border-yellow-300">
        <div className="flex items-center justify-center gap-2">
            <Crown size={20} className="text-yellow-700" />
            <h3 className="font-semibold text-sm">
            🏆 Current Leader: {winner.name} ({winner.totalScore} points)
            </h3>
        </div>
        </div>
    );
};

export default WinnerBanner; 