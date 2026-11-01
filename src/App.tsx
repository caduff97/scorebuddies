import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import RoundSelector from './components/RoundSelector';
import PlayerInput from './components/PlayerInput';
import ScoreInput from './components/ScoreInput';
import ScoreBoard from './components/ScoreBoard';
import WinnerBanner from './components/WinnerBanner';
import WatchMode from './components/WatchMode';
import AdBanner from './components/AdBanner';
import GameSummary from './components/GameSummary';
import Privacy from './components/Privacy';
import { useGame, GameProvider } from './hooks/useGame';

function AppContent() {
  const {
    players,
    totalRounds,
    finished,
    setFinished,
    startNewGame,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'players' | 'score' | 'board'>(
    () => (players.length > 0 ? 'score' : 'players')
  );

  // When the game is cleared (New Game), always return to the Players screen.
  useEffect(() => {
    if (players.length === 0) setActiveTab('players');
  }, [players.length]);

  return (
    <div className="bg-gray-100 md:py-8 md:min-h-screen">
      <div className="w-full max-w-md md:max-w-2xl mx-auto bg-white shadow-lg flex flex-col overflow-hidden h-[100dvh] md:h-[86vh] md:rounded-2xl print:h-auto print:overflow-visible print:shadow-none">
        <Header />
        <AdBanner />
        <WinnerBanner />

        {activeTab === 'score' && players.length > 0 && totalRounds > 0 && (
          <RoundSelector />
        )}

        <main className="flex-1 overflow-y-auto print:overflow-visible">
          {activeTab === 'players' && (
            <>
              <PlayerInput />
              <p className="text-center text-xs text-gray-400 py-4">
                <a href="/privacy" className="hover:text-gray-600">
                  Privacy Policy
                </a>
              </p>
            </>
          )}

          {activeTab === 'score' && players.length > 0 && <ScoreInput />}

          {activeTab === 'board' && players.length > 0 && (
            <ScoreBoard onTabChange={setActiveTab} />
          )}
        </main>

        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hasPlayers={players.length > 0}
        />
      </div>

      {finished && (
        <GameSummary
          onClose={() => setFinished(false)}
          onNewGame={() => startNewGame()}
        />
      )}
    </div>
  );
}

function App() {
  const watchMatch = window.location.pathname.match(/^\/watch\/([a-f0-9]+)$/);
  if (watchMatch) {
    return <WatchMode roomId={watchMatch[1]} />;
  }

  if (window.location.pathname === '/privacy') {
    return <Privacy />;
  }

  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
