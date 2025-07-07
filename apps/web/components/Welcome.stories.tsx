import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card';
import { Badge } from './ui/Badge';
import { Stat } from './ui/Stat';
import { Input } from './ui/Input';

const meta = {
  title: 'Welcome',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComponentShowcase: Story = {
  render: () => (
    <div className="min-h-screen bg-[#0A0A0B] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-5xl font-bold">
            <span className="bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
              RoR Trader
            </span>
          </h1>
          <p className="text-xl text-gray-400">Component Library Showcase</p>
        </div>

        {/* Stats Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Stat
              label="Portfolio Value"
              value="$125,432.50"
              change="+15.3%"
              trend="up"
            />
            <Stat
              label="Today's P&L"
              value="+$2,345.67"
              change="+1.87%"
              trend="up"
            />
            <Stat
              label="Active Bots"
              value="5"
              subtext="2 paused"
            />
            <Stat
              label="Win Rate"
              value="73%"
              change="+5%"
              trend="up"
            />
          </div>
        </section>

        {/* Bot Cards */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Bot Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>BTC Scalper</CardTitle>
                    <CardDescription>Coinbase Pro • Live Trading</CardDescription>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Today's P&L</span>
                    <span className="text-green-400">+$523.12</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Trades</span>
                    <span>15</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm">Details</Button>
                <Button variant="outline" size="sm">Pause</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>ETH DCA Bot</CardTitle>
                    <CardDescription>Coinbase Pro • Paper Trading</CardDescription>
                  </div>
                  <Badge variant="warning">Paused</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total P&L</span>
                    <span className="text-green-400">+$1,234.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Trades</span>
                    <span>27</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm">Details</Button>
                <Button variant="primary" size="sm">Resume</Button>
              </CardFooter>
            </Card>

            <Card className="border-dashed border-gray-700 bg-transparent">
              <CardContent className="flex flex-col items-center justify-center h-full py-8">
                <div className="text-center space-y-4">
                  <div className="text-4xl text-gray-600">+</div>
                  <p className="text-gray-400">Create New Bot</p>
                  <Button variant="primary">Get Started</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Buttons</h2>
          <div className="flex gap-4 flex-wrap">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="glass">Glass</Button>
          </div>
        </section>

        {/* Badges */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Badges</h2>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="default">Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="purple">Premium</Badge>
          </div>
        </section>

        {/* Form Example */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Form Elements</h2>
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Create Bot</CardTitle>
              <CardDescription>Set up your automated trading bot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Bot Name</label>
                <Input placeholder="My Trading Bot" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">API Key</label>
                <Input type="password" placeholder="Enter your API key" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Cancel</Button>
              <Button variant="primary">Create Bot</Button>
            </CardFooter>
          </Card>
        </section>
      </div>
    </div>
  ),
};

export const Introduction: Story = {
  render: () => (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-8">
      <div className="max-w-4xl text-center space-y-8">
        <h1 className="text-6xl font-bold">
          <span className="bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
            RoR Trader UI Components
          </span>
        </h1>
        
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          A modern, dark-themed component library for building professional trading interfaces.
          Built with React, TypeScript, and Tailwind CSS.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto text-left">
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400">5</div>
            <div className="text-sm text-gray-400">Components</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">6</div>
            <div className="text-sm text-gray-400">Variants</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">Dark</div>
            <div className="text-sm text-gray-400">Theme</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-400">100%</div>
            <div className="text-sm text-gray-400">TypeScript</div>
          </div>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button variant="primary" size="lg">
            Browse Components
          </Button>
          <Button variant="glass" size="lg">
            View on GitHub
          </Button>
        </div>
      </div>
    </div>
  ),
};
