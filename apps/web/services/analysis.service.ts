import { apiCall } from '@/lib/api-client';

// Types for API responses
export interface IndicatorDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: Array<{
    name: string;
    type: 'number' | 'string' | 'boolean';
    default: any;
    min?: number;
    max?: number;
    description?: string;
  }>;
  outputs: Array<{
    name: string;
    type: string;
    description?: string;
  }>;
}

export interface IndicatorCalculationRequest {
  indicator: string;
  symbol: string;
  timeframe: string;
  parameters?: Record<string, any>;
  exchange?: string;
  bars?: number;
}

export type AnalysisDataSource = 'alpaca' | 'coinbase_pro' | 'demo' | 'provided';

export interface AnalysisMeta {
  dataSource: AnalysisDataSource;
  cached: boolean;
  fallback: boolean;
}

export interface AnalysisApiResponse<T> {
  success: boolean;
  data: T;
  meta: AnalysisMeta;
}

export interface IndicatorCalculationData {
  indicator: string;
  symbol: string;
  timeframe: string;
  parameters: Record<string, any>;
  values: Array<{
    timestamp: string;
    value: number | Record<string, number>;
  }>;
  signals?: Array<{
    timestamp: string;
    type: 'buy' | 'sell' | 'neutral';
    strength: number;
    message?: string;
  }>;
  currentSignal?: {
    type: 'buy' | 'sell' | 'neutral';
    strength: number;
    message?: string;
  };
}

export type IndicatorCalculationResponse = AnalysisApiResponse<IndicatorCalculationData>;

export interface BatchIndicatorRequest {
  indicators: Array<{
    indicator: string;
    parameters?: Record<string, any>;
  }>;
  symbol: string;
  timeframe: string;
  exchange?: string;
  bars?: number;
}

export interface IndicatorSummary {
  indicator: string;
  currentValue: number | Record<string, number>;
  signal: {
    type: 'buy' | 'sell' | 'neutral';
    strength: number;
    message?: string;
  };
  trend: 'up' | 'down' | 'neutral';
  parameters: Record<string, any>;
}

export interface BatchIndicatorData {
  symbol: string;
  timeframe: string;
  timestamp: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  indicators: IndicatorSummary[];
  overallSignal: {
    type: 'buy' | 'sell' | 'neutral';
    strength: number;
    bullishCount: number;
    bearishCount: number;
    neutralCount: number;
    warnings?: string[];
  };
}

export type BatchIndicatorResponse = AnalysisApiResponse<BatchIndicatorData>;

// Analysis Service Class
export class AnalysisService {
  // Get all available indicators
  static async getIndicators(): Promise<IndicatorDefinition[]> {
    return apiCall<IndicatorDefinition[]>('get', '/api/analysis/indicators');
  }

  // Calculate single indicator
  static async calculateIndicator(
    request: IndicatorCalculationRequest
  ): Promise<IndicatorCalculationResponse> {
    return apiCall<IndicatorCalculationResponse>('post', '/api/analysis/indicator', request);
  }

  // Calculate multiple indicators at once
  static async calculateBatch(
    request: BatchIndicatorRequest
  ): Promise<BatchIndicatorResponse> {
    return apiCall<BatchIndicatorResponse>('post', '/api/analysis/batch', request);
  }

  // Get indicator by ID
  static async getIndicatorById(id: string): Promise<IndicatorDefinition> {
    return apiCall<IndicatorDefinition>('get', `/api/analysis/indicators/${id}`);
  }

  // Helper to build default parameters for an indicator
  static buildDefaultParameters(indicator: IndicatorDefinition): Record<string, any> {
    const params: Record<string, any> = {};
    indicator.parameters.forEach(param => {
      params[param.name] = param.default;
    });
    return params;
  }

  // Helper to validate parameters
  static validateParameters(
    indicator: IndicatorDefinition,
    parameters: Record<string, any>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    indicator.parameters.forEach(param => {
      const value = parameters[param.name];

      // Check required parameters
      if (value === undefined || value === null) {
        errors.push(`Parameter '${param.name}' is required`);
        return;
      }

      // Type validation
      if (param.type === 'number') {
        if (typeof value !== 'number') {
          errors.push(`Parameter '${param.name}' must be a number`);
        } else {
          // Range validation
          if (param.min !== undefined && value < param.min) {
            errors.push(`Parameter '${param.name}' must be >= ${param.min}`);
          }
          if (param.max !== undefined && value > param.max) {
            errors.push(`Parameter '${param.name}' must be <= ${param.max}`);
          }
        }
      } else if (param.type === 'string' && typeof value !== 'string') {
        errors.push(`Parameter '${param.name}' must be a string`);
      } else if (param.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`Parameter '${param.name}' must be a boolean`);
      }
    });

    return { valid: errors.length === 0, errors };
  }

  // Convert indicator response to chart series format
  static toChartSeries(
    response: IndicatorCalculationData,
    seriesName?: string
  ): any[] {
    return response.values.map(item => {
      const timestamp = new Date(item.timestamp).getTime() / 1000;
      
      if (typeof item.value === 'number') {
        return {
          time: timestamp,
          value: item.value,
        };
      } else {
        // For indicators with multiple outputs (like Bollinger Bands)
        return {
          time: timestamp,
          ...item.value,
        };
      }
    });
  }

  // Get signal strength as a percentage
  static getSignalStrengthPercentage(signal?: { strength: number }): number {
    if (!signal) return 0;
    return Math.round(signal.strength * 100);
  }

  // Get signal color based on type
  static getSignalColor(type?: 'buy' | 'sell' | 'neutral'): string {
    switch (type) {
      case 'buy':
        return '#00FF88'; // Green
      case 'sell':
        return '#FF3366'; // Red
      case 'neutral':
      default:
        return '#B8B8BD'; // Gray
    }
  }

  // Format signal message
  static formatSignalMessage(signal?: { type: string; strength: number; message?: string }): string {
    if (!signal) return 'No signal';
    
    const strength = this.getSignalStrengthPercentage(signal);
    const prefix = signal.type === 'buy' ? 'Bullish' : signal.type === 'sell' ? 'Bearish' : 'Neutral';
    
    return signal.message || `${prefix} signal (${strength}% strength)`;
  }
}

// Export convenience functions
export const {
  getIndicators,
  calculateIndicator,
  calculateBatch,
  getIndicatorById,
  buildDefaultParameters,
  validateParameters,
  toChartSeries,
  getSignalStrengthPercentage,
  getSignalColor,
  formatSignalMessage,
} = AnalysisService;
