'use client';

import { useState } from 'react';
import { Button, Input, Card } from '@/components/ui';
import { ArrowLeft, ArrowRight, Shield, TrendingUp, AlertCircle, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateWebhookSecret } from '@/lib/mock/data';

type AssetType = 'crypto' | 'stocks';
type Exchange = 'coinbase_pro' | 'alpaca';
type TradingMode = 'paper' | 'live';
type PositionSizingType = 'fixed' | 'percentage';

interface BotFormData {
  name: string;
  description: string;
  assetType: AssetType;
  exchange: Exchange;
  tradingMode: TradingMode;
  positionSizing: {
    type: PositionSizingType;
    value: number;
  };
  riskManagement: {
    stopLoss?: number;
    takeProfit?: number;
    maxDailyLoss?: number;
    maxPositions?: number;
  };
}

export default function NewBotPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [webhookSecret] = useState(generateWebhookSecret());
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState<BotFormData>({
    name: '',
    description: '',
    assetType: 'crypto',
    exchange: 'coinbase_pro',
    tradingMode: 'paper',
    positionSizing: {
      type: 'fixed',
      value: 1000,
    },
    riskManagement: {
      stopLoss: 5,
      takeProfit: 10,
      maxDailyLoss: 500,
      maxPositions: 3,
    },
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // In a real app, this would submit to the API
    console.log('Creating bot:', { ...formData, webhookSecret });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Redirect to dashboard or bot detail page
    router.push('/dashboard');
  };

  const copyWebhookUrl = () => {
    const webhookUrl = `https://api.ror-trader.com/webhook/bot-new/${webhookSecret}`;
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateFormData = (updates: Partial<BotFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-background-primary p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link href="/dashboard" className="inline-flex items-center text-text-secondary hover:text-text-primary mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        
        <h1 className="text-3xl font-bold text-text-primary mb-2">Create New Bot</h1>
        <p className="text-text-secondary">Set up your automated trading strategy in just a few steps</p>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-text-secondary">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Steps */}
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-text-primary mb-4">Basic Information</h2>
                <p className="text-text-secondary mb-6">Let's start with the basics of your trading bot</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Bot Name <span className="text-accent-danger">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  placeholder="e.g., BTC Scalper Pro"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  placeholder="Describe your trading strategy..."
                  className="w-full px-4 py-3 bg-background-primary border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Asset Type <span className="text-accent-danger">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => updateFormData({ assetType: 'crypto' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.assetType === 'crypto' 
                        ? 'border-accent-primary bg-accent-primary/10' 
                        : 'border-border hover:border-border-hover'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-semibold text-text-primary mb-1">Cryptocurrency</div>
                      <div className="text-sm text-text-secondary">Trade BTC, ETH, and more</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => updateFormData({ assetType: 'stocks' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.assetType === 'stocks' 
                        ? 'border-accent-primary bg-accent-primary/10' 
                        : 'border-border hover:border-border-hover'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-semibold text-text-primary mb-1">Stocks</div>
                      <div className="text-sm text-text-secondary">Trade US equities</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Exchange & Mode */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-text-primary mb-4">Exchange & Trading Mode</h2>
                <p className="text-text-secondary mb-6">Choose where and how your bot will trade</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Exchange <span className="text-accent-danger">*</span>
                </label>
                <select
                  value={formData.exchange}
                  onChange={(e) => updateFormData({ exchange: e.target.value as Exchange })}
                  className="w-full px-4 py-3 bg-background-primary border border-border rounded-lg text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                >
                  {formData.assetType === 'crypto' ? (
                    <option value="coinbase_pro">Coinbase Pro</option>
                  ) : (
                    <option value="alpaca">Alpaca</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-4">
                  Trading Mode <span className="text-accent-danger">*</span>
                </label>
                <div className="space-y-4">
                  <button
                    onClick={() => updateFormData({ tradingMode: 'paper' })}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      formData.tradingMode === 'paper' 
                        ? 'border-accent-primary bg-accent-primary/10' 
                        : 'border-border hover:border-border-hover'
                    }`}
                  >
                    <div className="flex items-start">
                      <Shield className="w-5 h-5 text-accent-secondary mt-0.5 mr-3" />
                      <div>
                        <div className="font-semibold text-text-primary mb-1">Paper Trading</div>
                        <div className="text-sm text-text-secondary">Test your strategy with simulated money (Recommended)</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => updateFormData({ tradingMode: 'live' })}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      formData.tradingMode === 'live' 
                        ? 'border-accent-danger bg-accent-danger/10' 
                        : 'border-border hover:border-border-hover'
                    }`}
                  >
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-accent-warning mt-0.5 mr-3" />
                      <div>
                        <div className="font-semibold text-text-primary mb-1">Live Trading</div>
                        <div className="text-sm text-text-secondary">Trade with real money (Use with caution)</div>
                      </div>
                    </div>
                  </button>
                </div>

                {formData.tradingMode === 'live' && (
                  <div className="mt-4 p-4 bg-accent-danger/10 border border-accent-danger/20 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-accent-danger mt-0.5 mr-3 flex-shrink-0" />
                      <div className="text-sm text-text-primary">
                        <strong>Warning:</strong> Live trading uses real money and can result in financial losses. 
                        Make sure you've thoroughly tested your strategy in paper mode first.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Position Sizing & Risk Management */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-text-primary mb-4">Position Sizing & Risk Management</h2>
                <p className="text-text-secondary mb-6">Define how your bot manages positions and risk</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-4">Position Sizing</label>
                <div className="space-y-4">
                  <select
                    value={formData.positionSizing.type}
                    onChange={(e) => updateFormData({ 
                      positionSizing: { ...formData.positionSizing, type: e.target.value as PositionSizingType }
                    })}
                    className="w-full px-4 py-3 bg-background-primary border border-border rounded-lg text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                  >
                    <option value="fixed">Fixed Amount</option>
                    <option value="percentage">Percentage of Portfolio</option>
                  </select>

                  <div className="flex items-center gap-2">
                    <span className="text-text-secondary">
                      {formData.positionSizing.type === 'fixed' ? '$' : ''}
                    </span>
                    <Input
                      type="number"
                      value={formData.positionSizing.value}
                      onChange={(e) => updateFormData({ 
                        positionSizing: { ...formData.positionSizing, value: parseFloat(e.target.value) || 0 }
                      })}
                      className="flex-1"
                    />
                    {formData.positionSizing.type === 'percentage' && (
                      <span className="text-text-secondary">%</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-4">Risk Management (Optional)</label>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-text-secondary mb-2">Stop Loss %</label>
                      <Input
                        type="number"
                        value={formData.riskManagement.stopLoss || ''}
                        onChange={(e) => updateFormData({ 
                          riskManagement: { ...formData.riskManagement, stopLoss: parseFloat(e.target.value) || undefined }
                        })}
                        placeholder="5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-text-secondary mb-2">Take Profit %</label>
                      <Input
                        type="number"
                        value={formData.riskManagement.takeProfit || ''}
                        onChange={(e) => updateFormData({ 
                          riskManagement: { ...formData.riskManagement, takeProfit: parseFloat(e.target.value) || undefined }
                        })}
                        placeholder="10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-text-secondary mb-2">Max Daily Loss $</label>
                      <Input
                        type="number"
                        value={formData.riskManagement.maxDailyLoss || ''}
                        onChange={(e) => updateFormData({ 
                          riskManagement: { ...formData.riskManagement, maxDailyLoss: parseFloat(e.target.value) || undefined }
                        })}
                        placeholder="500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-text-secondary mb-2">Max Open Positions</label>
                      <Input
                        type="number"
                        value={formData.riskManagement.maxPositions || ''}
                        onChange={(e) => updateFormData({ 
                          riskManagement: { ...formData.riskManagement, maxPositions: parseInt(e.target.value) || undefined }
                        })}
                        placeholder="3"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Webhook Configuration */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-text-primary mb-4">Webhook Configuration</h2>
                <p className="text-text-secondary mb-6">Connect your trading signals to this bot</p>
              </div>

              <div className="p-6 bg-background-primary rounded-lg border border-border">
                <div className="flex items-start mb-4">
                  <TrendingUp className="w-5 h-5 text-accent-primary mt-0.5 mr-3" />
                  <div>
                    <h3 className="font-semibold text-text-primary mb-1">Your Webhook URL</h3>
                    <p className="text-sm text-text-secondary">Use this URL in TradingView or your signal provider</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="p-4 bg-background-secondary rounded-lg font-mono text-sm text-text-primary break-all">
                    https://api.ror-trader.com/webhook/bot-new/{webhookSecret}
                  </div>
                  <button
                    onClick={copyWebhookUrl}
                    className="absolute top-2 right-2 p-2 bg-background-tertiary hover:bg-background-elevated rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-accent-secondary" />
                    ) : (
                      <Copy className="w-4 h-4 text-text-secondary" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-accent-primary/10 border border-accent-primary/20 rounded-lg">
                <h4 className="font-semibold text-text-primary mb-2">Webhook Payload Format</h4>
                <pre className="text-sm text-text-secondary overflow-x-auto">
{`{
  "action": "buy" | "sell" | "close",
  "symbol": "BTC-USD",
  "quantity": 0.001,
  "price": 50000,
  "stopLoss": 49000,
  "takeProfit": 52000
}`}
                </pre>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-text-primary">Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-text-secondary">Name:</span>
                    <span className="text-text-primary ml-2">{formData.name}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Type:</span>
                    <span className="text-text-primary ml-2 capitalize">{formData.assetType}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Exchange:</span>
                    <span className="text-text-primary ml-2">{formData.exchange.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Mode:</span>
                    <span className={`ml-2 capitalize ${formData.tradingMode === 'live' ? 'text-accent-danger' : 'text-accent-secondary'}`}>
                      {formData.tradingMode}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={currentStep === 1 && !formData.name}
                className="flex items-center"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="flex items-center bg-gradient-to-r from-accent-primary to-accent-secondary"
              >
                Create Bot
                <Check className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
