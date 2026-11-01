import React, { useState, useRef } from 'react';
import {
  Gamepad2,
  Pencil,
  Share2,
  MoreVertical,
  Flag,
  RotateCcw,
  Shield,
} from 'lucide-react';
import { useGame } from '../hooks/useGame';
import { useShare } from '../hooks/useShare';
import ShareModal from './ShareModal';

const Header = () => {
  const { gameName, setGameName, players, finishGame, startNewGame } = useGame();
  const { roomId, startSharing, stopSharing, isSharing } = useShare();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasPlayers = players.length > 0;

  const startEditing = () => {
    setDraft(gameName);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const commit = () => {
    setGameName(draft.trim());
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') setEditing(false);
  };

  const handleShare = async () => {
    await startSharing();
    setShowModal(true);
  };

  const handleFinish = () => {
    setMenuOpen(false);
    if (hasPlayers) finishGame();
  };

  const handleNewGame = () => {
    setMenuOpen(false);
    if (window.confirm('Start a new game? This clears all players and scores.')) {
      startNewGame();
    }
  };

  return (
    <>
      <header className="shrink-0 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2.5 shadow-md print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 size={22} className="text-yellow-300" />
            <h1 className="text-lg font-bold">ScoreBuddies</h1>
          </div>

          <div className="flex items-center gap-1">
            {hasPlayers && (
              <button
                onClick={handleShare}
                title="Share live scoreboard"
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 transition-colors rounded-full px-2.5 py-1.5 text-xs font-medium"
              >
                <Share2 size={14} />
                {isSharing ? (
                  <>
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="hidden sm:inline">Live</span>
                  </>
                ) : (
                  <span className="hidden sm:inline">Share</span>
                )}
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Menu"
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              >
                <MoreVertical size={18} />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-xl z-50 py-1 text-sm text-gray-700">
                    <button
                      onClick={handleFinish}
                      disabled={!hasPlayers}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-left"
                    >
                      <Flag size={15} className="text-primary-600" /> Finish game
                    </button>
                    <button
                      onClick={handleNewGame}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-left"
                    >
                      <RotateCcw size={15} className="text-gray-500" /> New game
                    </button>
                    <a
                      href="/privacy"
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100"
                    >
                      <Shield size={15} className="text-gray-500" /> Privacy
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-1 flex justify-center">
          {editing ? (
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={handleKeyDown}
              placeholder="Game name"
              className="bg-white/15 text-white placeholder-white/50 text-xs text-center rounded-full px-3 py-1 focus:outline-none focus:bg-white/25 w-48"
            />
          ) : (
            <button
              onClick={startEditing}
              className="group flex items-center gap-1.5 text-xs"
            >
              {gameName ? (
                <span className="text-white/90 font-medium">{gameName}</span>
              ) : (
                <span className="text-white/50">Add a game name...</span>
              )}
              <Pencil
                size={11}
                className="text-white/40 group-hover:text-white/80 transition-colors"
              />
            </button>
          )}
        </div>
      </header>

      {showModal && roomId && (
        <ShareModal
          roomId={roomId}
          onClose={() => setShowModal(false)}
          onStop={() => {
            stopSharing();
            setShowModal(false);
          }}
        />
      )}
    </>
  );
};

export default Header;
