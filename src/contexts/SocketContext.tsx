import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        // Initialize socket connection
        // In production, this should point to your actual backend URL
        const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
            autoConnect: false,
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    useEffect(() => {
        if (socket && user) {
            socket.connect();

            socket.on('connect', () => {
                console.log('Socket connected');
                setIsConnected(true);
                // Join user specific room
                socket.emit('join_user_room', user.id);
            });

            socket.on('disconnect', () => {
                console.log('Socket disconnected');
                setIsConnected(false);
            });
        } else if (socket && !user) {
            socket.disconnect();
        }
    }, [socket, user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
