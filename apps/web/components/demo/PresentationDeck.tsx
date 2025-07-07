'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface Slide {
  title: string;
  content: React.ReactNode;
  background?: string;
}

export function PresentationDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [presentationData, setPresentationData] = useState<any>(null);

  useEffect(() => {
    fetchPresentationData();
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        nextSlide();
      }, 8000); // 8 seconds per slide

      return () => clearTimeout(timer);
    }
  }, [currentSlide, isPlaying]);

  const fetchPresentationData = async () => {
    try {
      const response = await fetch('/api/demo/presentation', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setPresentationData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch presentation data:', error);
    }
  };

  const slides: Slide[] = [
    {
      title: 'Welcome to RoR Trader',
      content: (
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
            RoR Trader
          </h1>
          <p className="text-2xl text-text-secondary">
            The Future of Automated Trading
          </p>
          <div className="flex justify-center space-x-8 pt-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-accent-primary">
                {presentationData?.overview.totalBots || '5'}
              </div>
              <div className="text-text-secondary">Active Bots</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent-secondary">
                {presentationData?.overview.totalTrades || '1,234'}
              </div>
              <div className="text-text-secondary">Total Trades</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent-warning">
                {presentationData?.overview.totalReturn || '+42.5%'}
              </div>
              <div className="text-text-secondary">Total Return</div>
            </div>
          </div>
        </div>
      ),
      background: 'radial-gradient(circle at 50% 50%, rgba(0, 212, 255, 0.1) 0%, transparent 50%)'
    },
    {
      title: 'Problem We Solve',
      content: (
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-text-primary mb-8">
            Traditional Trading Challenges
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-background-tertiary p-6 rounded-xl border border-accent-danger/20">
              <h3 className="text-xl font-semibold text-accent-danger mb-3">
                ❌ Manual Execution
              </h3>
              <p className="text-text-secondary">
                Missed opportunities, emotional decisions, and human delays
              </p>
            </div>
            <div className="bg-background-tertiary p-6 rounded-xl border border-accent-danger/20">
              <h3 className="text-xl font-semibold text-accent-danger mb-3">
                ❌ Complex Setup
              </h3>
              <p className="text-text-secondary">
                Requires programming knowledge and technical expertise
              </p>
            </div>
            <div className="bg-background-tertiary p-6 rounded-xl border border-accent-danger/20">
              <h3 className="text-xl font-semibold text-accent-danger mb-3">
                ❌ Security Risks
              </h3>
              <p className="text-text-secondary">
                Poor API key management and vulnerable systems
              </p>
            </div>
            <div className="bg-background-tertiary p-6 rounded-xl border border-accent-danger/20">
              <h3 className="text-xl font-semibold text-accent-danger mb-3">
                ❌ Limited Integration
              </h3>
              <p className="text-text-secondary">
                Single exchange focus, no unified platform
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Our Solution',
      content: (
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-text-primary mb-8">
            RoR Trader Features
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 p-6 rounded-xl border border-accent-primary/30">
              <h3 className="text-xl font-semibold text-accent-primary mb-3">
                ✓ Automated Execution
              </h3>
              <p className="text-text-secondary">
                Sub-second webhook processing with 99.9% reliability
              </p>
            </div>
            <div className="bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 p-6 rounded-xl border border-accent-primary/30">
              <h3 className="text-xl font-semibold text-accent-primary mb-3">
                ✓ No Coding Required
              </h3>
              <p className="text-text-secondary">
                Simple bot creation with intuitive interface
              </p>
            </div>
            <div className="bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 p-6 rounded-xl border border-accent-primary/30">
              <h3 className="text-xl font-semibold text-accent-primary mb-3">
                ✓ Bank-Grade Security
              </h3>
              <p className="text-text-secondary">
                2FA, encrypted API keys, and SOC2 compliance
              </p>
            </div>
            <div className="bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 p-6 rounded-xl border border-accent-primary/30">
              <h3 className="text-xl font-semibold text-accent-primary mb-3">
                ✓ Multi-Platform
              </h3>
              <p className="text-text-secondary">
                Trade crypto and stocks from one unified platform
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Live Performance',
      content: (
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-text-primary mb-8">
            Real-Time Bot Performance
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {presentationData?.bots.slice(0, 6).map((bot: any, index: number) => (
              <div
                key={bot.id}
                className="bg-background-tertiary p-4 rounded-xl border border-border-default hover:border-accent-primary transition-all transform hover:scale-105"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-text-primary">{bot.name}</h3>
                  <div className={`w-2 h-2 rounded-full ${
                    bot.status === 'active' ? 'bg-accent-secondary animate-pulse' : 'bg-text-tertiary'
                  }`} />
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Trades:</span>
                    <span className="text-accent-primary font-mono">{bot.tradeCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Webhooks:</span>
                    <span className="text-accent-secondary font-mono">{bot.webhookCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 p-6 rounded-xl">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-accent-primary">
                  {presentationData?.overview.avgSharpeRatio || '2.1'}
                </div>
                <div className="text-sm text-text-secondary">Avg Sharpe Ratio</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent-secondary">
                  &lt;500ms
                </div>
                <div className="text-sm text-text-secondary">Webhook Latency</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent-warning">
                  99.9%
                </div>
                <div className="text-sm text-text-secondary">Uptime</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent-purple">
                  {presentationData?.overview.totalWebhooks || '10k+'}
                </div>
                <div className="text-sm text-text-secondary">Webhooks/Day</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Market Opportunity',
      content: (
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-text-primary mb-8">
            Massive Market Potential
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-accent-primary">
                Target Market
              </h3>
              <div className="space-y-3">
                <div className="bg-background-tertiary p-4 rounded-lg">
                  <div className="text-3xl font-bold text-accent-secondary">500k+</div>
                  <div className="text-text-secondary">TradingView Active Users</div>
                </div>
                <div className="bg-background-tertiary p-4 rounded-lg">
                  <div className="text-3xl font-bold text-accent-warning">$2.5T</div>
                  <div className="text-text-secondary">Daily Crypto Volume</div>
                </div>
                <div className="bg-background-tertiary p-4 rounded-lg">
                  <div className="text-3xl font-bold text-accent-purple">70%</div>
                  <div className="text-text-secondary">Traders Want Automation</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-accent-primary">
                Revenue Projections
              </h3>
              <div className="bg-background-tertiary p-6 rounded-xl">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Month 3:</span>
                    <span className="text-xl font-bold text-accent-primary">$10k MRR</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Month 6:</span>
                    <span className="text-xl font-bold text-accent-secondary">$50k MRR</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Year 1:</span>
                    <span className="text-xl font-bold text-accent-warning">$200k MRR</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Year 2:</span>
                    <span className="text-xl font-bold text-accent-purple">$1M+ MRR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Call to Action',
      content: (
        <div className="text-center space-y-8">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
            Join the Trading Revolution
          </h2>
          <p className="text-2xl text-text-secondary max-w-3xl mx-auto">
            Be part of the platform that's democratizing algorithmic trading for everyone
          </p>
          <div className="flex justify-center space-x-6 pt-8">
            <button className="px-8 py-4 bg-gradient-to-r from-accent-primary to-accent-secondary text-background-primary font-bold text-lg rounded-xl hover:opacity-90 transition-opacity">
              Start Free Trial
            </button>
            <button className="px-8 py-4 bg-background-elevated border border-accent-primary text-accent-primary font-bold text-lg rounded-xl hover:bg-accent-primary/10 transition-colors">
              Schedule Demo
            </button>
          </div>
          <div className="pt-8">
            <p className="text-text-tertiary">
              Contact: invest@ror-trader.com | ror-trader.com
            </p>
          </div>
        </div>
      ),
      background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.1) 0%, transparent 50%)'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (!presentationData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading presentation...</p>
        </div>
      </div>
    );
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div className="fixed inset-0 bg-background-primary flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-background-secondary/50 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-text-primary">RoR Trader Presentation</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-secondary">Slide</span>
            <span className="text-sm font-mono text-accent-primary">
              {currentSlide + 1}/{slides.length}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={togglePlayPause}
            className="p-2 rounded-lg bg-background-elevated hover:bg-background-tertiary transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-text-primary" />
            ) : (
              <Play className="w-5 h-5 text-text-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Slide Content */}
      <div 
        className="flex-1 flex items-center justify-center p-8 relative overflow-hidden"
        style={{ background: currentSlideData.background || 'none' }}
      >
        <div className="max-w-6xl w-full animate-fadeIn">
          {currentSlideData.content}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-4 bg-background-secondary/50 backdrop-blur-sm">
        <button
          onClick={prevSlide}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-background-elevated hover:bg-background-tertiary transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-text-primary" />
          <span className="text-text-primary">Previous</span>
        </button>

        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-8 bg-accent-primary'
                  : 'bg-text-tertiary hover:bg-text-secondary'
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-background-elevated hover:bg-background-tertiary transition-colors"
        >
          <span className="text-text-primary">Next</span>
          <ChevronRight className="w-5 h-5 text-text-primary" />
        </button>
      </div>
    </div>
  );
}
