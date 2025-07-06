import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the card content. You can put any content here.</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm">Cancel</Button>
        <Button size="sm">Save</Button>
      </CardFooter>
    </Card>
  ),
};

export const BotCard: Story = {
  name: 'Bot Card Example',
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>BTC Scalper</CardTitle>
            <CardDescription>Coinbase Pro • Paper Trading</CardDescription>
          </div>
          <Badge variant="success">Active</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Today's P&L</span>
            <span className="text-green-400">+$523.12 (2.1%)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total Trades</span>
            <span>15</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Win Rate</span>
            <span>73%</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm">View Details</Button>
        <Button variant="outline" size="sm">Pause Bot</Button>
      </CardFooter>
    </Card>
  ),
};

export const SimpleCard: Story = {
  render: () => (
    <Card className="w-80">
      <CardContent className="pt-6">
        <p>A simple card with just content.</p>
      </CardContent>
    </Card>
  ),
};

export const GlassCard: Story = {
  render: () => (
    <Card className="w-96 bg-white/5 backdrop-blur-md border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Glass Effect Card</CardTitle>
        <CardDescription className="text-gray-300">
          Using glassmorphism design
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-200">
          This card demonstrates the glass morphism effect with backdrop blur.
        </p>
      </CardContent>
    </Card>
  ),
};

export const InteractiveCard: Story = {
  render: () => (
    <Card className="w-96 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer">
      <CardHeader>
        <CardTitle>Interactive Card</CardTitle>
        <CardDescription>Hover over me!</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card has hover effects and transitions.</p>
      </CardContent>
    </Card>
  ),
};
