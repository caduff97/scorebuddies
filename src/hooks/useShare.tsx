import { useEffect, useRef, useState } from 'react';
import { useGame } from './useGame';

export const useShare = () => {
  const { players, rounds, gameName } = useGame();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [wsReady, setWsReady] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const buildState = () => ({ players, rounds, gameName });

  const startSharing = async (): Promise<string> => {
    const res = await fetch('/api/rooms', { method: 'POST' });
    const { roomId: id } = await res.json();
    setRoomId(id);

    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${proto}//${window.location.host}/ws?room=${id}&role=host`);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsReady(true);
      ws.send(JSON.stringify({ type: 'state', payload: buildState() }));
    };
    ws.onclose = () => setWsReady(false);

    return id;
  };

  const stopSharing = () => {
    wsRef.current?.close();
    wsRef.current = null;
    setWsReady(false);
    setRoomId(null);
  };

  // Sync game state to viewers on every change while connected
  useEffect(() => {
    if (!wsReady || !wsRef.current) return;
    wsRef.current.send(JSON.stringify({ type: 'state', payload: buildState() }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players, rounds, gameName, wsReady]);

  return { roomId, startSharing, stopSharing, isSharing: wsReady };
};
