import { Button } from "@/components/ui/button";
import { MicIcon } from "lucide-react";

interface AudioRecordingOverlayProps {
  onStop: () => void;
  onCancel: () => void;
}

export default function AudioRecordingOverlay({ onStop, onCancel }: AudioRecordingOverlayProps) {
  // Generate animated waveform during recording
  const generateRecordingWaveform = () => {
    const bars = [];
    const barCount = 6;
    for (let i = 0; i < barCount; i++) {
      const height = Math.random() * 60 + 30;
      bars.push(
        <div
          key={i}
          className="waveform-bar recording-pulse"
          style={{ 
            height: `${height}%`,
            animationDelay: `${i * 0.1}s`
          }}
        />
      );
    }
    return bars;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-testid="recording-overlay">
      <div className="bg-card p-6 rounded-xl m-4 max-w-sm w-full text-center">
        <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center recording-pulse">
          <MicIcon className="w-10 h-10 text-white" />
        </div>
        
        <h3 className="font-semibold text-lg mb-2" data-testid="recording-title">Recording Audio</h3>
        <p className="text-muted-foreground text-sm mb-4" data-testid="recording-subtitle">
          Speak your message clearly
        </p>
        
        <div className="waveform justify-center mb-4" data-testid="recording-waveform">
          {generateRecordingWaveform()}
        </div>
        
        <div className="flex space-x-3 justify-center">
          <Button
            variant="destructive"
            className="px-4 py-2 rounded-full touch-target"
            onClick={onCancel}
            data-testid="button-cancel-recording"
          >
            Cancel
          </Button>
          <Button
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-full touch-target"
            onClick={onStop}
            data-testid="button-send-recording"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
