import React from 'react';
import { Gamepad2 } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-8 text-center shadow-lg">
      <div className="flex items-center justify-center gap-3 mb-2">
        <Gamepad2 size={32} className="text-yellow-300" />
        <h1 className="text-3xl font-bold">ScoreBuddies</h1>
      </div>
      <p className="text-primary-100 text-sm">Board Game Score Tracker</p>
    </header>
  );
};

export default Header; 