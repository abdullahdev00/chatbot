import { useState, useEffect, useCallback } from "react";
import { Message } from "@shared/schema";

interface WebSocketMessage {
  type: string;
  message?: Message;
  messages?: Message[];
}

interface SendMessageData {
  content: string;
  sender: string;
  messageType?: string;
  audioUrl?: string;
  audioDuration?: string;
}

export function useWebSocket() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Connected to chat server');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        
        if (data.type === 'initial_messages' && data.messages) {
          setMessages(data.messages);
        } else if (data.type === 'new_message' && data.message) {
          setMessages(prev => [...prev, data.message!]);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
      
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (!socket || socket.readyState === WebSocket.CLOSED) {
          connect();
        }
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    setSocket(ws);

    return ws;
  }, [socket]);

  useEffect(() => {
    const ws = connect();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const sendMessage = useCallback((messageData: SendMessageData) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'send_message',
        ...messageData
      }));
    } else {
      console.error('WebSocket is not connected');
    }
  }, [socket]);

  return {
    messages,
    sendMessage,
    isConnected
  };
}
