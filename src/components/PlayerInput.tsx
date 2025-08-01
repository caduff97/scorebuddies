import React, { useState } from "react";
import { UserPlus, User, Hash } from "lucide-react";
import { Player } from "../types";
import { useGame } from "../hooks/useGame";

const PlayerInput = () => {
  const { players, alphabeticPlayers, addPlayer } = useGame();
  const [playerName, setPlayerName] = useState("");

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: playerName.trim(),
        totalScore: 0,
        rounds: [],
      };
      addPlayer(newPlayer);
      setPlayerName("");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <UserPlus className="text-primary-600" size={24} />
        <h2 className="text-2xl font-bold text-gray-800">Players</h2>
      </div>

      <form onSubmit={handleAddPlayer} className="mb-8">
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter player name"
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
            maxLength={20}
          />
          <button
            type="submit"
            disabled={!playerName.trim()}
            className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <UserPlus size={18} />
            Add
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {alphabeticPlayers.map((player, index) => (
          <div
            key={player.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-primary-500"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <Hash size={16} className="text-primary-600" />
              </div>
              <span className="font-medium text-gray-800">{player.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-500" />
              <span className="font-semibold text-primary-600">
                Total: {player.totalScore}
              </span>
            </div>
          </div>
        ))}
      </div>

      {players.length === 0 && (
        <div className="text-center py-8">
          <User className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-500 italic">Add players to start the game!</p>
        </div>
      )}
    </div>
  );
};

export default PlayerInput;
