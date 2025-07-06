import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger', 'info', 'purple'],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default',
    variant: 'default',
  },
};

export const Success: Story = {
  args: {
    children: 'Success',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: 'Warning',
    variant: 'warning',
  },
};

export const Danger: Story = {
  args: {
    children: 'Danger',
    variant: 'danger',
  },
};

export const Info: Story = {
  args: {
    children: 'Info',
    variant: 'info',
  },
};

export const Purple: Story = {
  args: {
    children: 'Premium',
    variant: 'purple',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Badge variant="default">Default</Badge>
      <Badge variant="success">Active</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="danger">Failed</Badge>
      <Badge variant="info">New</Badge>
      <Badge variant="purple">Premium</Badge>
    </div>
  ),
};

export const StatusBadges: Story = {
  name: 'Status Examples',
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-gray-300">Bot Status:</span>
        <Badge variant="success">Active</Badge>
        <Badge variant="warning">Paused</Badge>
        <Badge variant="danger">Stopped</Badge>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-gray-300">Trading Mode:</span>
        <Badge variant="info">Paper Trading</Badge>
        <Badge variant="purple">Live Trading</Badge>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-gray-300">Order Status:</span>
        <Badge variant="default">Pending</Badge>
        <Badge variant="success">Filled</Badge>
        <Badge variant="danger">Failed</Badge>
      </div>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Badge variant="success">
        <span className="mr-1">●</span> Online
      </Badge>
      <Badge variant="danger">
        <span className="mr-1">●</span> Offline
      </Badge>
      <Badge variant="warning">
        <span className="mr-1">⚠</span> Warning
      </Badge>
      <Badge variant="info">
        <span className="mr-1">ℹ</span> Info
      </Badge>
    </div>
  ),
};

export const LongText: Story = {
  render: () => (
    <div className="space-y-2">
      <Badge>Short</Badge>
      <Badge>Medium Length Badge</Badge>
      <Badge>This is a very long badge with lots of text</Badge>
    </div>
  ),
};
