import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { Input, Textarea } from './Input';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    error: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-80 space-y-2">
      <label htmlFor="email" className="text-sm font-medium text-gray-200">
        Email Address
      </label>
      <Input id="email" type="email" placeholder="user@example.com" />
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="w-80 space-y-2">
      <label htmlFor="password" className="text-sm font-medium text-gray-200">
        Password
      </label>
      <Input 
        id="password" 
        type="password" 
        placeholder="Enter password" 
        error 
      />
      <p className="text-sm text-red-400">Password must be at least 8 characters</p>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
    value: 'Cannot edit this',
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <Input type="text" placeholder="Text input" />
      <Input type="email" placeholder="Email input" />
      <Input type="password" placeholder="Password input" />
      <Input type="number" placeholder="Number input" />
      <Input type="tel" placeholder="Phone input" />
      <Input type="url" placeholder="URL input" />
    </div>
  ),
};

export const TextareaDefault: Story = {
  render: () => (
    <div className="w-80 space-y-2">
      <label htmlFor="description" className="text-sm font-medium text-gray-200">
        Description
      </label>
      <Textarea 
        id="description" 
        placeholder="Enter a description..." 
        rows={4}
      />
    </div>
  ),
};

export const TextareaWithError: Story = {
  render: () => (
    <div className="w-80 space-y-2">
      <label htmlFor="bio" className="text-sm font-medium text-gray-200">
        Bio
      </label>
      <Textarea 
        id="bio" 
        placeholder="Tell us about yourself..." 
        rows={5}
        error
      />
      <p className="text-sm text-red-400">Bio must be less than 500 characters</p>
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <form className="w-96 space-y-4">
      <div className="space-y-2">
        <label htmlFor="botName" className="text-sm font-medium text-gray-200">
          Bot Name
        </label>
        <Input id="botName" placeholder="My Trading Bot" />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="webhook" className="text-sm font-medium text-gray-200">
          Webhook URL
        </label>
        <Input 
          id="webhook" 
          type="url" 
          placeholder="https://api.ror-trader.com/webhook/..." 
          readOnly
          className="font-mono text-sm"
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-gray-200">
          Description
        </label>
        <Textarea 
          id="description" 
          placeholder="Describe your trading strategy..." 
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="apiKey" className="text-sm font-medium text-gray-200">
          API Key
        </label>
        <Input 
          id="apiKey" 
          type="password" 
          placeholder="Enter your API key"
        />
      </div>
    </form>
  ),
};
