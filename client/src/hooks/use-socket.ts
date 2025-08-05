import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { Message, User } from "@shared/schema";

interface SocketState {
  socket: Socket | null;
  connected: boolean;
  error: string | null;
}

interface UseSocketReturn extends SocketState {
  joinChat: (username: string) => void;
  sendMessage: (content: string) => void;
  startTyping: () => void;
  stopTyping: () => void;
  clearMessages: () => void;
}

export function useSocket(): UseSocketReturn {
  const [state, setState] = useState<SocketState>({
    socket: null,
    connected: false,
    error: null,
  });

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io({
      autoConnect: false,
    });

    socketRef.current = socket;
    setState(prev => ({ ...prev, socket }));

    socket.on("connect", () => {
      setState(prev => ({ ...prev, connected: true, error: null }));
    });

    socket.on("disconnect", () => {
      setState(prev => ({ ...prev, connected: false }));
    });

    socket.on("connect_error", (error) => {
      setState(prev => ({ ...prev, error: error.message, connected: false }));
    });

    socket.on("error", (data) => {
      setState(prev => ({ ...prev, error: data.message }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinChat = (username: string) => {
    if (socketRef.current) {
      socketRef.current.connect();
      socketRef.current.emit("join", { username });
    }
  };

  const sendMessage = (content: string) => {
    if (socketRef.current && state.connected) {
      socketRef.current.emit("send_message", { content });
    }
  };

  const startTyping = () => {
    if (socketRef.current && state.connected) {
      socketRef.current.emit("typing_start");
    }
  };

  const stopTyping = () => {
    if (socketRef.current && state.connected) {
      socketRef.current.emit("typing_stop");
    }
  };

  const clearMessages = () => {
    if (socketRef.current && state.connected) {
      socketRef.current.emit("clear_messages");
    }
  };

  return {
    ...state,
    joinChat,
    sendMessage,
    startTyping,
    stopTyping,
    clearMessages,
  };
}
