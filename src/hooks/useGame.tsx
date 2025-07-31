import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Player, Round, Game } from '../types';

interface GameContextType {
  players: Player[];
  rounds: Round[];
  currentRound: number;
  editingRound: number | null;
  viewingRound: number;
  totalRounds: number;
  addPlayer: (player: Player) => void;
  addRound: (round: Round) => void;
  updateRound: (roundNumber: number, newScores: { playerId: string; score: number }[]) => void;
  deleteRound: (roundNumber: number) => void;
  resetGame: () => void;
  getWinner: () => Player | null;
  getRoundByNumber: (roundNumber: number) => Round | undefined;
  setEditingRound: (round: number | null) => void;
  setViewingRound: (round: number) => void;
  setCurrentRound: (roundNumber: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
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

  // Load game data from localStorage on component mount
  useEffect(() => {
    const savedGame = localStorage.getItem('scorebuddies-game');
    if (savedGame) {
      try {
        const game: Game = JSON.parse(savedGame);
        setPlayers(game.players);
        setRounds(game.rounds);
        setCurrentRound(game.currentRound);
      } catch (error) {
        console.error('Error loading saved game:', error);
      }
    }
  }, []);

  // Save game data to localStorage whenever it changes
  useEffect(() => {
    const game: Game = {
      id: 'current-game',
      name: 'Current Game',
      players,
      rounds,
      currentRound,
      createdAt: new Date()
    };
    localStorage.setItem('scorebuddies-game', JSON.stringify(game));
  }, [players, rounds, currentRound]);

  const addPlayer = (player: Player) => {
    setPlayers(prev => [...prev, player]);
  };

  const addRound = (round: Round) => {
    setRounds(prev => [...prev, round]);
    
    // Update player totals
    setPlayers(prev => prev.map(player => {
      const roundScore = round.scores.find(s => s.playerId === player.id);
      const newTotal = player.totalScore + (roundScore?.score || 0);
      return {
        ...player,
        totalScore: newTotal,
        rounds: [...player.rounds, roundScore?.score || 0]
      };
    }));
    
    setCurrentRound(prev => prev + 1);
  };

  const updateRound = (roundNumber: number, newScores: { playerId: string; score: number }[]) => {
    // Find the round to update
    const roundIndex = rounds.findIndex(r => r.roundNumber === roundNumber);
    if (roundIndex === -1) return;

    const oldRound = rounds[roundIndex];
    const newRound: Round = {
      ...oldRound,
      scores: newScores
    };

    // Update the round
    setRounds(prev => prev.map((r, i) => i === roundIndex ? newRound : r));

    // Recalculate all player totals from scratch
    setPlayers(prev => prev.map(player => {
      let newTotal = 0;
      rounds.forEach(round => {
        if (round.id === oldRound.id) {
          // Use new scores for this round
          const score = newScores.find(s => s.playerId === player.id)?.score || 0;
          newTotal += score;
        } else {
          // Use existing scores for other rounds
          const score = round.scores.find(s => s.playerId === player.id)?.score || 0;
          newTotal += score;
        }
      });
      
      return {
        ...player,
        totalScore: newTotal,
        rounds: rounds.map(round => {
          if (round.id === oldRound.id) {
            return newScores.find(s => s.playerId === player.id)?.score || 0;
          }
          return round.scores.find(s => s.playerId === player.id)?.score || 0;
        })
      };
    }));

    setEditingRound(null);
  };

  const deleteRound = (roundNumber: number) => {
    const roundToDelete = rounds.find(r => r.roundNumber === roundNumber);
    if (!roundToDelete) return;

    // Remove the round
    setRounds(prev => prev.filter(r => r.roundNumber !== roundNumber));

    // Recalculate all player totals
    setPlayers(prev => prev.map(player => {
      let newTotal = 0;
      const newRounds: number[] = [];
      
      rounds.forEach(round => {
        if (round.roundNumber !== roundNumber) {
          const score = round.scores.find(s => s.playerId === player.id)?.score || 0;
          newTotal += score;
          newRounds.push(score);
        }
      });
      
      return {
        ...player,
        totalScore: newTotal,
        rounds: newRounds
      };
    }));

    // Adjust current round if needed
    if (currentRound > roundNumber) {
      setCurrentRound(prev => prev - 1);
    }
    
    setEditingRound(null);
  };

  const resetGame = () => {
    setPlayers([]);
    setRounds([]);
    setCurrentRound(1);
    setEditingRound(null);
    localStorage.removeItem('scorebuddies-game');
  };

  const getWinner = () => {
    if (players.length === 0) return null;
    return players.reduce((winner, player) => 
      player.totalScore > winner.totalScore ? player : winner
    );
  };

  const getRoundByNumber = (roundNumber: number) => {
    return rounds.find(r => r.roundNumber === roundNumber);
  };

  const totalRounds = rounds.length;

  const value: GameContextType = {
    players,
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
    getWinner,
    getRoundByNumber,
    setEditingRound,
    setViewingRound,
    setCurrentRound
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}; 