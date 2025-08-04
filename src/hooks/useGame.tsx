import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useMemo,
} from "react";
import { Player, Round, Game } from "../types";

interface GameContextType {
  players: Player[];
  alphabeticPlayers: Player[];
  rankedPlayers: Player[];
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
  setCurrentRound: (round: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within a GameProvider");
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

  const totalRounds = useMemo(() => rounds.length, [rounds]);

  // ---- Helpers ----
  const recalculateRanks = (players: Player[]): Player[] => {
    const sortedByScore = [...players].sort(
      (a, b) => b.totalScore - a.totalScore
    );

    let currentRank = 0;
    let lastScore: number | null = null;
    const rankMap = new Map<string, number>();

    sortedByScore.forEach((player) => {
      if (player.totalScore !== lastScore) currentRank++;
      lastScore = player.totalScore;
      rankMap.set(player.id, currentRank);
    });

    return players.map((p) => ({ ...p, rank: rankMap.get(p.id) || 0 }));
  };

  const calculateTotals = (roundsList: Round[], playersList: Player[]) => {
    return playersList.map((player) => {
      const scores = roundsList.map(
        (r) => r.scores.find((s) => s.playerId === player.id)?.score || 0
      );
      const totalScore = scores.reduce((sum, val) => sum + val, 0);
      return { ...player, rounds: scores, totalScore };
    });
  };

  const updatePlayersFromRounds = (newRounds: Round[]) => {
    setPlayers((prev) => recalculateRanks(calculateTotals(newRounds, prev)));
  };

  // ---- Game Persistence ----
  useEffect(() => {
    const saved = localStorage.getItem("scorebuddies-game");
    if (saved) {
      try {
        const game: Game = JSON.parse(saved);
        setPlayers(game.players);
        setRounds(game.rounds);
        setCurrentRound(game.currentRound);
      } catch (err) {
        console.error("Error loading game:", err);
      }
    }
  }, []);

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

  // ---- Core Actions ----
  const addPlayer = (player: Player) => {
    const updatedPlayers = [...players, player];
    setPlayers(recalculateRanks(updatedPlayers));
  };

  const addRound = (round: Round) => {
    const newRounds = [...rounds, round];
    setRounds(newRounds);
    updatePlayersFromRounds(newRounds);
    setCurrentRound((prev) => prev + 1);
  };

  const updateRound = (
    roundNumber: number,
    newScores: { playerId: string; score: number }[]
  ) => {
    const updatedRounds = rounds.map((r) =>
      r.roundNumber === roundNumber ? { ...r, scores: newScores } : r
    );
    setRounds(updatedRounds);
    updatePlayersFromRounds(updatedRounds);
    setEditingRound(null);
  };

  const deleteRound = (roundNumber: number) => {
    const newRounds = rounds
      .filter((r) => r.roundNumber !== roundNumber)
      .map((r, idx) => ({ ...r, roundNumber: idx + 1 }));
    setRounds(newRounds);
    updatePlayersFromRounds(newRounds);
    if (currentRound > newRounds.length) setCurrentRound(newRounds.length + 1);
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
    if (!players.length) return null;
    const max = Math.max(...players.map((p) => p.totalScore));
    return players.filter((p) => p.totalScore === max) || null;
  };

  const getRoundByNumber = (roundNumber: number) =>
    rounds.find((r) => r.roundNumber === roundNumber);

  const value: GameContextType = {
    players,
    alphabeticPlayers: useMemo(
      () => [...players].sort((a, b) => a.name.localeCompare(b.name)),
      [players]
    ),
    rankedPlayers: useMemo(
      () =>
        [...players].sort((a, b) =>
          a.rank === b.rank ? a.name.localeCompare(b.name) : a.rank - b.rank
        ),
      [players]
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
