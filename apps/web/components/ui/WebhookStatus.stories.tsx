import type { Meta, StoryObj } from '@storybook/react';
import { WebhookStatus } from './WebhookStatus';

const meta = {
  title: 'UI/WebhookStatus',
  component: WebhookStatus,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['healthy', 'degraded', 'error', 'pending'],
    },
  },
} satisfies Meta<typeof WebhookStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Healthy: Story = {
  args: {
    status: 'healthy',
    lastPing: new Date(Date.now() - 1000 * 30), // 30 seconds ago
    successRate: 99.8,
  },
};

export const Degraded: Story = {
  args: {
    status: 'degraded',
    lastPing: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    successRate: 85.5,
  },
};

export const Error: Story = {
  args: {
    status: 'error',
    lastPing: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    successRate: 45.2,
  },
};

export const Pending: Story = {
  args: {
    status: 'pending',
  },
};

export const HealthyMinimal: Story = {
  args: {
    status: 'healthy',
  },
};

export const WithoutSuccessRate: Story = {
  args: {
    status: 'healthy',
    lastPing: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
  },
};
