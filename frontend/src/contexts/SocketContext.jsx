import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { SocketContext } from './socketContextBase';

const SocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);

  const socket = useMemo(() => {
    const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    return io(url, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });
  }, []);

  useEffect(() => {
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.disconnect();
    };
  }, [socket]);

  const value = useMemo(() => ({ socket, connected }), [socket, connected]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider };
export default SocketProvider;

