import { TechnicalAnalysisService } from '../analysis/technical-analysis.service';
import { logger } from '@/shared/utils/logger';
import { prisma } from '@/shared/database/prisma';
import type { 
  BotStrategy, 
  StrategyIndicator, 
  StrategyCondition,
  ConditionOperator,
  CompareToType
} from '@prisma/client';

export interface StrategyEvaluationResult {
  shouldEnter: boolean;
  shouldExit: boolean;
  entrySignals: ConditionResult[];
  exitSignals: ConditionResult[];
  indicatorValues: Record<string, any>;
  confidence: number; // 0-100
  reasons: string[];
}

interface ConditionResult {
  condition: StrategyCondition;
  met: boolean;
  value: any;
  compareValue: any;
}

export class StrategyEvaluationService {
  constructor(
    private readonly technicalAnalysis: TechnicalAnalysisService
  ) {}

  /**
   * Evaluate a strategy against current market conditions
   */
  async evaluateStrategy(
    strategyId: string,
    symbol: string,
    candles: any[],
    currentPrice: number
  ): Promise<StrategyEvaluationResult> {
    try {
      // Load strategy with all relations
      const strategy = await prisma.botStrategy.findUnique({
        where: { id: strategyId },
        include: {
          indicators: true,
          conditions: {
            orderBy: { orderIndex: 'asc' },
            include: { indicator: true }
          }
        }
      });

      if (!strategy || !strategy.isActive) {
        throw new Error('Strategy not found or inactive');
      }

      // Calculate all required indicators
      const indicatorValues = await this.calculateIndicators(
        strategy.indicators,
        symbol,
        candles
      );

      // Separate conditions by type
      const entryConditions = strategy.conditions.filter(c => c.type === 'ENTRY');
      const exitConditions = strategy.conditions.filter(c => c.type === 'EXIT');
      
      // Evaluate entry conditions
      const entryResults = await this.evaluateConditions(
        entryConditions,
        indicatorValues,
        currentPrice,
        candles
      );

      // Evaluate exit conditions
      const exitResults = await this.evaluateConditions(
        exitConditions,
        indicatorValues,
        currentPrice,
        candles
      );

      // Determine if we should enter or exit
      const shouldEnter = this.combineConditionResults(entryResults);
      const shouldExit = this.combineConditionResults(exitResults);

      // Calculate confidence based on signal strength
      const confidence = this.calculateConfidence(entryResults, exitResults, indicatorValues);

      // Generate human-readable reasons
      const reasons = this.generateReasons(entryResults, exitResults, shouldEnter, shouldExit);

      return {
        shouldEnter,
        shouldExit,
        entrySignals: entryResults,
        exitSignals: exitResults,
        indicatorValues,
        confidence,
        reasons
      };

    } catch (error) {
      logger.error('Error evaluating strategy:', error);
      throw error;
    }
  }

  /**
   * Calculate all indicators for a strategy
   */
  private async calculateIndicators(
    indicators: StrategyIndicator[],
    symbol: string,
    candles: any[]
  ): Promise<Record<string, any>> {
    const results: Record<string, any> = {};

    for (const indicator of indicators) {
      const result = await this.technicalAnalysis.calculateIndicators({
        symbol,
        indicator: indicator.indicatorType,
        params: indicator.params as any,
        candles
      });

      results[indicator.id] = {
        ...result,
        type: indicator.indicatorType,
        params: indicator.params
      };
    }

    return results;
  }

