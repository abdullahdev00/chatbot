interface ChatHeaderProps {
  isConnected: boolean;
}

export default function ChatHeader({ isConnected }: ChatHeaderProps) {
  return (
    <header className="bg-primary text-primary-foreground p-4 flex items-center space-x-3 shadow-md">
      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 8h-2V6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H5a1 1 0 0 0 0 2h2v4H5a1 1 0 0 0 0 2h2v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2h2a1 1 0 0 0 0-2h-2v-4h2a1 1 0 0 0 0-2zM9 6h6v12H9V6z"/>
        </svg>
      </div>
      <div className="flex-1">
        <h1 className="font-semibold text-lg" data-testid="header-title">Dr. MediBot</h1>
        <p className="text-sm text-primary-foreground/80" data-testid="header-subtitle">Medicine Sales Agent</p>
      </div>
      <div className="flex items-center space-x-1">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-secondary pulse-dot' : 'bg-destructive'}`} data-testid="connection-status"></div>
        <span className="text-xs" data-testid="status-text">
          {isConnected ? 'Online' : 'Offline'}
        </span>
      </div>
    </header>
  );
}
