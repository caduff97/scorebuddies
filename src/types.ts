export interface Player {
  id: string;
  name: string;
  totalScore: number;
  rounds: number[];
  rank: number;
}

export interface Round {
  id: string;
  roundNumber: number;
  scores: { playerId: string; score: number }[];
}

export interface Game {
  id: string;
  name: string;
  players: Player[];
  rounds: Round[];
  currentRound: number;
  createdAt: Date;
}
