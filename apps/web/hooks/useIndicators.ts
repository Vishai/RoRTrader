import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import {
  AnalysisService,
  IndicatorDefinition,
  IndicatorCalculationRequest,
  IndicatorCalculationResponse,
  BatchIndicatorRequest,
  BatchIndicatorResponse,
} from '@/services/analysis.service';

// Hook to fetch all available indicators
export function useIndicators() {
  return useQuery<IndicatorDefinition[], Error>({
    queryKey: ['indicators'],
    queryFn: () => AnalysisService.getIndicators(),
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}

// Hook to calculate a single indicator
export function useIndicatorCalculation(
  request: IndicatorCalculationRequest | null,
  enabled: boolean = true
) {
  return useQuery<IndicatorCalculationResponse, Error>({
    queryKey: ['indicator-calculation', request],
    queryFn: () => {
      if (!request) throw new Error('No request provided');
      return AnalysisService.calculateIndicator(request);
    },
    enabled: enabled && !!request,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to calculate multiple indicators in batch
export function useBatchIndicators(
  request: BatchIndicatorRequest | null,
  enabled: boolean = true,
  refetchInterval?: number
) {
  return useQuery<BatchIndicatorResponse, Error>({
    queryKey: ['batch-indicators', request],
    queryFn: () => {
      if (!request) throw new Error('No request provided');
      return AnalysisService.calculateBatch(request);
    },
    enabled: enabled && !!request,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: refetchInterval || false,
  });
}

// Hook for live indicator calculations with auto-refresh
export function useLiveIndicators(
  request: BatchIndicatorRequest | null,
  refreshInterval: number = 5000 // 5 seconds default
) {
  const [isLive, setIsLive] = useState(true);

  const query = useBatchIndicators(
    request,
    true,
    isLive ? refreshInterval : undefined
  );

  return {
    ...query,
    isLive,
    setIsLive,
    toggleLive: () => setIsLive(!isLive),
  };
}

// Hook to manage indicator parameters
export function useIndicatorParameters(indicatorId: string) {
  const { data: indicators } = useIndicators();
  const indicator = indicators?.find(ind => ind.id === indicatorId);

  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (indicator) {
      setParameters(AnalysisService.buildDefaultParameters(indicator));
    }
  }, [indicator]);

  const updateParameter = (name: string, value: any) => {
    setParameters(prev => ({ ...prev, [name]: value }));
  };

  const validateParameters = () => {
    if (!indicator) return false;
    
    const validation = AnalysisService.validateParameters(indicator, parameters);
    setErrors(validation.errors);
    return validation.valid;
  };

  const resetToDefaults = () => {
    if (indicator) {
      setParameters(AnalysisService.buildDefaultParameters(indicator));
      setErrors([]);
    }
  };

  return {
    indicator,
    parameters,
    errors,
    updateParameter,
    validateParameters,
    resetToDefaults,
    isValid: errors.length === 0,
  };
}

// Hook for indicator signal formatting
export function useIndicatorSignal(
  signal?: { type: 'buy' | 'sell' | 'neutral'; strength: number; message?: string }
) {
  return {
    color: AnalysisService.getSignalColor(signal?.type),
    strengthPercent: AnalysisService.getSignalStrengthPercentage(signal),
    message: AnalysisService.formatSignalMessage(signal),
    isBullish: signal?.type === 'buy',
    isBearish: signal?.type === 'sell',
    isNeutral: signal?.type === 'neutral' || !signal,
  };
}

// Hook to calculate and cache multiple indicators for a chart
export function useChartIndicators(
  symbol: string,
  timeframe: string,
  indicators: Array<{ id: string; parameters: Record<string, any> }>,
  enabled: boolean = true
) {
  const queryClient = useQueryClient();

  // Create a mutation for calculating indicators
  const calculateIndicator = useMutation({
    mutationFn: (indicator: { id: string; parameters: Record<string, any> }) => {
      return AnalysisService.calculateIndicator({
        indicator: indicator.id,
        symbol,
        timeframe,
        parameters: indicator.parameters,
      });
    },
    onSuccess: (data, variables) => {
      // Cache the result
      queryClient.setQueryData(
        ['chart-indicator', symbol, timeframe, variables.id, variables.parameters],
        data
      );
    },
  });

  // Calculate all indicators
  useEffect(() => {
    if (enabled && indicators.length > 0) {
      indicators.forEach(indicator => {
        calculateIndicator.mutate(indicator);
      });
    }
  }, [enabled, symbol, timeframe, JSON.stringify(indicators)]);

  // Get cached results
  const results = indicators.map(indicator => {
    const response = queryClient.getQueryData<IndicatorCalculationResponse>([
      'chart-indicator',
      symbol,
      timeframe,
      indicator.id,
      indicator.parameters,
    ]);
    return {
      ...indicator,
      data: response?.data,
      meta: response?.meta,
      success: response?.success,
      isLoading: calculateIndicator.isPending,
      error: calculateIndicator.error,
    };
  });

  return {
    indicators: results,
    isLoading: calculateIndicator.isPending,
    error: calculateIndicator.error,
    refetch: () => {
      indicators.forEach(indicator => {
        calculateIndicator.mutate(indicator);
      });
    },
  };
}

// Hook to prefetch indicators for performance
export function usePrefetchIndicators() {
  const queryClient = useQueryClient();

  const prefetchIndicators = async () => {
    await queryClient.prefetchQuery({
      queryKey: ['indicators'],
      queryFn: () => AnalysisService.getIndicators(),
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchCalculation = async (request: IndicatorCalculationRequest) => {
    await queryClient.prefetchQuery({
      queryKey: ['indicator-calculation', request],
      queryFn: () => AnalysisService.calculateIndicator(request),
      staleTime: 1 * 60 * 1000,
    });
  };

  return { prefetchIndicators, prefetchCalculation };
}
