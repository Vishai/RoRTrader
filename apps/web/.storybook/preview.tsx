import React from 'react';
import type { Preview } from '@storybook/react';
import '../app/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#0A0A0B',
        },
        {
          name: 'light',
          value: '#ffffff',
        },
      ],
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'dark',
      toolbar: {
        icon: 'circlehollow',
        items: ['dark', 'light'],
        showName: true,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background-primary">
        <Story />
      </div>
    ),
  ],
};

export default preview;
