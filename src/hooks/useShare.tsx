import { useEffect, useRef, useState } from 'react';
import { useGame } from './useGame';

const ROOM_STORAGE_KEY = 'scorebuddies_room_id';

export const useShare = () => {
  const { players, rounds, gameName } = useGame();
  const [roomId, setRoomId] = useState<string | null>(() => localStorage.getItem(ROOM_STORAGE_KEY));
  const [wsReady, setWsReady] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const roomIdRef = useRef<string | null>(roomId);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectCountRef = useRef(0);
  const stateRef = useRef({ players, rounds, gameName });

  useEffect(() => { stateRef.current = { players, rounds, gameName }; }, [players, rounds, gameName]);
  useEffect(() => { roomIdRef.current = roomId; }, [roomId]);

  const clearReconnect = () => {
    if (reconnectTimerRef.current) { clearTimeout(reconnectTimerRef.current); reconnectTimerRef.current = null; }
  };

  const openWs = (id: string) => {
    clearReconnect();
    if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(); }
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${proto}//${window.location.host}/ws?room=${id}&role=host`);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectCountRef.current = 0;
      setWsReady(true);
      ws.send(JSON.stringify({ type: 'state', payload: stateRef.current }));
    };

    ws.onclose = (event) => {
      setWsReady(false);
      if (event.code === 4004) {
        localStorage.removeItem(ROOM_STORAGE_KEY);
        setRoomId(null);
        roomIdRef.current = null;
        return;
      }
      if (roomIdRef.current === id) {
        const delay = Math.min(1000 * 2 ** reconnectCountRef.current, 30_000);
        reconnectCountRef.current++;
        reconnectTimerRef.current = setTimeout(() => {
          if (roomIdRef.current === id) openWs(id);
        }, delay);
      }
    };
  };

  const startSharing = async (): Promise<string> => {
    if (wsRef.current?.readyState === WebSocket.OPEN && roomId) return roomId;

    let id = roomId;
    if (!id) {
      const res = await fetch('/api/rooms', { method: 'POST' });
      const data = await res.json();
      id = data.roomId;
      setRoomId(id);
      roomIdRef.current = id;
      localStorage.setItem(ROOM_STORAGE_KEY, id!);
    }
    openWs(id!);
    return id!;
  };

  const stopSharing = () => {
    clearReconnect();
    if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(); wsRef.current = null; }
    localStorage.removeItem(ROOM_STORAGE_KEY);
    setWsReady(false);
    setRoomId(null);
    roomIdRef.current = null;
    reconnectCountRef.current = 0;
  };

  useEffect(() => {
    if (!wsReady || !wsRef.current) return;
    wsRef.current.send(JSON.stringify({ type: 'state', payload: { players, rounds, gameName } }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players, rounds, gameName, wsReady]);

  // Auto-connect on mount if a room was previously started
  useEffect(() => {
    const stored = localStorage.getItem(ROOM_STORAGE_KEY);
    if (stored) openWs(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    clearReconnect();
    if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(); }
  }, []);

  return { roomId, startSharing, stopSharing, isSharing: wsReady };
};
