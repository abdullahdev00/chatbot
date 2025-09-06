import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PlayIcon, PauseIcon } from "lucide-react";

interface AudioMessageProps {
  audioUrl: string;
  duration: string;
  isUserMessage: boolean;
}

export default function AudioMessage({ audioUrl, duration, isUserMessage }: AudioMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Generate waveform bars based on audio duration
  const generateWaveform = () => {
    const bars = [];
    const barCount = 8;
    for (let i = 0; i < barCount; i++) {
      const height = Math.random() * 60 + 20; // Random height between 20% and 80%
      bars.push(
        <div
          key={i}
          className="waveform-bar"
          style={{ height: `${height}%` }}
        />
      );
    }
    return bars;
  };

  return (
    <div className="flex items-center space-x-3" data-testid="audio-message">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="metadata"
      />
      
      <Button
        variant="ghost"
        size="icon"
        className={`w-8 h-8 rounded-full flex items-center justify-center touch-target ${
          isUserMessage ? 'bg-white/20' : 'bg-primary/20'
        }`}
        onClick={togglePlayback}
        data-testid="button-play-audio"
      >
        {isPlaying ? (
          <PauseIcon className="w-4 h-4" />
        ) : (
          <PlayIcon className="w-4 h-4" />
        )}
      </Button>
      
      <div className="waveform flex-1" data-testid="audio-waveform">
        {generateWaveform()}
      </div>
      
      <span className="text-xs" data-testid="audio-duration">
        {duration}
      </span>
    </div>
  );
}
