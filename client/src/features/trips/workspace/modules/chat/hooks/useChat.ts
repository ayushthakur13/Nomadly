import { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import type { RootState } from '@/store';
import type { ChatMessage } from '@shared/types';

import chatService from '@/services/chat.service';

const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4444/api';
  return apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
};

export const useChat = (tripId: string) => {
  const token = useSelector((state: RootState) => state.auth.token);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Sync token updates to socket instance for reconnection handshakes
  useEffect(() => {
    if (socketRef.current && token) {
      socketRef.current.auth = { token };
    }
  }, [token]);

  // Handle connection and message streams
  useEffect(() => {
    if (!tripId || !token) return;

    setLoading(true);
    setError(null);

    // Fetch initial chat logs from database
    chatService.fetchChatHistory(tripId)
      .then((history) => {
        setMessages(history);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error('Failed to load chat history:', err);
        setError('Failed to load chat history');
        setLoading(false);
      });

    // Establish WebSocket Connection
    const socketUrl = getSocketUrl();
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('⚡ Socket connected to server, joining room:', tripId);
      socket.emit('joinRoom', { tripId });
    });

    socket.on('receiveMessage', (message: ChatMessage) => {
      setMessages((prev) => {
        // Prevent duplicate appending
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
    });

    socket.on('error', (errData: { message: string }) => {
      toast.error(errData.message || 'Chat connection error');
    });

    socket.on('disconnect', (reason) => {
      console.log('⚡ Socket disconnected:', reason);
    });

    // Cleanup: disconnect and leave room on trip change or unmount
    return () => {
      console.log('⚡ Disconnecting socket and leaving room for trip:', tripId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [tripId, token]);

  // Send message callback
  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current || !socketRef.current.connected) {
      toast.error('Not connected to chat server');
      return;
    }

    if (!content.trim()) return;

    if (content.length > 2000) {
      toast.error('Message is too long (max 2000 characters)');
      return;
    }

    socketRef.current.emit('sendMessage', {
      tripId,
      content: content.trim(),
    });
  }, [tripId]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    isConnected: socketRef.current?.connected || false,
  };
};

export default useChat;
