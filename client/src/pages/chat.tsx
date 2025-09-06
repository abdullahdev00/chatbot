import { useEffect } from "react";
import ChatHeader from "@/components/chat/chat-header";
import ChatMessages from "@/components/chat/chat-messages";
import ChatInput from "@/components/chat/chat-input";
import AudioRecordingOverlay from "@/components/chat/audio-recording-overlay";
import { useWebSocket } from "@/hooks/use-websocket";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";

export default function Chat() {
  const { messages, sendMessage, isConnected } = useWebSocket();
  const { 
    isRecording, 
    startRecording, 
    stopRecording, 
    cancelRecording,
    audioUrl,
    audioDuration 
  } = useAudioRecorder();

  const handleSendTextMessage = (content: string) => {
    sendMessage({
      content,
      sender: "user",
      messageType: "text",
    });
  };

  const handleSendAudioMessage = async () => {
    if (audioUrl && audioDuration) {
      sendMessage({
        content: "Audio message",
        sender: "user",
        messageType: "audio",
        audioUrl,
        audioDuration,
      });
    }
    stopRecording();
  };

  useEffect(() => {
    // Set document title for mobile
    document.title = "MediChat Agent - Healthcare Student Support";
    
    // Prevent zoom on input focus for mobile
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
  }, []);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-card shadow-xl relative">
      <ChatHeader isConnected={isConnected} />
      <ChatMessages messages={messages} />
      <ChatInput 
        onSendMessage={handleSendTextMessage}
        onStartRecording={startRecording}
        isRecording={isRecording}
      />
      
      {isRecording && (
        <AudioRecordingOverlay
          onStop={handleSendAudioMessage}
          onCancel={cancelRecording}
        />
      )}
    </div>
  );
}
