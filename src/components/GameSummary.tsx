import React, { useState } from 'react';
import { Trophy, Share2, RotateCcw, X, CheckCircle } from 'lucide-react';
import { useGame } from '../hooks/useGame';
import { shareContent } from '../utils/share';

interface GameSummaryProps {
  onClose: () => void;
  onNewGame: () => void;
}

const GameSummary: React.FC<GameSummaryProps> = ({ onClose, onNewGame }) => {
  const { rankedPlayers, getWinners, gameName } = useGame();
  const [copied, setCopied] = useState(false);

  const winners = getWinners() ?? [];
  const isTie = winners.length > 1;

  const buildText = () => {
    const title = gameName ? gameName : 'ScoreBuddies game';
    const standings = rankedPlayers.map(
      (p, i) => `${i + 1}. ${p.name} — ${p.totalScore}`
    );
    const champ = winners.length
      ? `🏆 ${isTie ? 'Tie' : 'Winner'}: ${winners.map((w) => w.name).join(', ')}`
      : '';
    return [`${title} — final score`, champ, ...standings]
      .filter(Boolean)
      .join('\n');
  };

  const handleShare = async () => {
    const res = await shareContent({
      title: 'ScoreBuddies',
      text: buildText(),
      url: window.location.origin,
    });
    if (res === 'copied') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNewGame = () => {
    if (window.confirm('Start a new game? This clears all players and scores.')) {
      onNewGame();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-yellow-500" />
            <h2 className="text-lg font-bold text-gray-800">Game Over</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {winners.length > 0 && (
          <div className="text-center mb-5">
            <div className="text-4xl mb-1">🏆</div>
            <p className="text-sm text-gray-500">{isTie ? "It's a tie!" : 'Winner'}</p>
            <p className="text-xl font-bold text-gray-800 break-words">
              {winners.map((w) => w.name).join(', ')}
            </p>
            <p className="text-sm text-gray-500">{winners[0].totalScore} points</p>
          </div>
        )}

        <ol className="space-y-1 mb-5">
          {rankedPlayers.map((p, i) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg px-3 py-2 bg-gray-50 text-sm"
            >
              <span className="font-medium text-gray-700 truncate mr-2">
                {i + 1}. {p.name}
              </span>
              <span className="font-bold text-gray-900 shrink-0">{p.totalScore}</span>
            </li>
          ))}
        </ol>

        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {copied ? (
            <>
              <CheckCircle size={15} /> Copied!
            </>
          ) : (
            <>
              <Share2 size={15} /> Share result
            </>
          )}
        </button>

        <button
          onClick={handleNewGame}
          className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <RotateCcw size={15} /> Start new game
        </button>
      </div>
    </div>
  );
};

export default GameSummary;
