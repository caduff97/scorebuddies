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

// Detect the on-screen keyboard via the visual viewport. When it opens the
// visible height shrinks; we hide the bottom nav so the input is not cramped.
function useKeyboardOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => setOpen(vv.height < window.innerHeight * 0.75);
    vv.addEventListener('resize', onResize);
    onResize();
    return () => vv.removeEventListener('resize', onResize);
  }, []);
  return open;
}

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
  const keyboardOpen = useKeyboardOpen();

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
            <PlayerInput onContinue={() => setActiveTab('score')} />
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
          visible={!keyboardOpen}
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
