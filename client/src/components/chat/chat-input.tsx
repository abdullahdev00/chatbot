import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaperclipIcon, SendIcon, MicIcon, SmileIcon } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onStartRecording: () => void;
  isRecording: boolean;
}

export default function ChatInput({ onSendMessage, onStartRecording, isRecording }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSendText = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const quickCategories = [
    "Antibiotics",
    "Pain Relief", 
    "Vitamins",
    "Prescription Info"
  ];

  const handleQuickSelect = (category: string) => {
    setMessage(`Tell me about ${category}`);
  };

  return (
    <footer className="bg-card border-t border-border p-4">
      <div className="flex items-end space-x-3">
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 bg-muted rounded-full touch-target"
          data-testid="button-attachment"
        >
          <PaperclipIcon className="w-5 h-5 text-muted-foreground" />
        </Button>
        
        <div className="flex-1 bg-input border border-border rounded-full px-4 py-2 flex items-center">
          <Input
            type="text"
            placeholder="Type your medical question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-transparent border-none outline-none text-sm focus-visible:ring-0"
            data-testid="input-message"
          />
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 w-6 h-6 text-muted-foreground touch-target"
            data-testid="button-emoji"
          >
            <SmileIcon className="w-5 h-5" />
          </Button>
        </div>
        
        <Button
          className={`w-12 h-12 bg-primary text-primary-foreground rounded-full touch-target shadow-lg transition-all duration-200 ${
            isRecording ? 'recording-pulse' : ''
          }`}
          onMouseDown={(e) => {
            e.preventDefault();
            const timer = setTimeout(() => {
              onStartRecording();
            }, 500);
            
            const handleMouseUp = () => {
              clearTimeout(timer);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mouseup', handleMouseUp);
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            const timer = setTimeout(() => {
              onStartRecording();
            }, 500);
            
            const handleTouchEnd = () => {
              clearTimeout(timer);
              document.removeEventListener('touchend', handleTouchEnd);
            };
            
            document.addEventListener('touchend', handleTouchEnd);
          }}
          onClick={(e) => {
            e.preventDefault();
            if (!isRecording && message.trim()) {
              handleSendText();
            }
          }}
          data-testid="button-send-record"
        >
          {isRecording ? (
            <MicIcon className="w-6 h-6" />
          ) : (
            <SendIcon className="w-6 h-6" />
          )}
        </Button>
      </div>
      
      <div className="flex space-x-2 mt-3 overflow-x-auto pb-1">
        {quickCategories.map((category) => (
          <Button
            key={category}
            variant="ghost"
            size="sm"
            className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs whitespace-nowrap touch-target hover:bg-secondary/20"
            onClick={() => handleQuickSelect(category)}
            data-testid={`button-quick-${category.toLowerCase().replace(' ', '-')}`}
          >
            {category}
          </Button>
        ))}
      </div>
    </footer>
  );
}
