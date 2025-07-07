import React from 'react';
import { Badge } from './Badge';
import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';

export interface WebhookStatusProps {
  status: 'healthy' | 'degraded' | 'error' | 'pending';
  lastPing?: Date;
  successRate?: number;
  className?: string;
}

export const WebhookStatus: React.FC<WebhookStatusProps> = ({
  status,
  lastPing,
  successRate,
  className = ''
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4" />;
      case 'degraded':
        return <AlertCircle className="w-4 h-4" />;
      case 'error':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'healthy':
        return 'bg-accent-secondary/20 text-accent-secondary border-accent-secondary/20';
      case 'degraded':
        return 'bg-accent-warning/20 text-accent-warning border-accent-warning/20';
      case 'error':
        return 'bg-accent-danger/20 text-accent-danger border-accent-danger/20';
      case 'pending':
        return 'bg-text-tertiary/20 text-text-tertiary border-text-tertiary/20';
    }
  };

  const formatLastPing = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <Badge className={`${getStatusColor()} flex items-center gap-1.5`}>
        {getStatusIcon()}
        <span className="capitalize">{status}</span>
      </Badge>
      
      {lastPing && (
        <span className="text-sm text-text-secondary">
          Last ping: {formatLastPing(lastPing)}
        </span>
      )}
      
      {successRate !== undefined && (
        <span className="text-sm text-text-secondary">
          Success: {successRate.toFixed(1)}%
        </span>
      )}
    </div>
  );
};
