import React, { useState, useEffect } from "react";
import {
  Plus,
  Hash,
  Save,
  X,
  Edit,
  Trash2,
  Eye,
  Delete,
  RotateCcw,
} from "lucide-react";
import { Round } from "../types";
import { useGame } from "../hooks/useGame";

const DRAFT_KEY = "scorebuddies-draft-scores";
const MIN = -999;
const MAX = 999;

const clamp = (n: number) => Math.max(MIN, Math.min(MAX, n));
const toNum = (v: string | undefined) => {
  const n = parseInt(v ?? "0", 10);
  return Number.isNaN(n) ? 0 : n;
};

/* ---------------- In-app numeric keypad (no OS keyboard) ---------------- */
interface KeypadProps {
  playerName: string;
  initial: number;
  onDone: (value: number) => void;
  onClose: () => void;
}

const Keypad: React.FC<KeypadProps> = ({ playerName, initial, onDone, onClose }) => {
  const [str, setStr] = useState<string>(initial === 0 ? "" : String(initial));

  const pressDigit = (d: string) => {
    setStr((prev) => {
      const neg = prev.startsWith("-");
      const digits = (neg ? prev.slice(1) : prev) + d;
      const next = (neg ? "-" : "") + digits.replace(/^0+(?=\d)/, "");
      return clamp(toNum(next)) === toNum(next) ? next : prev;
    });
  };
  const toggleSign = () => setStr((p) => (p.startsWith("-") ? p.slice(1) : "-" + p));
  const backspace = () => setStr((p) => p.slice(0, -1));
  const clear = () => setStr("");

  const display = str === "" || str === "-" ? "0" : str;

  const Key: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string }> = ({
    onClick,
    children,
    className = "",
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`h-14 rounded-xl text-xl font-semibold active:scale-95 transition-transform ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white rounded-t-2xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-500 truncate">{playerName}</span>
          <button type="button" onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 text-center text-4xl font-bold text-gray-800 tabular-nums">{display}</div>

        <div className="grid grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <Key key={d} onClick={() => pressDigit(d)} className="bg-gray-100 text-gray-800 hover:bg-gray-200">
              {d}
            </Key>
          ))}
          <Key onClick={toggleSign} className="bg-gray-100 text-primary-600 hover:bg-gray-200">
            ±
          </Key>
          <Key onClick={() => pressDigit("0")} className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            0
          </Key>
          <Key onClick={backspace} className="bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center">
            <Delete size={22} />
          </Key>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <Key onClick={clear} className="bg-gray-100 text-gray-600 hover:bg-gray-200 text-base">
            Clear
          </Key>
          <Key
            onClick={() => onDone(clamp(toNum(str)))}
            className="bg-primary-600 text-white hover:bg-primary-700 text-base"
          >
            Done
          </Key>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------ Score screen ------------------------------ */
// Two rows: negatives on top, positives on the bottom, with a reset-to-0 chip.
const NEG = [-10, -5, -2, -1];
const POS = [1, 2, 5, 10];

const ScoreInput = () => {
  const [scores, setScores] = useState<{ [playerId: string]: string }>({});
  const [keypadFor, setKeypadFor] = useState<string | null>(null);

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

  const handleCancelEdit = () => setEditingRound(null);
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
    } else if (!editingRound && !existingRound) {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        try {
          setScores(JSON.parse(saved));
          return;
        } catch {}
      }
      setScores({});
    } else {
      setScores({});
    }
  }, [editingRound, existingRound]);

  useEffect(() => {
    if (!editingRound && !existingRound && Object.keys(scores).length > 0) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(scores));
    }
  }, [scores, editingRound, existingRound]);

  const setScore = (playerId: string, value: number) =>
    setScores((prev) => ({ ...prev, [playerId]: String(clamp(value)) }));

  const bump = (playerId: string, delta: number) =>
    setScore(playerId, toNum(scores[playerId]) + delta);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const roundScores = players.map((player) => ({
      playerId: player.id,
      score: toNum(scores[player.id]),
    }));

    if (editingRound && existingRound) {
      updateRound(editingRound, roundScores);
    } else {
      const newRound: Round = {
        id: Date.now().toString(),
        roundNumber: totalRounds + 1,
        scores: roundScores,
      };
      addRound(newRound);
      setViewingRound(totalRounds + 2);
    }

    localStorage.removeItem(DRAFT_KEY);
    setScores({});
  };

  const isEditing = editingRound !== null;
  const isViewingExistingRound = existingRound && viewingRound <= totalRounds;
  const isAddingNewRound = !isEditing && !isViewingExistingRound;

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
          {players.map((player) => {
            const existingScore =
              existingRound?.scores.find((s) => s.playerId === player.id)?.score || 0;
            const isReadOnly = isViewingExistingRound && !isEditing;
            const current = isReadOnly ? existingScore : toNum(scores[player.id]);

            return (
              <div key={player.id} className="p-4 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                      <Hash size={12} className="text-primary-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{player.name}</span>
                  </div>

                  {/* Tappable value — opens the in-app keypad (no OS keyboard) */}
                  {isReadOnly ? (
                    <span className="min-w-[3rem] text-right text-2xl font-bold text-gray-800 tabular-nums">
                      {existingScore}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setKeypadFor(player.id)}
                      className="min-w-[3.5rem] px-3 py-1.5 rounded-lg bg-white border-2 border-gray-200 text-2xl font-bold text-gray-800 tabular-nums hover:border-primary-400 transition-colors"
                    >
                      {current}
                    </button>
                  )}
                </div>

                {/* Quick-add chips: negatives, reset-to-0, positives */}
                {!isReadOnly && (
                  <div className="grid grid-cols-5 gap-2">
                    {NEG.map((delta) => (
                      <button
                        key={delta}
                        type="button"
                        onClick={() => bump(player.id, delta)}
                        className="py-2 rounded-lg text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 transition-transform"
                      >
                        {delta}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setScore(player.id, 0)}
                      aria-label="Reset to zero"
                      className="py-2 rounded-lg text-sm font-semibold bg-gray-200 text-gray-600 hover:bg-gray-300 active:scale-95 transition-transform flex items-center justify-center"
                    >
                      <RotateCcw size={15} />
                    </button>
                    {POS.map((delta) => (
                      <button
                        key={delta}
                        type="button"
                        onClick={() => bump(player.id, delta)}
                        className="py-2 rounded-lg text-sm font-semibold bg-primary-50 text-primary-700 hover:bg-primary-100 active:scale-95 transition-transform"
                      >
                        +{delta}
                      </button>
                    ))}
                    {/* pad the second row so +chips align under -chips */}
                    <span aria-hidden className="pointer-events-none" />
                  </div>
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

      {keypadFor && (
        <Keypad
          playerName={players.find((p) => p.id === keypadFor)?.name ?? ""}
          initial={toNum(scores[keypadFor])}
          onClose={() => setKeypadFor(null)}
          onDone={(value) => {
            setScore(keypadFor, value);
            setKeypadFor(null);
          }}
        />
      )}
    </div>
  );
};

export default ScoreInput;
