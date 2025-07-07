import { apiCall } from '@/lib/api-client';

// Types for Strategy API
export interface StrategyIndicator {
  id: string;
  indicator: string;
  parameters: Record<string, any>;
  weight: number;
  signalThreshold?: number;
  enabled: boolean;
}

export interface StrategyRule {
  id: string;
  type: 'entry' | 'exit' | 'risk';
  conditions: Array<{
    indicator: string;
    comparison: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'crosses_above' | 'crosses_below';
    value: number | string;
    lookback?: number;
  }>;
  action: {
    type: 'buy' | 'sell' | 'close_position' | 'adjust_size';
    params?: Record<string, any>;
  };
  enabled: boolean;
}

export interface Strategy {
  id: string;
  botId?: string;
  name: string;
  description?: string;
  type: 'technical' | 'composite' | 'custom';
  indicators: StrategyIndicator[];
  rules: StrategyRule[];
  riskManagement: {
    stopLoss?: number;
    takeProfit?: number;
    maxDrawdown?: number;
    positionSizing?: {
      type: 'fixed' | 'percentage' | 'kelly' | 'volatility';
      value: number;
    };
  };
  backtestResults?: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    totalTrades: number;
    lastUpdated: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  category: 'momentum' | 'trend' | 'volatility' | 'mean_reversion' | 'composite';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeframes: string[];
  markets: string[];
  indicators: StrategyIndicator[];
  rules: StrategyRule[];
  riskManagement: Strategy['riskManagement'];
  performance?: {
    avgReturn: number;
    avgSharpe: number;
    avgDrawdown: number;
    successRate: number;
  };
}

export interface CreateStrategyRequest {
  botId?: string;
  name: string;
  description?: string;
  type: 'technical' | 'composite' | 'custom';
  indicators: Omit<StrategyIndicator, 'id'>[];
  rules: Omit<StrategyRule, 'id'>[];
  riskManagement: Strategy['riskManagement'];
  isActive?: boolean;
}

export interface UpdateStrategyRequest extends Partial<CreateStrategyRequest> {}

export interface StrategyEvaluationRequest {
  strategyId?: string;
  strategy?: CreateStrategyRequest;
  symbol: string;
  timeframe: string;
  startDate?: string;
  endDate?: string;
}

export interface StrategyEvaluationResponse {
  signals: Array<{
    timestamp: string;
    type: 'buy' | 'sell' | 'hold';
    strength: number;
    indicators: Record<string, any>;
    price: number;
  }>;
  performance: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    totalTrades: number;
    profitableTrades: number;
    avgWin: number;
    avgLoss: number;
    profitFactor: number;
  };
  currentPosition?: {
    side: 'long' | 'short' | 'flat';
    entryPrice: number;
    currentPrice: number;
    unrealizedPnl: number;
    duration: number;
  };
}

// Strategy Service Class
export class StrategyService {
  // Get all strategy templates
  static async getTemplates(): Promise<StrategyTemplate[]> {
    return apiCall<StrategyTemplate[]>('get', '/api/strategies/templates');
  }

  // Get template by ID
  static async getTemplateById(id: string): Promise<StrategyTemplate> {
    return apiCall<StrategyTemplate>('get', `/api/strategies/templates/${id}`);
  }

  // Get strategy by bot ID
  static async getByBotId(botId: string): Promise<Strategy | null> {
    try {
      return await apiCall<Strategy>('get', `/api/strategies/bot/${botId}`);
    } catch (error) {
      // Return null if no strategy found
      return null;
    }
  }

  // Get strategy by ID
  static async getById(id: string): Promise<Strategy> {
    return apiCall<Strategy>('get', `/api/strategies/${id}`);
  }

  // Create new strategy
  static async create(strategy: CreateStrategyRequest): Promise<Strategy> {
    return apiCall<Strategy>('post', '/api/strategies', strategy);
  }

  // Update existing strategy
  static async update(id: string, updates: UpdateStrategyRequest): Promise<Strategy> {
    return apiCall<Strategy>('put', `/api/strategies/${id}`, updates);
  }

