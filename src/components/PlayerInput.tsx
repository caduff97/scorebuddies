import React, { useState } from "react";
import { UserPlus, User, Pencil, Check, X } from "lucide-react";
import { Player } from "../types";
import { useGame } from "../hooks/useGame";

const PlayerInput = () => {
  const { players, alphabeticPlayers, addPlayer, renamePlayer } = useGame();
  const [playerName, setPlayerName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: playerName.trim(),
        totalScore: 0,
        rounds: [],
        rank: 0,
      };
      addPlayer(newPlayer);
      setPlayerName("");
    }
  };

  const startEditing = (player: Player) => {
    setEditingId(player.id);
    setEditingName(player.name);
  };

  const commitEdit = () => {
    if (editingId && editingName.trim()) {
      renamePlayer(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") cancelEdit();
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <UserPlus className="text-primary-600" size={24} />
        <h2 className="text-2xl font-bold text-gray-800">Players</h2>
      </div>

      <form onSubmit={handleAddPlayer} className="mb-8">
        <div className="flex gap-3">
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

      <div className="space-y-2">
        {alphabeticPlayers.map((player) => (
          <div
            key={player.id}
            className="flex items-center gap-4 px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-primary-200 hover:shadow-sm transition-all"
          >
            {/* Avatar */}
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-primary-700 font-bold text-sm">
                {player.name.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Name / edit input */}
            {editingId === player.id ? (
              <input
                autoFocus
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={handleEditKeyDown}
                className="flex-1 px-3 py-1.5 border-2 border-primary-500 rounded-lg focus:outline-none text-gray-800 font-medium"
                maxLength={20}
              />
            ) : (
              <span className="flex-1 font-medium text-gray-800">
                {player.name}
              </span>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {editingId === player.id ? (
                <>
                  <button
                    onClick={commitEdit}
                    disabled={!editingName.trim()}
                    className="p-1.5 text-green-600 hover:text-green-700 disabled:text-gray-300 transition-colors"
                    title="Save"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Cancel"
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <>
                  <span className="text-sm font-semibold text-primary-600 min-w-[4rem] text-right">
                    {player.totalScore} pts
                  </span>
                  <button
                    onClick={() => startEditing(player)}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-600 border border-primary-300 rounded hover:bg-primary-50 transition-colors"
                    title="Edit name"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {players.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-400 italic">Add players to start the game!</p>
        </div>
      )}
    </div>
  );
};

export default PlayerInput;
