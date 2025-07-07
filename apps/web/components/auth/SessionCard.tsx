interface SessionInfo {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  createdAt: string;
  expiresAt: string;
  current: boolean;
}

interface SessionCardProps {
  session: SessionInfo;
  onRevoke?: (sessionId: string) => void;
  detailed?: boolean;
}

export default function SessionCard({ session, onRevoke, detailed = false }: SessionCardProps) {
  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('iphone') || device.toLowerCase().includes('android')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    if (device.toLowerCase().includes('ipad') || device.toLowerCase().includes('tablet')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  };

  const getActivityStatus = (lastActive: string) => {
    if (lastActive === 'Active now') {
      return (
        <span className="flex items-center gap-1 text-accent-secondary">
          <span className="w-2 h-2 bg-accent-secondary rounded-full animate-pulse" />
          Active now
        </span>
      );
    }
    return <span className="text-text-tertiary">{lastActive}</span>;
  };

  return (
    <div
      className={`p-4 rounded-xl transition-all ${
        session.current
          ? 'bg-accent-primary/10 border border-accent-primary/20'
          : 'bg-background-tertiary hover:bg-background-elevated'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${
            session.current ? 'bg-accent-primary/20' : 'bg-background-elevated'
          }`}>
            {getDeviceIcon(session.device)}
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-text-primary">
                {session.device}
              </h3>
              {session.current && (
                <span className="px-2 py-0.5 bg-accent-primary/20 text-accent-primary text-xs rounded-full">
                  This device
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-secondary">{session.browser}</span>
              <span className="text-text-tertiary">•</span>
              <span className="text-text-secondary">{session.location}</span>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <span className="text-text-tertiary">IP: {session.ipAddress}</span>
              <span className="text-text-tertiary">•</span>
              {getActivityStatus(session.lastActive)}
            </div>

            {detailed && (
              <div className="mt-2 pt-2 border-t border-border space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-text-tertiary">Session started:</span>
                  <span className="text-text-secondary">{session.createdAt}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-text-tertiary">Expires:</span>
                  <span className="text-text-secondary">{session.expiresAt}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {!session.current && onRevoke && (
          <button
            onClick={() => onRevoke(session.id)}
            className="px-3 py-1 text-sm text-accent-danger hover:bg-accent-danger/10 rounded-lg transition-colors"
          >
            Revoke
          </button>
        )}
      </div>
    </div>
  );
}

export function SessionList({ 
  sessions, 
  onRevoke, 
  detailed = false 
}: { 
  sessions: SessionInfo[]; 
  onRevoke?: (sessionId: string) => void;
  detailed?: boolean;
}) {
  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          onRevoke={onRevoke}
          detailed={detailed}
        />
      ))}
    </div>
  );
}