  // Delete strategy
  static async delete(id: string): Promise<void> {
    return apiCall<void>('delete', `/api/strategies/${id}`);
  }

  // Evaluate strategy performance
  static async evaluate(
    request: StrategyEvaluationRequest
  ): Promise<StrategyEvaluationResponse> {
    return apiCall<StrategyEvaluationResponse>(
      'post',
      '/api/strategies/evaluate',
      request
    );
  }

  // Create strategy from template
  static async createFromTemplate(
    templateId: string,
    botId?: string,
    customizations?: Partial<CreateStrategyRequest>
  ): Promise<Strategy> {
    const template = await this.getTemplateById(templateId);
    
    const strategyData: CreateStrategyRequest = {
      botId,
      name: customizations?.name || `${template.name} Strategy`,
      description: customizations?.description || template.description,
      type: 'technical',
      indicators: template.indicators.map(({ id, ...indicator }) => indicator),
      rules: template.rules.map(({ id, ...rule }) => rule),
      riskManagement: customizations?.riskManagement || template.riskManagement,
      isActive: customizations?.isActive ?? true,
    };

    return this.create(strategyData);
  }

  // Helper to validate strategy rules
  static validateRules(rules: StrategyRule[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (rules.length === 0) {
      errors.push('Strategy must have at least one rule');
    }

    // Check for at least one entry rule
    const hasEntryRule = rules.some(r => r.type === 'entry' && r.enabled);
    if (!hasEntryRule) {
      errors.push('Strategy must have at least one active entry rule');
    }

    // Validate rule conditions
    rules.forEach((rule, index) => {
      if (rule.conditions.length === 0) {
        errors.push(`Rule ${index + 1} must have at least one condition`);
      }
    });

    return { valid: errors.length === 0, errors };
  }

  // Helper to calculate total indicator weight
  static calculateTotalWeight(indicators: StrategyIndicator[]): number {
    return indicators
      .filter(ind => ind.enabled)
      .reduce((sum, ind) => sum + ind.weight, 0);
  }

  // Normalize indicator weights to sum to 1
  static normalizeWeights(indicators: StrategyIndicator[]): StrategyIndicator[] {
    const totalWeight = this.calculateTotalWeight(indicators);
    if (totalWeight === 0) return indicators;

    return indicators.map(ind => ({
      ...ind,
      weight: ind.enabled ? ind.weight / totalWeight : 0,
    }));
  }

  // Get strategy complexity level
  static getComplexityLevel(strategy: Strategy): 'simple' | 'moderate' | 'complex' {
    const indicatorCount = strategy.indicators.filter(i => i.enabled).length;
    const ruleCount = strategy.rules.filter(r => r.enabled).length;
    const totalComplexity = indicatorCount + ruleCount;

    if (totalComplexity <= 3) return 'simple';
    if (totalComplexity <= 7) return 'moderate';
    return 'complex';
  }

  // Format performance metrics
  static formatPerformance(performance?: Strategy['backtestResults']) {
    if (!performance) return null;

    return {
      totalReturn: `${(performance.totalReturn * 100).toFixed(2)}%`,
      sharpeRatio: performance.sharpeRatio.toFixed(2),
      maxDrawdown: `${(performance.maxDrawdown * 100).toFixed(2)}%`,
      winRate: `${(performance.winRate * 100).toFixed(1)}%`,
      totalTrades: performance.totalTrades,
      lastUpdated: new Date(performance.lastUpdated).toLocaleDateString(),
    };
  }
}

// Export convenience functions
export const {
  getTemplates,
  getTemplateById,
  getByBotId,
  getById,
  create: createStrategy,
  update: updateStrategy,
  delete: deleteStrategy,
  evaluate: evaluateStrategy,
  createFromTemplate,
  validateRules,
  calculateTotalWeight,
  normalizeWeights,
  getComplexityLevel,
  formatPerformance,
} = StrategyService;