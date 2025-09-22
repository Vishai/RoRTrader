import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import {
  StrategyService,
  Strategy,
  StrategyTemplate,
  CreateStrategyRequest,
  UpdateStrategyRequest,
  StrategyEvaluationRequest,
  StrategyEvaluationResponse,
} from '@/services/strategy.service';

// Hook to fetch strategy templates
export function useStrategyTemplates() {
  return useQuery<StrategyTemplate[], Error>({
    queryKey: ['strategy-templates'],
    queryFn: () => StrategyService.getTemplates(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook to fetch a specific template
export function useStrategyTemplate(templateId: string | null) {
  return useQuery<StrategyTemplate, Error>({
    queryKey: ['strategy-template', templateId],
    queryFn: () => {
      if (!templateId) throw new Error('No template ID provided');
      return StrategyService.getTemplateById(templateId);
    },
    enabled: !!templateId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// Hook to fetch strategy by bot ID
export function useBotStrategy(botId: string | null) {
  return useQuery<Strategy | null, Error>({
    queryKey: ['bot-strategy', botId],
    queryFn: () => {
      if (!botId) return null;
      return StrategyService.getByBotId(botId);
    },
    enabled: !!botId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to create a strategy
export function useCreateStrategy() {
  const queryClient = useQueryClient();

  return useMutation<Strategy, Error, CreateStrategyRequest>({
    mutationFn: (strategy) => StrategyService.create(strategy),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['bot-strategy', data.botId] });
      if (data.botId) {
        queryClient.setQueryData(['bot-strategy', data.botId], data);
      }
    },
  });
}

// Hook to update a strategy
export function useUpdateStrategy() {
  const queryClient = useQueryClient();

  return useMutation<Strategy, Error, { id: string; updates: UpdateStrategyRequest }>({
    mutationFn: ({ id, updates }) => StrategyService.update(id, updates),
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(['strategy', data.id], data);
      if (data.botId) {
        queryClient.setQueryData(['bot-strategy', data.botId], data);
      }
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['strategy-evaluation'] });
    },
  });
}

// Hook to delete a strategy
export function useDeleteStrategy() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => StrategyService.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ['strategy', id] });
      queryClient.invalidateQueries({ queryKey: ['bot-strategy'] });
    },
  });
}

// Hook to evaluate strategy performance
export function useStrategyEvaluation(
  request: StrategyEvaluationRequest | null,
  enabled: boolean = true
) {
  return useQuery<StrategyEvaluationResponse, Error>({
    queryKey: ['strategy-evaluation', request],
    queryFn: () => {
      if (!request) throw new Error('No evaluation request provided');
      return StrategyService.evaluate(request);
    },
    enabled: enabled && !!request,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to create strategy from template
export function useCreateFromTemplate() {
  const queryClient = useQueryClient();

  return useMutation<
    Strategy,
    Error,
    {
      templateId: string;
      botId?: string;
      customizations?: Partial<CreateStrategyRequest>;
    }
  >({
    mutationFn: ({ templateId, botId, customizations }) =>
      StrategyService.createFromTemplate(templateId, botId, customizations),
    onSuccess: (data) => {
      if (data.botId) {
        queryClient.setQueryData(['bot-strategy', data.botId], data);
      }
      queryClient.invalidateQueries({ queryKey: ['bot-strategy'] });
    },
  });
}

// Hook to manage strategy builder state
export function useStrategyBuilder(initialStrategy?: Strategy) {
  const [strategy, setStrategy] = useState<Partial<CreateStrategyRequest>>({
    name: initialStrategy?.name || '',
    description: initialStrategy?.description || '',
    type: initialStrategy?.type || 'technical',
    indicators: initialStrategy?.indicators || [],
    rules: initialStrategy?.rules || [],
    riskManagement: initialStrategy?.riskManagement || {},
    isActive: initialStrategy?.isActive ?? true,
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const updateStrategy = useCallback((updates: Partial<CreateStrategyRequest>) => {
    setStrategy(prev => ({ ...prev, ...updates }));
  }, []);

  const addIndicator = useCallback((indicator: any) => {
    setStrategy(prev => ({
      ...prev,
      indicators: [...(prev.indicators || []), indicator],
    }));
  }, []);

  const removeIndicator = useCallback((index: number) => {
    setStrategy(prev => ({
      ...prev,
      indicators: prev.indicators?.filter((_, i) => i !== index) || [],
    }));
  }, []);

  const updateIndicator = useCallback((index: number, updates: any) => {
    setStrategy(prev => ({
      ...prev,
      indicators: prev.indicators?.map((ind, i) => 
        i === index ? { ...ind, ...updates } : ind
      ) || [],
    }));
  }, []);

  const addRule = useCallback((rule: any) => {
    setStrategy(prev => ({
      ...prev,
      rules: [...(prev.rules || []), rule],
    }));
  }, []);

  const removeRule = useCallback((index: number) => {
    setStrategy(prev => ({
      ...prev,
      rules: prev.rules?.filter((_, i) => i !== index) || [],
    }));
  }, []);

  const updateRule = useCallback((index: number, updates: any) => {
    setStrategy(prev => ({
      ...prev,
      rules: prev.rules?.map((rule, i) => 
        i === index ? { ...rule, ...updates } : rule
      ) || [],
    }));
  }, []);

  const validate = useCallback(() => {
    const errors: string[] = [];

    if (!strategy.name?.trim()) {
      errors.push('Strategy name is required');
    }

    if (!strategy.indicators || strategy.indicators.length === 0) {
      errors.push('At least one indicator is required');
    }

    if (!strategy.rules || strategy.rules.length === 0) {
      errors.push('At least one rule is required');
    }

    if (strategy.rules) {
      const validation = StrategyService.validateRules(strategy.rules as any);
      errors.push(...validation.errors);
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [strategy]);

  const reset = useCallback(() => {
    setStrategy({
      name: '',
      description: '',
      type: 'technical',
      indicators: [],
      rules: [],
      riskManagement: {},
      isActive: true,
    });
    setValidationErrors([]);
  }, []);

  return {
    strategy,
    validationErrors,
    isValid: validationErrors.length === 0,
    updateStrategy,
    addIndicator,
    removeIndicator,
    updateIndicator,
    addRule,
    removeRule,
    updateRule,
    validate,
    reset,
  };
}

// Hook to format strategy performance
export function useStrategyPerformance(strategy?: Strategy) {
  if (!strategy?.backtestResults) {
    return null;
  }

  return StrategyService.formatPerformance(strategy.backtestResults);
}

// Hook to get strategy complexity
export function useStrategyComplexity(strategy?: Strategy) {
  if (!strategy) return null;

  return {
    level: StrategyService.getComplexityLevel(strategy),
    indicatorCount: strategy.indicators.filter(i => i.enabled).length,
    ruleCount: strategy.rules.filter(r => r.enabled).length,
    totalWeight: StrategyService.calculateTotalWeight(strategy.indicators),
  };
}
