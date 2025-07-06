const path = require('path');

module.exports = {
  stories: ['../components/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  docs: {
    autodocs: true,
  },
  staticDirs: ['../public'],
  webpackFinal: async (config) => {
    // Add path alias support
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../'),
      '@/components': path.resolve(__dirname, '../components'),
      '@/lib': path.resolve(__dirname, '../lib'),
      '@/app': path.resolve(__dirname, '../app'),
    };
    return config;
  },
};
