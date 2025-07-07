'use client';

import { DemoModeToggle, DemoDataGenerator, DemoWatermark } from '@/components/demo';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DemoSettingsPage() {
  return (
    <div className="min-h-screen bg-background-primary">
      <DemoWatermark />
      
      {/* Header */}
      <header className="border-b border-border-default bg-background-secondary/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="p-2 rounded-lg bg-background-elevated hover:bg-background-tertiary transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-text-primary" />
              </Link>
              <h1 className="text-xl font-semibold text-text-primary">Demo Settings</h1>
            </div>
            <DemoModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Demo Info */}
          <div className="bg-background-secondary rounded-xl p-6 border border-border-default">
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              Demo Mode Overview
            </h2>
            <p className="text-text-secondary mb-6">
              Demo mode allows you to explore RoR Trader with realistic simulated data. 
              Perfect for presentations, testing strategies, or learning the platform.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-background-tertiary rounded-lg p-4">
                <div className="text-accent-primary text-3xl mb-2">🤖</div>
                <h3 className="font-semibold text-text-primary mb-1">5 Demo Bots</h3>
                <p className="text-sm text-text-secondary">
                  Pre-configured with different strategies
                </p>
              </div>
              <div className="bg-background-tertiary rounded-lg p-4">
                <div className="text-accent-secondary text-3xl mb-2">📊</div>
                <h3 className="font-semibold text-text-primary mb-1">Live Simulation</h3>
                <p className="text-sm text-text-secondary">
                  Real-time webhook and trade simulation
                </p>
              </div>
              <div className="bg-background-tertiary rounded-lg p-4">
                <div className="text-accent-warning text-3xl mb-2">📈</div>
                <h3 className="font-semibold text-text-primary mb-1">Performance Data</h3>
                <p className="text-sm text-text-secondary">
                  Historical metrics and analytics
                </p>
              </div>
            </div>
          </div>

          {/* Demo Data Generator */}
          <DemoDataGenerator />

          {/* Quick Actions */}
          <div className="bg-background-secondary rounded-xl p-6 border border-border-default">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/demo"
                className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-background-primary font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                View Presentation Deck
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center justify-center px-4 py-3 bg-background-elevated border border-border-default text-text-primary font-semibold rounded-lg hover:border-accent-primary transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>

          {/* Demo Features */}
          <div className="bg-background-secondary rounded-xl p-6 border border-border-default">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Demo Features
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-accent-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-accent-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">Automated Webhook Simulation</h4>
                  <p className="text-sm text-text-secondary">
                    Webhooks are automatically generated every 30 seconds to show live activity
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-accent-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-accent-secondary" />
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">Realistic Trading Patterns</h4>
                  <p className="text-sm text-text-secondary">
                    Bots follow realistic trading patterns with varying win rates and frequencies
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-accent-warning/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-accent-warning" />
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">Performance Scenarios</h4>
                  <p className="text-sm text-text-secondary">
                    Generate winning, volatile, or steady performance patterns on demand
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-accent-purple/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-accent-purple" />
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">Paper Trading Only</h4>
                  <p className="text-sm text-text-secondary">
                    All demo bots use paper trading mode for safe demonstration
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
