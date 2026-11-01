import { Crown } from "lucide-react";
import { useGame } from "../hooks/useGame";

const WinnerBanner = () => {
  const { getWinners, rounds } = useGame();
  const winners = getWinners();

  // Only show a leader once at least one round has been scored.
  if (rounds.length === 0 || !winners || winners.length === 0) return null;

  return (
    <div className="shrink-0 bg-yellow-50 border-b border-yellow-200 text-yellow-800 px-4 py-1.5 print:hidden">
      <div className="flex items-center justify-center gap-1.5 text-xs font-medium">
        <Crown size={14} className="text-yellow-500 shrink-0" />
        <span className="truncate">
          Leader{winners.length > 1 ? "s" : ""}:{" "}
          {winners.map((w) => `${w.name} (${w.totalScore})`).join(", ")}
        </span>
      </div>
    </div>
  );
};

export default WinnerBanner;
