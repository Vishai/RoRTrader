'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { 
  LineChart, 
  Shield, 
  Zap, 
  BarChart3, 
  ArrowRight,
  Github,
  Twitter,
  CheckCircle
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Lightning Fast Execution',
      description: 'Webhook to trade execution in under 2 seconds',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Bank-Grade Security',
      description: 'Encrypted API keys, mandatory 2FA, SOC2 compliant',
    },
    {
      icon: <LineChart className="h-6 w-6" />,
      title: 'Multi-Asset Trading',
      description: 'Trade crypto and stocks from one unified platform',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Advanced Analytics',
      description: 'Professional metrics including Sharpe ratio and drawdown',
    },
  ];

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 via-transparent to-accent-secondary/10 opacity-50"></div>
        
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                Automate Your Trading
              </span>
              <br />
              <span className="text-text-primary">With Confidence</span>
            </h1>
            
            <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
              Connect your TradingView strategies to real markets. Execute trades across crypto and stocks with enterprise-grade security.
            </p>
            
            <div className="flex items-center justify-center gap-4 mb-12">
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  console.log('Navigating to dashboard...');
                  router.push('/dashboard');
                }}
              >
                View Demo Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-8 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-accent-secondary" />
                <span>Free tier available</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-accent-secondary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-accent-secondary" />
                <span>2-minute setup</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-background-secondary/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Everything You Need to Trade Smarter
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Professional-grade tools that make algorithmic trading accessible to everyone
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-background-tertiary rounded-2xl border border-border-default hover:border-accent-primary/50 transition-all hover:shadow-lg hover:shadow-accent-primary/10"
              >
                <div className="p-3 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 rounded-xl w-fit mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-secondary">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Ready to Start Trading?
            </h2>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
              Join thousands of traders who've automated their strategies with RoR Trader
            </p>
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => router.push('/dashboard')}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border-default">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                RoR Trader
              </span>
              <span className="text-text-tertiary">© 2025</span>
            </div>
            
            <div className="flex items-center gap-6">
              <a href="#" className="text-text-secondary hover:text-text-primary transition-colors">
                Documentation
              </a>
              <a href="#" className="text-text-secondary hover:text-text-primary transition-colors">
                API
              </a>
              <a href="#" className="text-text-secondary hover:text-text-primary transition-colors">
                Support
              </a>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Github className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
