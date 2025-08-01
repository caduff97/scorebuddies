import React from "react";
import { Trophy, Medal, Hash, TrendingUp } from "lucide-react";
import { useGame } from "../hooks/useGame";

interface ScoreBoardProps {
  onTabChange: (tab: "players" | "score" | "board") => void;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ onTabChange }) => {
  const { players, rounds, setViewingRound } = useGame();

  const getPlayerScoreForRound = (
    playerId: string,
    roundNumber: number
  ): number => {
    const round = rounds.find((r) => r.roundNumber === roundNumber);
    if (!round) return 0;
    const playerScore = round.scores.find((s) => s.playerId === playerId);
    return playerScore ? playerScore.score : 0;
  };

  const handleRoundClick = (roundNumber: number) => {
    onTabChange("score");
    setViewingRound(roundNumber);
  };

  console.log(rounds);
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="text-primary-600" size={24} />
        <h2 className="text-2xl font-bold text-gray-800">Scoreboard</h2>
      </div>

      <div className="space-y-3 mb-8">
        {players.map((player) => (
          <div
            key={player.id}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md
              ${
                player.rank === 1
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-500 border-yellow-300"
                  : "bg-white border-gray-200"
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
                    ${
                      player.rank === 1
                        ? "bg-yellow-600"
                        : player.rank === 2
                        ? "bg-gray-400"
                        : player.rank === 3
                        ? "bg-orange-700"
                        : "bg-primary-600"
                    }
                    mr-3
                  `}
                >
                  {player.rank === 1 ? (
                    <Medal size={20} className="text-yellow-300" />
                  ) : player.rank === 2 ? (
                    <Medal size={20} className="text-gray-200" />
                  ) : player.rank === 3 ? (
                    <Medal size={20} className="text-orange-300" />
                  ) : (
                    player?.rank
                  )}
                </div>
                <span
                  className={`font-semibold ${
                    player.rank === 1 ? "text-yellow-900" : "text-gray-800"
                  }`}
                >
                  {player.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-gray-500" />
                <span
                  className={`font-bold text-lg ${
                    player.rank === 1 ? "text-yellow-900" : "text-primary-600"
                  }`}
                >
                  {player.totalScore}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rounds.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Hash className="text-primary-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-800">
              Round History
            </h3>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="grid grid-cols-2 bg-gray-50 font-semibold text-gray-700">
              <div className="px-4 py-3 border-r border-gray-200">Round</div>
              <div className="px-4 py-3">Scores</div>
            </div>

            {rounds.map((round) => (
              <div
                key={round.id}
                className="grid grid-cols-2 border-t border-gray-200"
              >
                <div
                  className="px-4 py-3 bg-gray-50 font-semibold text-primary-600 border-r border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleRoundClick(round.roundNumber)}
                >
                  {round.roundNumber}
                </div>
                <div className="px-4 py-3">
                  <div className="space-y-1">
                    {players.map((player) => (
                      <div
                        key={player.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-600">{player.name}:</span>
                        <span className="font-medium">
                          {getPlayerScoreForRound(player.id, round.roundNumber)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreBoard;
