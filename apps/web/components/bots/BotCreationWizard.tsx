import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, 
  ChevronLeft, 
  Bot, 
  TrendingUp, 
  Shield, 
  Webhook,
  Check,
  AlertCircle,
  Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-hot-toast';
import { SymbolSelector } from './SymbolSelector';
import { IndicatorSelector, IndicatorConfig } from './IndicatorSelector';

interface BotFormData {
  // Basic Info
  name: string;
  description: string;
  
  // Trading Configuration
  symbol: string;
  assetType: 'crypto' | 'stocks';
  exchange: 'coinbase' | 'alpaca';
  timeframe: string;
  
  // Strategy & Indicators
  signalMode: 'ANY' | 'ALL' | 'MAJORITY';
  indicators: IndicatorConfig[];
  
  // Trading Settings
  tradingMode: 'paper' | 'live';
  positionSizing: {
    type: 'fixed' | 'percentage';
    value: number;
  };
  riskManagement: {
    stopLoss?: number;
    takeProfit?: number;
    maxDailyLoss?: number;
  };
}

const STEPS = [
  { id: 'basic', title: 'Basic Info', icon: Bot },
  { id: 'trading', title: 'Trading Setup', icon: TrendingUp },
  { id: 'indicators', title: 'Indicators', icon: TrendingUp },
  { id: 'risk', title: 'Risk Management', icon: Shield },
  { id: 'review', title: 'Review & Create', icon: Webhook },
];

const TIMEFRAMES = [
  { value: '1m', label: '1 minute' },
  { value: '5m', label: '5 minutes' },
  { value: '15m', label: '15 minutes' },
  { value: '30m', label: '30 minutes' },
  { value: '1h', label: '1 hour' },
  { value: '4h', label: '4 hours' },
  { value: '1d', label: '1 day' },
];

