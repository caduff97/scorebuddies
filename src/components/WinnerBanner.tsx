import { Crown } from "lucide-react";
import { useGame } from "../hooks/useGame";
const WinnerBanner = () => {
  const { getWinners } = useGame();
  const winners = getWinners();
  if (!winners || winners.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-6 py-4 text-center border-t border-yellow-300">
      <div className="flex items-center justify-center gap-2">
        <Crown size={20} className="text-yellow-700" />
        <h3 className="font-semibold text-sm flex flex-wrap items-center gap-1">
          🏆 Current Leader{winners.length > 1 ? "s" : ""}:{" "}
          {winners.map((winner, idx) => (
            <span key={winner.id || winner.name}>
              {winner.name} ({winner.totalScore} points)
              {idx < winners.length - 1 && ", "}
            </span>
          ))}
        </h3>
      </div>
    </div>
  );
};

export default WinnerBanner;