  /**
   * Evaluate a set of conditions
   */
  private async evaluateConditions(
    conditions: Array<StrategyCondition & { indicator: StrategyIndicator | null }>,
    indicatorValues: Record<string, any>,
    currentPrice: number,
    candles: any[]
  ): Promise<ConditionResult[]> {
    const results: ConditionResult[] = [];

    for (const condition of conditions) {
      const result = await this.evaluateCondition(
        condition,
        indicatorValues,
        currentPrice,
        candles
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Evaluate a single condition
   */
  private async evaluateCondition(
    condition: StrategyCondition & { indicator: StrategyIndicator | null },
    indicatorValues: Record<string, any>,
    currentPrice: number,
    candles: any[]
  ): Promise<ConditionResult> {
    let value: any;
    let compareValue: any;

    // Get the value to compare
    if (condition.indicatorId && indicatorValues[condition.indicatorId]) {
      const indicatorResult = indicatorValues[condition.indicatorId];
      value = this.getLatestIndicatorValue(indicatorResult.values);
    } else {
      // Default to current price if no indicator specified
      value = currentPrice;
    }

    // Get the comparison value
    const compareToValue = condition.compareToValue as any;
    switch (condition.compareToType) {
      case 'VALUE':
        compareValue = typeof compareToValue === 'object' ? compareToValue.value : compareToValue;
        break;
      
      case 'INDICATOR':
        if (compareToValue.indicatorId && indicatorValues[compareToValue.indicatorId]) {
          const otherIndicator = indicatorValues[compareToValue.indicatorId];
          compareValue = this.getLatestIndicatorValue(otherIndicator.values);
          if (compareToValue.offset) {
            compareValue += compareToValue.offset;
          }
        }
        break;
      
      case 'PRICE':
        compareValue = currentPrice;
        if (compareToValue.offset) {
          compareValue += compareToValue.offset;
        }
        break;
    }

    // Evaluate the condition
    const met = this.evaluateOperator(
      condition.operator,
      value,
      compareValue,
      indicatorValues,
      candles
    );

    return {
      condition,
      met,
      value,
      compareValue
    };
  }

  /**
   * Get the latest value from indicator results
   */
  private getLatestIndicatorValue(values: any): number {
    if (Array.isArray(values)) {
      return values[values.length - 1];
    } else if (typeof values === 'object' && values.macd) {
      // MACD returns multiple arrays
      return values.macd[values.macd.length - 1];
    } else if (typeof values === 'object' && values.upper) {
      // Bollinger Bands
      return values.middle[values.middle.length - 1];
    }
    return values;
  }

  /**
   * Evaluate an operator
   */
  private evaluateOperator(
    operator: ConditionOperator,
    value: number,
    compareValue: number,
    indicatorValues: Record<string, any>,
    candles: any[]
  ): boolean {
    switch (operator) {
      case 'GREATER_THAN':
        return value > compareValue;
      
      case 'LESS_THAN':
        return value < compareValue;
      
      case 'EQUALS':
        return Math.abs(value - compareValue) < 0.0001; // Float comparison
      
      case 'BETWEEN':
        // For BETWEEN, compareValue should be an object with min/max
        if (typeof compareValue === 'object' && 'min' in compareValue && 'max' in compareValue) {
          return value >= compareValue.min && value <= compareValue.max;
        }
        return false;
      
      case 'CROSSES_ABOVE':
      case 'CROSSES_BELOW':
        // Need at least 2 data points to detect crossing
        if (candles.length < 2) return false;
        
        // This would need historical values - simplified for now
        // In production, we'd track previous values
        return operator === 'CROSSES_ABOVE' ? value > compareValue : value < compareValue;
      
      default:
        return false;
    }
  }

  /**
   * Combine condition results based on logical operators
   */
  private combineConditionResults(results: ConditionResult[]): boolean {
    if (results.length === 0) return false;
    
    let combined = results[0].met;
    
    for (let i = 1; i < results.length; i++) {
      const prev = results[i - 1];
      const current = results[i];
      
      // Check the logical operator from the previous condition
      const logicalOp = (prev.condition as any).logicalOperator;
      
      if (logicalOp === 'OR') {
        combined = combined || current.met;
      } else {
        // Default to AND
        combined = combined && current.met;
      }
    }
    
    return combined;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    entryResults: ConditionResult[],
    exitResults: ConditionResult[],
    indicatorValues: Record<string, any>
  ): number {
    let confidence = 50; // Base confidence
    
    // Increase confidence for each met condition
    const totalConditions = entryResults.length + exitResults.length;
    const metConditions = [...entryResults, ...exitResults].filter(r => r.met).length;
    
    if (totalConditions > 0) {
      confidence = (metConditions / totalConditions) * 100;
    }
    
    // Adjust based on indicator signals
    let bullishSignals = 0;
    let bearishSignals = 0;
    
    Object.values(indicatorValues).forEach((indicator: any) => {
      if (indicator.signal === 'bullish') bullishSignals++;
      if (indicator.signal === 'bearish') bearishSignals++;
    });
    
    const totalSignals = bullishSignals + bearishSignals;
    if (totalSignals > 0) {
      const signalBias = (bullishSignals - bearishSignals) / totalSignals;
      confidence += signalBias * 20; // +/- 20% based on signal bias
    }
    
    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Generate human-readable reasons
   */
  private generateReasons(
    entryResults: ConditionResult[],
    exitResults: ConditionResult[],
    shouldEnter: boolean,
    shouldExit: boolean
  ): string[] {
    const reasons: string[] = [];
    
    if (shouldEnter) {
      reasons.push('Entry conditions met:');
      entryResults.filter(r => r.met).forEach(r => {
        const indicator = (r.condition as any).indicator;
        reasons.push(`- ${indicator?.indicatorType || 'Price'} ${r.condition.operator.toLowerCase().replace('_', ' ')} ${r.compareValue}`);
      });
    }
    
    if (shouldExit) {
      reasons.push('Exit conditions met:');
      exitResults.filter(r => r.met).forEach(r => {
        const indicator = (r.condition as any).indicator;
        reasons.push(`- ${indicator?.indicatorType || 'Price'} ${r.condition.operator.toLowerCase().replace('_', ' ')} ${r.compareValue}`);
      });
    }
    
    if (!shouldEnter && !shouldExit) {
      reasons.push('No trading signals triggered');
    }
    
    return reasons;
  }
}