export function BotCreationWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [createdWebhookUrl, setCreatedWebhookUrl] = useState('');
  
  const [formData, setFormData] = useState<BotFormData>({
    name: '',
    description: '',
    symbol: '',
    assetType: 'crypto',
    exchange: 'coinbase',
    timeframe: '1h',
    signalMode: 'ALL',
    indicators: [],
    tradingMode: 'paper',
    positionSizing: {
      type: 'fixed',
      value: 100,
    },
    riskManagement: {
      stopLoss: 2,
      takeProfit: 5,
    },
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateBot = async () => {
    setIsCreating(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock webhook URL
      const mockWebhookUrl = `https://api.ror-trader.com/webhook/${Date.now()}/secret123`;
      setCreatedWebhookUrl(mockWebhookUrl);
      
      toast.success('Bot created successfully!');
      
      // Redirect to bot details page after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (error) {
      toast.error('Failed to create bot');
      setIsCreating(false);
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(createdWebhookUrl);
    toast.success('Webhook URL copied to clipboard');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Bot Name *</Label>
              <Input
                id="name"
                placeholder="My Trading Bot"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Choose a memorable name for your bot
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe your bot's strategy..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Add notes about your bot's strategy or purpose
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your bot will start in <strong>stopped</strong> status. You can activate it after configuration.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 1: // Trading Setup
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Asset Type</Label>
              <RadioGroup
                value={formData.assetType}
                onValueChange={(value: 'crypto' | 'stocks') => {
                  setFormData({ 
                    ...formData, 
                    assetType: value,
                    exchange: value === 'crypto' ? 'coinbase' : 'alpaca',
                    symbol: '' // Reset symbol when changing asset type
                  });
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="crypto" id="crypto" />
                  <Label htmlFor="crypto" className="cursor-pointer">
                    Cryptocurrency
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="stocks" id="stocks" />
                  <Label htmlFor="stocks" className="cursor-pointer">
                    Stocks
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Exchange</Label>
              <Select
                value={formData.exchange}
                onValueChange={(value: 'coinbase' | 'alpaca') => 
                  setFormData({ ...formData, exchange: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formData.assetType === 'crypto' ? (
                    <>
                      <SelectItem value="coinbase">Coinbase Pro</SelectItem>
                      <SelectItem value="binance" disabled>
                        Binance (Coming Soon)
                      </SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="alpaca">Alpaca</SelectItem>
                      <SelectItem value="interactive_brokers" disabled>
                        Interactive Brokers (Coming Soon)
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Trading Symbol (Optional for Testing)</Label>
              <div className="space-y-2">
                {/* Toggle between manual input and selector */}
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    id="use-selector"
                    className="h-4 w-4"
                    onChange={(e) => {
                      const useSelector = e.target.checked;
                      const selectorDiv = document.getElementById('symbol-selector-div');
                      const manualDiv = document.getElementById('symbol-manual-div');
                      if (selectorDiv && manualDiv) {
                        selectorDiv.style.display = useSelector ? 'block' : 'none';
                        manualDiv.style.display = useSelector ? 'none' : 'block';
                      }
                    }}
                  />
                  <Label htmlFor="use-selector" className="text-sm cursor-pointer">
                    Use symbol selector (requires connection)
                  </Label>
                </div>
                
                {/* Symbol Selector - hidden by default */}
                <div id="symbol-selector-div" style={{ display: 'none' }}>
                  <SymbolSelector
                    value={formData.symbol}
                    onChange={(symbol) => setFormData({ ...formData, symbol })}
                    assetType={formData.assetType}
                    exchange={formData.exchange}
                    placeholder="Select a symbol to trade..."
                  />
                </div>
                
                {/* Manual Input for Testing - shown by default */}
                <div id="symbol-manual-div" className="space-y-2">
                  <Input
                    id="symbol-manual"
                    placeholder={formData.assetType === 'crypto' ? 'e.g., BTC-USD, ETH-USD' : 'e.g., AAPL, TSLA'}
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                  />
                  
                  {/* Quick select buttons */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-muted-foreground">Quick select:</span>
                    {formData.assetType === 'crypto' ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData({ ...formData, symbol: 'BTC-USD' })}
                        >
                          BTC-USD
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData({ ...formData, symbol: 'ETH-USD' })}
                        >
                          ETH-USD
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData({ ...formData, symbol: 'SOL-USD' })}
                        >
                          SOL-USD
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData({ ...formData, symbol: 'AAPL' })}
                        >
                          AAPL
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData({ ...formData, symbol: 'TSLA' })}
                        >
                          TSLA
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData({ ...formData, symbol: 'NVDA' })}
                        >
                          NVDA
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Enter the trading symbol manually. For crypto use format like BTC-USD, for stocks use ticker like AAPL.
                  Leave empty for testing without a specific symbol.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Timeframe</Label>
              <Select
                value={formData.timeframe}
                onValueChange={(value) => setFormData({ ...formData, timeframe: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEFRAMES.map((tf) => (
                    <SelectItem key={tf.value} value={tf.value}>
                      {tf.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Timeframe for indicator calculations
              </p>
            </div>
          </div>
        );

      case 2: // Indicators
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Signal Mode</Label>
              <RadioGroup
                value={formData.signalMode}
                onValueChange={(value: 'ANY' | 'ALL' | 'MAJORITY') => 
                  setFormData({ ...formData, signalMode: value })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ALL" id="all" />
                  <Label htmlFor="all" className="cursor-pointer">
                    All indicators must agree (Conservative)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MAJORITY" id="majority" />
                  <Label htmlFor="majority" className="cursor-pointer">
                    Majority of indicators (Balanced)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ANY" id="any" />
                  <Label htmlFor="any" className="cursor-pointer">
                    Any indicator signals (Aggressive)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <IndicatorSelector
              indicators={formData.indicators}
              onChange={(indicators) => setFormData({ ...formData, indicators })}
              maxIndicators={5}
            />
          </div>
        );

      case 3: // Risk Management
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Trading Mode</Label>
              <RadioGroup
                value={formData.tradingMode}
                onValueChange={(value: 'paper' | 'live') => 
                  setFormData({ ...formData, tradingMode: value })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paper" id="paper" />
                  <Label htmlFor="paper" className="cursor-pointer">
                    Paper Trading (Simulated)
                    <Badge variant="secondary" className="ml-2">Recommended</Badge>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="live" id="live" />
                  <Label htmlFor="live" className="cursor-pointer">
                    Live Trading (Real Money)
                    <Badge variant="destructive" className="ml-2">Use Caution</Badge>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Position Sizing</h4>
              
              <div className="space-y-2">
                <Label>Type</Label>
                <RadioGroup
                  value={formData.positionSizing.type}
                  onValueChange={(value: 'fixed' | 'percentage') => 
                    setFormData({ 
                      ...formData, 
                      positionSizing: { ...formData.positionSizing, type: value }
                    })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed" className="cursor-pointer">
                      Fixed Amount
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id="percentage" />
                    <Label htmlFor="percentage" className="cursor-pointer">
                      Percentage of Portfolio
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>
                  {formData.positionSizing.type === 'fixed' ? 'Amount ($)' : 'Percentage (%)'}
                </Label>
                <Input
                  type="number"
                  value={formData.positionSizing.value}
                  onChange={(e) => 
                    setFormData({
                      ...formData,
                      positionSizing: {
                        ...formData.positionSizing,
                        value: parseFloat(e.target.value) || 0
                      }
                    })
                  }
                  min="0"
                  step={formData.positionSizing.type === 'fixed' ? '10' : '1'}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Risk Limits (Optional)</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stop Loss (%)</Label>
                  <Input
                    type="number"
                    value={formData.riskManagement.stopLoss || ''}
                    onChange={(e) => 
                      setFormData({
                        ...formData,
                        riskManagement: {
                          ...formData.riskManagement,
                          stopLoss: parseFloat(e.target.value) || undefined
                        }
                      })
                    }
                    placeholder="e.g., 2"
                    min="0"
                    max="100"
                    step="0.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Take Profit (%)</Label>
                  <Input
                    type="number"
                    value={formData.riskManagement.takeProfit || ''}
                    onChange={(e) => 
                      setFormData({
                        ...formData,
                        riskManagement: {
                          ...formData.riskManagement,
                          takeProfit: parseFloat(e.target.value) || undefined
                        }
                      })
                    }
                    placeholder="e.g., 5"
                    min="0"
                    max="1000"
                    step="0.5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Max Daily Loss ($)</Label>
                <Input
                  type="number"
                  value={formData.riskManagement.maxDailyLoss || ''}
                  onChange={(e) => 
                    setFormData({
                      ...formData,
                      riskManagement: {
                        ...formData.riskManagement,
                        maxDailyLoss: parseFloat(e.target.value) || undefined
                      }
                    })
                  }
                  placeholder="e.g., 500"
                  min="0"
                  step="50"
                />
                <p className="text-xs text-muted-foreground">
                  Bot will stop trading if daily loss exceeds this amount
                </p>
              </div>
            </div>
          </div>
        );

      case 4: // Review & Create
        return (
          <div className="space-y-6">
            {!createdWebhookUrl ? (
              <>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please review your bot configuration before creating. You can modify settings after creation.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium mb-3">Basic Information</h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Name:</dt>
                        <dd className="font-medium">{formData.name || 'Not set'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Description:</dt>
                        <dd className="font-medium">{formData.description || 'Not set'}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium mb-3">Trading Configuration</h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Symbol:</dt>
                        <dd className="font-medium">{formData.symbol || 'Not set'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Exchange:</dt>
                        <dd className="font-medium">{formData.exchange.replace('_', ' ')}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Timeframe:</dt>
                        <dd className="font-medium">{formData.timeframe}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Trading Mode:</dt>
                        <dd>
                          <Badge variant={formData.tradingMode === 'paper' ? 'secondary' : 'destructive'}>
                            {formData.tradingMode}
                          </Badge>
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium mb-3">Strategy & Indicators</h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Signal Mode:</dt>
                        <dd className="font-medium">{formData.signalMode}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Indicators:</dt>
                        <dd className="font-medium">
                          {formData.indicators.length} configured
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium mb-3">Risk Management</h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Position Size:</dt>
                        <dd className="font-medium">
                          {formData.positionSizing.type === 'fixed' 
                            ? `$${formData.positionSizing.value}`
                            : `${formData.positionSizing.value}%`
                          }
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Stop Loss:</dt>
                        <dd className="font-medium">
                          {formData.riskManagement.stopLoss 
                            ? `${formData.riskManagement.stopLoss}%`
                            : 'Not set'
                          }
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Take Profit:</dt>
                        <dd className="font-medium">
                          {formData.riskManagement.takeProfit 
                            ? `${formData.riskManagement.takeProfit}%`
                            : 'Not set'
                          }
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Bot Created Successfully!</h3>
                  <p className="text-muted-foreground">
                    Your bot has been created and is ready to receive webhook signals.
                  </p>
                </div>

                <div className="rounded-lg border p-4 space-y-3">
                  <h4 className="font-medium">Webhook URL</h4>
                  <div className="flex items-center gap-2">
                    <Input
                      value={createdWebhookUrl}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyWebhookUrl}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use this URL in TradingView alerts or other webhook sources
                  </p>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> Your bot is created but <strong>stopped</strong>. 
                    Navigate to the dashboard to activate it when you're ready to start trading.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        );
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.name.trim().length > 0;
      case 1:
        // Allow bypassing symbol validation for testing
        return true; // Symbol is now optional for testing
      case 2:
        return true; // Indicators are optional
      case 3:
        return formData.positionSizing.value > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    isActive && "bg-primary text-primary-foreground",
                    isCompleted && "bg-primary/20 text-primary",
                    !isActive && !isCompleted && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span className={cn(
                  "text-sm mt-2",
                  isActive && "font-medium",
                  !isActive && "text-muted-foreground"
                )}>
                  {step.title}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-4 mt-5",
                  index < currentStep ? "bg-primary" : "bg-muted"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep].title}</CardTitle>
          <CardDescription>
            {currentStep === 0 && "Give your bot a name and description"}
            {currentStep === 1 && "Configure what and where your bot will trade"}
            {currentStep === 2 && "Set up technical indicators for trading signals"}
            {currentStep === 3 && "Define position sizing and risk parameters"}
            {currentStep === 4 && "Review your configuration and create the bot"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleCreateBot}
              disabled={!isStepValid() || isCreating || !!createdWebhookUrl}
            >
              {isCreating ? "Creating..." : "Create Bot"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
