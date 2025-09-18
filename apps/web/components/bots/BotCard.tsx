import React from 'react';
import { 
  Activity, 
  TrendingUp, 
  Pause, 
  Play, 
  Settings,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  XCircle,
  Copy,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'react-hot-toast';

interface BotIndicator {
  id: string;
  indicator: string;
  enabled: boolean;
}

interface BotCardProps {
  bot: {
    id: string;
    name: string;
    description?: string;
    symbol: string;
    exchange: string;
    assetType: 'crypto' | 'stocks';
    timeframe: string;
    status: 'active' | 'paused' | 'stopped';
    tradingMode: 'paper' | 'live';
    indicators: BotIndicator[];
    performance?: {
      totalTrades: number;
      winRate: number;
      totalReturn: number;
      isDemo?: boolean;
    };
    webhookUrl: string;
    createdAt: string;
  };
  onStatusChange?: (botId: string, status: 'active' | 'paused' | 'stopped') => void;
  onDelete?: (botId: string) => void;
  onClone?: (botId: string) => void;
  onClick?: () => void;
}

const STATUS_CONFIG = {
  active: {
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: Activity,
    label: 'Active',
  },
  paused: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: Pause,
    label: 'Paused',
  },
  stopped: {
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: XCircle,
    label: 'Stopped',
  },
};

export function BotCard({ bot, onStatusChange, onDelete, onClone, onClick }: BotCardProps) {
  const statusConfig = STATUS_CONFIG[bot.status];
  const StatusIcon = statusConfig.icon;
  const activeIndicators = bot.indicators.filter(ind => ind.enabled).length;

  const handleCopyWebhook = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(bot.webhookUrl);
    toast.success('Webhook URL copied to clipboard');
  };

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onStatusChange) return;

    const newStatus = bot.status === 'active' ? 'paused' : 'active';
    onStatusChange(bot.id, newStatus);
  };

  const getExchangeDisplay = (exchange: string) => {
    return exchange.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card 
      className={cn(
        "transition-all cursor-pointer hover:shadow-lg",
        bot.status === 'active' && "ring-1 ring-green-500/20"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {bot.name}
              {bot.performance?.isDemo && (
                <Badge variant="outline" className="text-xs">Demo</Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              {bot.description || `Trading ${bot.symbol} on ${getExchangeDisplay(bot.exchange)}`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    "px-2 py-1 rounded-full flex items-center gap-1.5 text-sm",
                    statusConfig.bgColor,
                    statusConfig.color
                  )}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    {statusConfig.label}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Bot is {statusConfig.label.toLowerCase()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCopyWebhook}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Webhook URL
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onClone?.(bot.id);
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clone Bot
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(bot.id);
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Bot
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Trading Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Symbol</p>
            <p className="font-medium flex items-center gap-2">
              {bot.symbol}
              <Badge variant="outline" className="text-xs">
                {bot.timeframe}
              </Badge>
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Mode</p>
            <p className="font-medium">
              <Badge variant={bot.tradingMode === 'paper' ? 'secondary' : 'destructive'}>
                {bot.tradingMode}
              </Badge>
            </p>
          </div>
        </div>

        {/* Indicators */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Indicators</p>
          <div className="flex items-center gap-2">
            {bot.indicators.length > 0 ? (
              <>
                <div className="flex -space-x-1">
                  {bot.indicators.slice(0, 3).map((indicator, i) => (
                    <div
                      key={indicator.id}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 border-background",
                        indicator.enabled 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground"
                      )}
                      style={{ zIndex: bot.indicators.length - i }}
                    >
                      {indicator.indicator.slice(0, 2).toUpperCase()}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {activeIndicators} of {bot.indicators.length} active
                  {bot.indicators.length > 3 && ` (+${bot.indicators.length - 3})`}
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">No indicators configured</span>
            )}
          </div>
        </div>

        {/* Performance */}
        {bot.performance && (
          <div className="pt-2 border-t">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Trades</p>
                <p className="font-medium">{bot.performance.totalTrades}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Win Rate</p>
                <p className="font-medium">{bot.performance.winRate.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Return</p>
                <p className={cn(
                  "font-medium",
                  bot.performance.totalReturn >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {bot.performance.totalReturn >= 0 ? "+" : ""}{bot.performance.totalReturn.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4">
        <div className="flex items-center justify-between w-full">
          <Button
            variant={bot.status === 'active' ? 'secondary' : 'default'}
            size="sm"
            onClick={handleStatusToggle}
            disabled={bot.status === 'stopped'}
          >
            {bot.status === 'active' ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start
              </>
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
