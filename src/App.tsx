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
  const [activeTab, setActiveTab] = useState<'players' | 'score' | 'board'>('players');
  
  const { 
    players, 
    totalRounds,
  } = useGame();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto bg-white shadow-lg min-h-screen flex flex-col">
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