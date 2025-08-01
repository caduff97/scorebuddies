import React, { useState, useEffect, useRef } from "react";
import { Plus, Hash, Save, X, Edit, Trash2, Eye } from "lucide-react";
import { Round } from "../types";
import { useGame } from "../hooks/useGame";

const ScoreInput = () => {
  const [scores, setScores] = useState<{ [playerId: string]: string }>({});
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    players,
    viewingRound,
    editingRound,
    totalRounds,
    addRound,
    updateRound,
    deleteRound,
    getRoundByNumber,
    setEditingRound,
    setViewingRound,
  } = useGame();

  const existingRound = getRoundByNumber(viewingRound);

  const handleCancelEdit = () => {
    setEditingRound(null);
  };

  const handleEditRound = (round: number) => {
    setViewingRound(round);
    setEditingRound(round);
  };

  const handleDeleteRound = (round: number) => {
    if (
      window.confirm(
        `Are you sure you want to delete Round ${round}? This will recalculate all scores.`
      )
    ) {
      deleteRound(round);
      setViewingRound(Math.max(1, round - 1));
    }
  };

  useEffect(() => {
    if (editingRound && existingRound) {
      const initialScores: { [playerId: string]: string } = {};
      existingRound.scores.forEach((score) => {
        initialScores[score.playerId] = score.score.toString();
      });
      setScores(initialScores);
    } else {
      setScores({});
    }
  }, [editingRound, existingRound]);

  const handleScoreChange = (playerId: string, value: string) => {
    setScores((prev) => ({
      ...prev,
      [playerId]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const roundScores = players.map((player) => ({
      playerId: player.id,
      score: parseInt(scores[player.id] || "0", 10),
    }));

    if (editingRound && existingRound) {
      // Update existing round
      updateRound(editingRound, roundScores);
    } else {
      // Add new round
      const newRound: Round = {
        id: Date.now().toString(),
        roundNumber: totalRounds + 1,
        scores: roundScores,
      };
      addRound(newRound);
      setViewingRound(totalRounds + 2);
    }

    setScores({});
  };

  const isEditing = editingRound !== null;
  const isViewingExistingRound = existingRound && viewingRound <= totalRounds;
  const isAddingNewRound = !isEditing && !isViewingExistingRound;

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (index < players.length - 1) {
        // Focus next input
        inputRefs.current[index + 1]?.focus();
      } else {
        // Submit form if last input
        (e.target as HTMLInputElement).form?.requestSubmit();
        inputRefs.current[0]?.focus();
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <Edit className="text-blue-600" size={24} />
          ) : isViewingExistingRound ? (
            <Eye className="text-gray-600" size={24} />
          ) : (
            <Plus className="text-primary-600" size={24} />
          )}
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing
              ? `Edit Round ${editingRound}`
              : isViewingExistingRound
              ? `Round ${viewingRound}`
              : `Round ${totalRounds + 1}`}
          </h2>
        </div>
        {isEditing && (
          <button
            onClick={handleCancelEdit}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X size={14} />
            Cancel
          </button>
        )}
        {isViewingExistingRound && !isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEditRound(viewingRound)}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Edit size={14} />
              Edit
            </button>
            <button
              onClick={() => handleDeleteRound(viewingRound)}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {players.map((player, index) => {
            const existingScore =
              existingRound?.scores.find((s) => s.playerId === player.id)
                ?.score || 0;
            const isReadOnly = isViewingExistingRound && !isEditing;

            return (
              <div
                key={player.id}
                className={`p-4 rounded-lg ${
                  isReadOnly ? "bg-gray-50" : "bg-gray-50"
                }`}
              >
                <label
                  htmlFor={`score-${player.id}`}
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                      <Hash size={12} className="text-primary-600" />
                    </div>
                    {player.name}
                  </div>
                </label>
                {isReadOnly ? (
                  <div className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-lg font-semibold text-gray-800">
                    {existingScore}
                  </div>
                ) : (
                  <input
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    id={`score-${player.id}`}
                    type="number"
                    value={scores[player.id] || ""}
                    onChange={(e) =>
                      handleScoreChange(player.id, e.target.value)
                    }
                    onKeyDown={(e) => handleInputKeyDown(e, index)}
                    placeholder="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                    min="-999"
                    max="999"
                  />
                )}
              </div>
            );
          })}
        </div>

        {isAddingNewRound && (
          <button
            type="submit"
            className="w-full py-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Round
          </button>
        )}

        {isEditing && (
          <button
            type="submit"
            className="w-full py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save Changes
          </button>
        )}
      </form>
    </div>
  );
};

export default ScoreInput;
