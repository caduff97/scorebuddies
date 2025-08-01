import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { Player, Round, Game } from "../types";

interface GameContextType {
  players: Player[];
  alphabeticPlayers: Player[];
  rounds: Round[];
  currentRound: number;
  editingRound: number | null;
  viewingRound: number;
  totalRounds: number;
  addPlayer: (player: Player) => void;
  addRound: (round: Round) => void;
  updateRound: (
    roundNumber: number,
    newScores: { playerId: string; score: number }[]
  ) => void;
  deleteRound: (roundNumber: number) => void;
  resetGame: () => void;
  getWinners: () => Player[] | null;
  getRoundByNumber: (roundNumber: number) => Round | undefined;
  setEditingRound: (round: number | null) => void;
  setViewingRound: (round: number) => void;
  setCurrentRound: (roundNumber: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [editingRound, setEditingRound] = useState<number | null>(null);
  const [viewingRound, setViewingRound] = useState(1);
  const totalRounds = React.useMemo(() => rounds.length, [rounds]);

  useEffect(() => {
    const savedGame = localStorage.getItem("scorebuddies-game");
    if (savedGame) {
      try {
        const game: Game = JSON.parse(savedGame);
        setPlayers(game.players);
        setRounds(game.rounds);
        setCurrentRound(game.currentRound);
      } catch (error) {
        console.error("Error loading saved game:", error);
      }
    }
  }, []);

  // Save game data to localStorage whenever it changes
  useEffect(() => {
    const game: Game = {
      id: "current-game",
      name: "Current Game",
      players,
      rounds,
      currentRound,
      createdAt: new Date(),
    };
    localStorage.setItem("scorebuddies-game", JSON.stringify(game));
  }, [players, rounds, currentRound]);

  const addPlayer = (player: Player) => {
    setPlayersWithRank((prev) => [...prev, player]);
  };

  const recalculateRanks = (playersList: Player[]) => {
    const rankedPlayers = [...playersList].sort(
      (a, b) => b.totalScore - a.totalScore
    );

    let currentRank = 0;
    let lastScore: number | null = null;

    return rankedPlayers.map((player, idx) => {
      if (player.totalScore !== lastScore) {
        currentRank += 1;
      }

      lastScore = player.totalScore;

      return { ...player, rank: currentRank };
    });
  };

  // Helper to update players and recalculate ranks
  const setPlayersWithRank = (updateFn: (prev: Player[]) => Player[]) => {
    setPlayers((prev) => {
      const updated = updateFn(prev);
      return recalculateRanks(updated);
    });
  };

  const addRound = (round: Round) => {
    setRounds((prev) => [...prev, round]);

    // Update player totals
    setPlayersWithRank((prev) =>
      prev.map((player) => {
        const roundScore = round.scores.find((s) => s.playerId === player.id);
        const newTotal = player.totalScore + (roundScore?.score || 0);
        return {
          ...player,
          totalScore: newTotal,
          rounds: [...player.rounds, roundScore?.score || 0],
        };
      })
    );

    setCurrentRound((prev) => prev + 1);
  };

  const updateRound = (
    roundNumber: number,
    newScores: { playerId: string; score: number }[]
  ) => {
    // Find the round to update
    const roundIndex = rounds.findIndex((r) => r.roundNumber === roundNumber);
    if (roundIndex === -1) return;

    const oldRound = rounds[roundIndex];
    const newRound: Round = {
      ...oldRound,
      scores: newScores,
    };

    // Update the round
    setRounds((prev) => prev.map((r, i) => (i === roundIndex ? newRound : r)));

    // Recalculate all player totals from scratch
    setPlayersWithRank((prev) =>
      prev.map((player) => {
        let newTotal = 0;
        rounds.forEach((round) => {
          if (round.id === oldRound.id) {
            // Use new scores for this round
            const score =
              newScores.find((s) => s.playerId === player.id)?.score || 0;
            newTotal += score;
          } else {
            // Use existing scores for other rounds
            const score =
              round.scores.find((s) => s.playerId === player.id)?.score || 0;
            newTotal += score;
          }
        });

        return {
          ...player,
          totalScore: newTotal,
          rounds: rounds.map((round) => {
            if (round.id === oldRound.id) {
              return (
                newScores.find((s) => s.playerId === player.id)?.score || 0
              );
            }
            return (
              round.scores.find((s) => s.playerId === player.id)?.score || 0
            );
          }),
        };
      })
    );

    setEditingRound(null);
  };

  const deleteRound = (roundNumber: number) => {
    const roundToDelete = rounds.find((r) => r.roundNumber === roundNumber);
    if (!roundToDelete) return;

    // Remove the round and recalculate roundNumbers
    const updatedRounds = rounds
      .filter((r) => r.roundNumber !== roundNumber)
      .map((round, idx) => ({
        ...round,
        roundNumber: idx + 1,
      }));

    setRounds(updatedRounds);

    // Recalculate all player totals
    setPlayers((prev) =>
      prev.map((player) => {
        let newTotal = 0;
        const newRounds: number[] = [];

        updatedRounds.forEach((round) => {
          const score =
            round.scores.find((s) => s.playerId === player.id)?.score || 0;
          newTotal += score;
          newRounds.push(score);
        });

        return {
          ...player,
          totalScore: newTotal,
          rounds: newRounds,
        };
      })
    );

    // Adjust current round if needed
    if (currentRound > updatedRounds.length) {
      setCurrentRound(updatedRounds.length + 1);
    }

    setEditingRound(null);
  };

  const resetGame = () => {
    setPlayers([]);
    setRounds([]);
    setCurrentRound(1);
    setEditingRound(null);
    localStorage.removeItem("scorebuddies-game");
  };

  const getWinners = () => {
    if (players.length === 0) return null;
    const maxScore = Math.max(...players.map((p) => p.totalScore));
    const winners = players.filter((p) => p.totalScore === maxScore);
    return winners.length > 0 ? winners : null;
  };

  const getRoundByNumber = (roundNumber: number) => {
    return rounds.find((r) => r.roundNumber === roundNumber);
  };

  const value: GameContextType = {
    players,
    alphabeticPlayers: [...players].sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
    rounds,
    currentRound,
    editingRound,
    viewingRound,
    totalRounds,
    addPlayer,
    addRound,
    updateRound,
    deleteRound,
    resetGame,
    getWinners,
    getRoundByNumber,
    setEditingRound,
    setViewingRound,
    setCurrentRound,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
