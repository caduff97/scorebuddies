import React, { useState } from 'react';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import RoundSelector from './components/RoundSelector';
import PlayerInput from './components/PlayerInput';
import ScoreInput from './components/ScoreInput';
import ScoreBoard from './components/ScoreBoard';
import WinnerBanner from './components/WinnerBanner';
import Footer from './components/Footer';
import { useGame, GameProvider } from './hooks/useGame';

function AppContent() {
  const {
    players,
    totalRounds,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'players' | 'score' | 'board'>(
    () => players.length > 0 ? 'score' : 'players'
  );

  return (
    <div className="min-h-screen bg-gray-100 md:py-10">
      <div className="w-full max-w-md md:max-w-2xl mx-auto bg-white shadow-lg min-h-screen md:min-h-0 md:rounded-2xl flex flex-col overflow-hidden">
        <Header />
        
        <TabNavigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hasPlayers={players.length > 0}
        />

        {activeTab === 'score' && players.length > 0 && totalRounds > 0 && (
          <RoundSelector
          />
        )}

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'players' && (
            <PlayerInput />
          )}
          
          {activeTab === 'score' && players.length > 0 && (
            <ScoreInput />
          )}
          
          {activeTab === 'board' && players.length > 0 && (
            <ScoreBoard onTabChange={setActiveTab} />
          )}
        </main>

        <WinnerBanner />
        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App; 