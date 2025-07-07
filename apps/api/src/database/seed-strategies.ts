import { PrismaClient, TemplateCategory, Difficulty, AssetType } from '@prisma/client';

const prisma = new PrismaClient();

export const strategyTemplates = [
  {
    name: 'golden-cross',
    displayName: 'Golden Cross',
    description: 'Classic trend-following strategy using SMA crossovers. Enters when 50 SMA crosses above 200 SMA.',
    category: TemplateCategory.TREND_FOLLOWING,
    difficulty: Difficulty.BEGINNER,
    timeframe: '1d',
    assetTypes: [AssetType.CRYPTO, AssetType.STOCKS],
    configuration: {
      indicators: [
        {
          type: 'SMA',
          params: { period: 50 },
          color: '#FFD700'
        },
        {
          type: 'SMA',
          params: { period: 200 },
          color: '#C0C0C0'
        }
      ],
      entryConditions: [
        {
          indicatorId: '0',
          operator: 'CROSSES_ABOVE',
          compareToType: 'INDICATOR',
          compareToValue: { indicatorId: '1' }
        }
      ],
      exitConditions: [
        {
          indicatorId: '0',
          operator: 'CROSSES_BELOW',
          compareToType: 'INDICATOR',
          compareToValue: { indicatorId: '1' }
        }
      ]
    },
    performance: {
      backtestReturn: 45.3,
      winRate: 55,
      sharpeRatio: 1.2
    }
  },
  {
    name: 'rsi-oversold',
    displayName: 'RSI Oversold Bounce',
    description: 'Mean reversion strategy that buys when RSI indicates oversold conditions.',
    category: TemplateCategory.MEAN_REVERSION,
    difficulty: Difficulty.BEGINNER,
    timeframe: '1h',
    assetTypes: [AssetType.CRYPTO, AssetType.STOCKS],
    configuration: {
      indicators: [
        {
          type: 'RSI',
          params: { period: 14 },
          color: '#9C27B0'
        }
      ],
      entryConditions: [
        {
          indicatorId: '0',
          operator: 'LESS_THAN',
          compareToType: 'VALUE',
          compareToValue: { value: 30 }
        }
      ],
      exitConditions: [
        {
          indicatorId: '0',
          operator: 'GREATER_THAN',
          compareToType: 'VALUE',
          compareToValue: { value: 70 }
        }
      ]
    },
    performance: {
      backtestReturn: 38.7,
      winRate: 62,
      sharpeRatio: 1.5
    }
  },
  {
    name: 'macd-momentum',
    displayName: 'MACD Momentum',
    description: 'Momentum strategy using MACD histogram crossovers for entry signals.',
    category: TemplateCategory.MOMENTUM,
    difficulty: Difficulty.INTERMEDIATE,
    timeframe: '4h',
    assetTypes: [AssetType.CRYPTO, AssetType.STOCKS],
    configuration: {
      indicators: [
        {
          type: 'MACD',
          params: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
          color: '#2196F3'
        },
        {
          type: 'EMA',
          params: { period: 200 },
          color: '#4CAF50'
        }
      ],
      entryConditions: [
        {
          indicatorId: '0',
          operator: 'CROSSES_ABOVE',
          compareToType: 'VALUE',
          compareToValue: { value: 0 }
        },
        {
          indicatorId: '1',
          operator: 'LESS_THAN',
          compareToType: 'PRICE',
          compareToValue: {},
          logicalOperator: 'AND'
        }
      ],
      exitConditions: [
        {
          indicatorId: '0',
          operator: 'CROSSES_BELOW',
          compareToType: 'VALUE',
          compareToValue: { value: 0 }
        }
      ]
    },
    performance: {
      backtestReturn: 52.1,
      winRate: 48,
      sharpeRatio: 1.8
    }
  },
  {
    name: 'bollinger-squeeze',
    displayName: 'Bollinger Band Squeeze',
    description: 'Volatility breakout strategy that trades when price breaks out of Bollinger Band squeeze.',
    category: TemplateCategory.VOLATILITY,
    difficulty: Difficulty.INTERMEDIATE,
    timeframe: '1h',
    assetTypes: [AssetType.CRYPTO],
    configuration: {
      indicators: [
        {
          type: 'BOLLINGER',
          params: { period: 20, stdDev: 2 },
          color: '#FF9800'
        },
        {
          type: 'RSI',
          params: { period: 14 },
          color: '#9C27B0'
        }
      ],
      entryConditions: [
        {
          operator: 'GREATER_THAN',
          compareToType: 'INDICATOR',
          compareToValue: { indicatorId: '0', field: 'upper' }
        },
        {
          indicatorId: '1',
          operator: 'GREATER_THAN',
          compareToType: 'VALUE',
          compareToValue: { value: 50 },
          logicalOperator: 'AND'
        }
      ],
      exitConditions: [
        {
          operator: 'LESS_THAN',
          compareToType: 'INDICATOR',
          compareToValue: { indicatorId: '0', field: 'middle' }
        }
      ]
    },
    performance: {
      backtestReturn: 41.5,
      winRate: 45,
      sharpeRatio: 1.3
    }
  },
  {
    name: 'ema-scalping',
    displayName: 'EMA Scalping',
    description: 'Fast scalping strategy using EMA crossovers on lower timeframes.',
    category: TemplateCategory.SCALPING,
    difficulty: Difficulty.ADVANCED,
    timeframe: '5m',
    assetTypes: [AssetType.CRYPTO],
    configuration: {
      indicators: [
        {
          type: 'EMA',
          params: { period: 9 },
          color: '#E91E63'
        },
        {
          type: 'EMA',
          params: { period: 21 },
          color: '#3F51B5'
        },
        {
          type: 'EMA',
          params: { period: 50 },
          color: '#009688'
        }
      ],
      entryConditions: [
        {
          indicatorId: '0',
          operator: 'CROSSES_ABOVE',
          compareToType: 'INDICATOR',
          compareToValue: { indicatorId: '1' }
        },
        {
          indicatorId: '1',
          operator: 'GREATER_THAN',
          compareToType: 'INDICATOR',
          compareToValue: { indicatorId: '2' },
          logicalOperator: 'AND'
        }
      ],
      exitConditions: [
        {
          indicatorId: '0',
          operator: 'CROSSES_BELOW',
          compareToType: 'INDICATOR',
          compareToValue: { indicatorId: '1' }
        }
      ]
    },
    performance: {
      backtestReturn: 28.3,
      winRate: 58,
      sharpeRatio: 0.9
    }
  },
  {
    name: 'multi-indicator-pro',
    displayName: 'Multi-Indicator Pro',
    description: 'Advanced strategy combining multiple indicators for high-probability trades.',
    category: TemplateCategory.SWING,
    difficulty: Difficulty.EXPERT,
    timeframe: '1d',
    assetTypes: [AssetType.STOCKS],
    configuration: {
      indicators: [
        {
          type: 'EMA',
          params: { period: 20 },
          color: '#2196F3'
        },
        {
          type: 'RSI',
          params: { period: 14 },
          color: '#9C27B0'
        },
        {
          type: 'MACD',
          params: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
          color: '#4CAF50'
        },
        {
          type: 'BOLLINGER',
          params: { period: 20, stdDev: 2 },
          color: '#FF9800'
        }
      ],
      entryConditions: [
        {
          operator: 'GREATER_THAN',
          compareToType: 'INDICATOR',
          compareToValue: { indicatorId: '0' }
        },
        {
          indicatorId: '1',
          operator: 'BETWEEN',
          compareToType: 'VALUE',
          compareToValue: { min: 40, max: 60 },
          logicalOperator: 'AND'
        },
        {
          indicatorId: '2',
          operator: 'GREATER_THAN',
          compareToType: 'VALUE',
          compareToValue: { value: 0 },
          logicalOperator: 'AND'
        }
      ],
      exitConditions: [
        {
          indicatorId: '1',
          operator: 'GREATER_THAN',
          compareToType: 'VALUE',
          compareToValue: { value: 80 }
        },
        {
          operator: 'LESS_THAN',
          compareToType: 'INDICATOR',
          compareToValue: { indicatorId: '3', field: 'lower' },
          logicalOperator: 'OR'
        }
      ]
    },
    performance: {
      backtestReturn: 67.2,
      winRate: 52,
      sharpeRatio: 2.1
    }
  }
];

export async function seedStrategyTemplates() {
  console.log('🌱 Seeding strategy templates...');
  
  for (const template of strategyTemplates) {
    try {
      await prisma.strategyTemplate.upsert({
        where: { name: template.name },
        update: template,
        create: template
      });
      console.log(`✅ Created/updated template: ${template.displayName}`);
    } catch (error) {
      console.error(`❌ Error creating template ${template.name}:`, error);
    }
  }
  
  console.log('✨ Strategy templates seeding complete!');
}

// Run if this file is executed directly
if (require.main === module) {
  seedStrategyTemplates()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
