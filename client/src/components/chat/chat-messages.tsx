import { useEffect, useRef } from "react";
import { Message } from "@shared/schema";
import AudioMessage from "./audio-message";

interface ChatMessagesProps {
  messages: Message[];
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (messages.length === 0) {
    return (
      <main className="flex-1 overflow-y-auto p-4 bg-muted/30 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 2v6h-.5C4.01 8 3 9.01 3 10.5v8C3 19.88 4.12 21 5.5 21h13c1.38 0 2.5-1.12 2.5-2.5v-8C21 9.01 19.99 8 18.5 8H18V2h-2v6H8V2H6zm2 8v2h8v-2H8z"/>
            </svg>
          </div>
          <p className="text-sm">Start a conversation with Dr. MediBot</p>
          <p className="text-xs mt-1">Ask about medicines, prescriptions, or medical advice</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30" data-testid="chat-messages">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex items-start space-x-3 slide-up ${
            message.sender === 'user' ? 'justify-end' : ''
          }`}
          data-testid={`message-${message.id}`}
        >
          {message.sender === 'agent' && (
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 2v6h-.5C4.01 8 3 9.01 3 10.5v8C3 19.88 4.12 21 5.5 21h13c1.38 0 2.5-1.12 2.5-2.5v-8C21 9.01 19.99 8 18.5 8H18V2h-2v6H8V2H6zm2 8v2h8v-2H8z"/>
              </svg>
            </div>
          )}
          
          <div className={`p-3 max-w-[80%] shadow-sm ${
            message.sender === 'user' 
              ? 'chat-bubble-user text-white' 
              : 'chat-bubble-agent'
          }`}>
            {message.messageType === 'audio' && message.audioUrl ? (
              <AudioMessage 
                audioUrl={message.audioUrl} 
                duration={message.audioDuration || '0:00'}
                isUserMessage={message.sender === 'user'}
              />
            ) : (
              <p className={`text-sm ${
                message.sender === 'user' ? 'text-white' : 'text-foreground'
              }`} data-testid={`message-content-${message.id}`}>
                {message.content}
              </p>
            )}
            <span className={`text-xs mt-2 block ${
              message.sender === 'user' ? 'text-white/80' : 'text-muted-foreground'
            }`} data-testid={`message-time-${message.id}`}>
              {formatTime(message.timestamp)}
            </span>
          </div>

          {message.sender === 'user' && (
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </main>
  );
}
