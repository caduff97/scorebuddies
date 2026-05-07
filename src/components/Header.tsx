import React, { useState, useRef } from 'react';
import { Gamepad2, Pencil, Share2 } from 'lucide-react';
import { useGame } from '../hooks/useGame';
import { useShare } from '../hooks/useShare';
import ShareModal from './ShareModal';

const Header = () => {
  const { gameName, setGameName, players } = useGame();
  const { roomId, startSharing, isSharing } = useShare();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [showModal, setShowModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (!roomId) await startSharing();
    setShowModal(true);
  };

  return (
    <>
      <header className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-6 text-center shadow-lg print:hidden">
        <div className="flex items-center justify-center gap-3 mb-3 relative">
          <Gamepad2 size={32} className="text-yellow-300" />
          <h1 className="text-3xl font-bold">ScoreBuddies</h1>

          {players.length > 0 && (
            <button
              onClick={handleShare}
              title="Share scoreboard"
              className="absolute right-0 flex items-center gap-1.5 bg-white/15 hover:bg-white/25 transition-colors rounded-full px-3 py-1.5 text-sm font-medium"
            >
              <Share2 size={14} />
              {isSharing ? (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Live
                </span>
              ) : (
                'Share'
              )}
            </button>
          )}
        </div>

        {editing ? (
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            placeholder="Game name"
            className="bg-white/15 text-white placeholder-white/50 text-sm text-center rounded-full px-4 py-1.5 focus:outline-none focus:bg-white/25 w-48"
          />
        ) : (
          <button
            onClick={startEditing}
            className="group flex items-center justify-center gap-1.5 mx-auto text-sm"
          >
            {gameName ? (
              <span className="text-white font-medium">{gameName}</span>
            ) : (
              <span className="text-white/50">Add a game name...</span>
            )}
            <Pencil size={13} className="text-white/40 group-hover:text-white/80 transition-colors" />
          </button>
        )}
      </header>

      {showModal && roomId && (
        <ShareModal roomId={roomId} onClose={() => setShowModal(false)} />
      )}
    </>
  );
};

export default Header;
