import React, { useEffect, useState } from 'react';
import { Gamepad2, Trophy, Medal, TrendingUp, Hash, Wifi, WifiOff, AlertCircle, Printer } from 'lucide-react';
import { Player, Round } from '../types';

interface GameState {
  players: Player[];
  rounds: Round[];
  gameName: string;
}

interface WatchModeProps {
  roomId: string;
}

const WatchMode: React.FC<WatchModeProps> = ({ roomId }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [connected, setConnected] = useState(false);
  const [hostOnline, setHostOnline] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let attempts = 0;
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${proto}//${window.location.host}/ws?room=${roomId}&role=viewer`);

      ws.onopen = () => {
        setConnected(true);
        setError(null);
        attempts = 0;
      };

      ws.onclose = (event) => {
        setConnected(false);
        if (event.code === 4004) {
          setError('Room not found. The host may have closed the session.');
          return;
        }
        attempts++;
        if (attempts <= 5 && !cancelled) {
          reconnectTimeout = setTimeout(connect, Math.min(1000 * attempts, 5000));
        }
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'state') {
          setGameState(msg.payload);
          setHostOnline(true);
        } else if (msg.type === 'host_disconnected') {
          setHostOnline(false);
        } else if (msg.type === 'error') {
          setError(msg.message);
        }
      };
    };

    connect();
    return () => {
      cancelled = true;
      clearTimeout(reconnectTimeout);
      ws?.close();
    };
  }, [roomId]);

  const rankedPlayers = gameState
    ? [...gameState.players].sort((a, b) =>
        a.rank === b.rank ? a.name.localeCompare(b.name) : a.rank - b.rank
      )
    : [];

  const getScore = (playerId: string, round: Round) =>
    round.scores.find((s) => s.playerId === playerId)?.score ?? 0;

  return (
    <div className="min-h-screen bg-gray-100 md:py-10">
      <div className="w-full max-w-md md:max-w-2xl mx-auto bg-white shadow-lg min-h-screen md:min-h-0 md:rounded-2xl flex flex-col overflow-hidden">
        <header className="print:hidden bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-6 text-center shadow-lg">
          <div className="flex items-center justify-center gap-3 mb-1">
            <Gamepad2 size={32} className="text-yellow-300" />
            <h1 className="text-3xl font-bold">ScoreBuddies</h1>
          </div>
          {gameState?.gameName && (
            <p className="text-white font-medium text-sm mt-1">{gameState.gameName}</p>
          )}
          <div className="flex items-center justify-center gap-1.5 mt-2">
            {connected ? (
              <>
                <Wifi size={13} className={hostOnline ? 'text-green-300' : 'text-yellow-300'} />
                <span className="text-xs text-white/70">
                  {hostOnline ? 'Live' : 'Host offline — showing last known scores'}
                </span>
              </>
            ) : (
              <>
                <WifiOff size={13} className="text-red-300" />
                <span className="text-xs text-white/70">Reconnecting…</span>
              </>
            )}
          </div>
        </header>

        <main id="print-scoreboard" className="flex-1 overflow-y-auto p-6">
          {/* Print-only header */}
          <div className="hidden print:block mb-6 text-center border-b border-gray-300 pb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {gameState?.gameName || 'ScoreBuddies'} — Final Scoreboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">{new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
          </div>

          {error ? (
            <div className="text-center text-gray-500 mt-16">
              <AlertCircle size={48} className="mx-auto mb-4 text-red-300" />
              <p className="text-lg font-medium text-gray-700">Session ended</p>
              <p className="text-sm text-gray-400 mt-2">{error}</p>
            </div>
          ) : !gameState ? (
            <div className="text-center text-gray-500 mt-16">
              <Trophy size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-700">Waiting for scores…</p>
              <p className="text-sm text-gray-400 mt-2">The host hasn't started yet</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="text-primary-600" size={24} />
                  <h2 className="text-2xl font-bold text-gray-800">Scoreboard</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="print:hidden text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                    View only
                  </span>
                  <button
                    onClick={() => window.print()}
                    className="print:hidden flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Printer size={16} />
                    Print &amp; Save
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {rankedPlayers.map((player) => (
                  <div
                    key={player.id}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      player.rank === 1
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 border-yellow-300'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mr-3 ${
                          player.rank === 1 ? 'bg-yellow-600'
                            : player.rank === 2 ? 'bg-gray-400'
                            : player.rank === 3 ? 'bg-orange-700'
                            : 'bg-primary-600'
                        }`}>
                          {player.rank === 1 ? <Medal size={20} className="text-yellow-300" />
                            : player.rank === 2 ? <Medal size={20} className="text-gray-200" />
                            : player.rank === 3 ? <Medal size={20} className="text-orange-300" />
                            : player.rank}
                        </div>
                        <span className={`font-semibold ${player.rank === 1 ? 'text-yellow-900' : 'text-gray-800'}`}>
                          {player.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-gray-500" />
                        <span className={`font-bold text-lg ${player.rank === 1 ? 'text-yellow-900' : 'text-primary-600'}`}>
                          {player.totalScore}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {gameState.rounds.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Hash className="text-primary-600" size={20} />
                    <h3 className="text-lg font-semibold text-gray-800">Round History</h3>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-2 bg-gray-50 font-semibold text-gray-700">
                      <div className="px-4 py-3 border-r border-gray-200">Round</div>
                      <div className="px-4 py-3">Scores</div>
                    </div>
                    {gameState.rounds.map((round) => (
                      <div key={round.id} className="grid grid-cols-2 border-t border-gray-200">
                        <div className="px-4 py-3 bg-gray-50 font-semibold text-primary-600 border-r border-gray-200">
                          {round.roundNumber}
                        </div>
                        <div className="px-4 py-3">
                          <div className="space-y-1">
                            {rankedPlayers.map((player) => (
                              <div key={player.id} className="flex justify-between text-sm">
                                <span className="text-gray-600">{player.name}:</span>
                                <span className="font-medium">{getScore(player.id, round)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default WatchMode;
