import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  MarketDataService,
  MarketDataRequest,
  MarketDataResponse,
  Candle,
  TickerData,
  OrderBook,
} from '@/services/market-data.service';

const USE_MOCK_MARKET_DATA =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_USE_MARKET_MOCKS === 'true';

const DEFAULT_LIMIT = 300;

const buildCandleQueryKey = (request: MarketDataRequest | null) => {
  if (!request) {
    return ['market-candles', 'inactive'];
  }

  return [
    'market-candles',
    request.symbol,
    request.exchange,
    request.timeframe,
    request.limit ?? DEFAULT_LIMIT,
    request.start ?? null,
    request.end ?? null,
  ];
};

// Hook to fetch historical candles
export function useMarketCandles(
  request: MarketDataRequest | null,
  enabled: boolean = true
) {
  const queryKey = useMemo(() => buildCandleQueryKey(request), [request]);

  return useQuery<MarketDataResponse, Error>({
    queryKey,
    queryFn: async () => {
      if (!request) throw new Error('No request provided');
      
      // If backend is not available, use mock data
      try {
        return await MarketDataService.getCandles(request);
      } catch (error) {
        if (!USE_MOCK_MARKET_DATA) {
          throw error instanceof Error
            ? error
            : new Error('Failed to load market candles');
        }

        console.warn('Falling back to mock candles due to API error:', error);
        const mockCandles = MarketDataService.generateMockCandles(
          request.symbol,
          request.timeframe,
          request.limit || 100
        );
        
        return {
          symbol: request.symbol,
          exchange: request.exchange,
          timeframe: request.timeframe,
          candles: mockCandles,
          metadata: {
            firstTimestamp: new Date(mockCandles[0].time * 1000).toISOString(),
            lastTimestamp: new Date(mockCandles[mockCandles.length - 1].time * 1000).toISOString(),
            count: mockCandles.length,
          },
        };
      }
    },
    enabled: enabled && !!request,
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook to fetch ticker data
export function useTicker(
  symbol: string | null,
  exchange: string | null,
  enabled: boolean = true
) {
  return useQuery<TickerData, Error>({
    queryKey: ['ticker', symbol, exchange],
    queryFn: () => {
      if (!symbol || !exchange) throw new Error('Symbol and exchange required');
      return MarketDataService.getTicker(symbol, exchange).catch((error) => {
        if (!USE_MOCK_MARKET_DATA) {
          throw error instanceof Error ? error : new Error('Failed to load ticker');
        }

        console.warn('Falling back to mock ticker due to API error:', error);
        const mockCandle = MarketDataService.generateMockCandles(symbol, '1m', 2).pop();
        if (!mockCandle) {
          throw new Error('Unable to generate mock ticker data');
        }

        return {
          symbol,
          exchange,
          price: mockCandle.close,
          change24h: 0,
          changePercent24h: 0,
          volume24h: mockCandle.volume,
          high24h: mockCandle.high,
          low24h: mockCandle.low,
          timestamp: new Date(mockCandle.time * 1000).toISOString(),
        } satisfies TickerData;
      });
    },
    enabled: enabled && !!symbol && !!exchange,
    staleTime: 5 * 1000, // 5 seconds
    cacheTime: 30 * 1000, // 30 seconds
    refetchInterval: 5000, // Refetch every 5 seconds
  });
}

// Hook to fetch order book
export function useOrderBook(
  symbol: string | null,
  exchange: string | null,
  depth: number = 20,
  enabled: boolean = true
) {
  return useQuery<OrderBook, Error>({
    queryKey: ['orderbook', symbol, exchange, depth],
    queryFn: () => {
      if (!symbol || !exchange) throw new Error('Symbol and exchange required');
      return MarketDataService.getOrderBook(symbol, exchange, depth).catch((error) => {
        if (!USE_MOCK_MARKET_DATA) {
          throw error instanceof Error ? error : new Error('Failed to load order book');
        }

        console.warn('Falling back to mock order book due to API error:', error);
        const midpoint = MarketDataService.generateMockCandles(symbol, '1m', 1)[0]?.close ?? 0;
        const bids = Array.from({ length: depth }, (_, idx) => ({
          price: parseFloat((midpoint * (1 - 0.001 * (idx + 1))).toFixed(2)),
          size: parseFloat((Math.random() * 2 + 0.5).toFixed(4)),
        }));
        const asks = Array.from({ length: depth }, (_, idx) => ({
          price: parseFloat((midpoint * (1 + 0.001 * (idx + 1))).toFixed(2)),
          size: parseFloat((Math.random() * 2 + 0.5).toFixed(4)),
        }));

        return {
          symbol,
          exchange,
          bids,
          asks,
          timestamp: new Date().toISOString(),
        } satisfies OrderBook;
      });
    },
    enabled: enabled && !!symbol && !!exchange,
    staleTime: 1 * 1000, // 1 second
    cacheTime: 5 * 1000, // 5 seconds
    refetchInterval: 2000, // Refetch every 2 seconds
  });
}

// Hook for real-time price updates
export function useLivePrices(
  symbol: string | null,
  exchange: string | null,
  enabled: boolean = true
) {
  const [currentPrice, setCurrentPrice] = useState<TickerData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!enabled || !symbol || !exchange || USE_MOCK_MARKET_DATA) {
      return;
    }

    // Subscribe to price updates
    try {
      unsubscribeRef.current = MarketDataService.subscribeToPrices(
        symbol,
        exchange,
        (price) => {
          setCurrentPrice(price);
          setIsConnected(true);
        }
      );
    } catch (error) {
      console.error('Failed to subscribe to prices:', error);
      setIsConnected(false);
    }

    // Cleanup on unmount or dependency change
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      setIsConnected(false);
    };
  }, [symbol, exchange, enabled]);

  return {
    price: currentPrice,
    isConnected,
    disconnect: () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
        setIsConnected(false);
      }
    },
  };
}

// Hook for real-time candle updates
export function useLiveCandles(
  symbol: string | null,
  exchange: string | null,
  timeframe: string | null,
  onNewCandle?: (candle: Candle) => void,
  enabled: boolean = true
) {
  const [latestCandle, setLatestCandle] = useState<Candle | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !symbol || !exchange || !timeframe || USE_MOCK_MARKET_DATA) {
      setIsConnected(false);
      return;
    }

    // Subscribe to candle updates
    try {
      unsubscribeRef.current = MarketDataService.subscribeToCandles(
        symbol,
        exchange,
        timeframe,
        (candle) => {
          setLatestCandle(candle);
          setIsConnected(true);
          
          // Call callback if provided
          if (onNewCandle) {
            onNewCandle(candle);
          }

          // Update cache with new candle
          queryClient.setQueryData<MarketDataResponse>(
            buildCandleQueryKey(
              symbol && exchange && timeframe
                ? { symbol, exchange, timeframe, limit: DEFAULT_LIMIT }
                : null
            ),
            (old) => {
              if (!old) return old;
              
              // Check if candle already exists (update) or is new
              const existingIndex = old.candles.findIndex(
                c => c.time === candle.time
              );
              
              let newCandles: Candle[];
              if (existingIndex >= 0) {
                // Update existing candle
                newCandles = [...old.candles];
                newCandles[existingIndex] = candle;
              } else {
                // Add new candle and remove oldest if limit exceeded
                newCandles = [...old.candles, candle];
                if (newCandles.length > 500) {
                  newCandles.shift();
                }
              }

              return {
                ...old,
                candles: newCandles,
                metadata: {
                  ...old.metadata,
                  lastTimestamp: new Date(candle.time * 1000).toISOString(),
                  count: newCandles.length,
                },
              };
            }
          );
        }
      );
    } catch (error) {
      console.error('Failed to subscribe to candles:', error);
      setIsConnected(false);
    }

    // Cleanup
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      setIsConnected(false);
    };
  }, [symbol, exchange, timeframe, enabled, queryClient]);

  return {
    latestCandle,
    isConnected,
    disconnect: () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
        setIsConnected(false);
      }
    },
  };
}

// Hook to manage chart data with real-time updates
export function useChartData(
  symbol: string | null,
  exchange: string | null,
  timeframe: string | null,
  enabled: boolean = true
) {
  const [candles, setCandles] = useState<Candle[]>([]);
  
  // Fetch historical data
  const { data: historicalData, isLoading, error } = useMarketCandles(
    symbol && exchange && timeframe
      ? { symbol, exchange, timeframe, limit: DEFAULT_LIMIT }
      : null,
    enabled
  );

  // Subscribe to live updates
  const { latestCandle, isConnected } = useLiveCandles(
    symbol,
    exchange,
    timeframe,
    undefined,
    enabled
  );

  // Update candles when historical data loads
  useEffect(() => {
    if (historicalData?.candles) {
      setCandles(historicalData.candles);
    }
  }, [historicalData]);

  // Update candles with live data
  useEffect(() => {
    if (!latestCandle || candles.length === 0) return;

    setCandles(prev => {
      const existingIndex = prev.findIndex(c => c.time === latestCandle.time);
      
      if (existingIndex >= 0) {
        // Update existing candle
        const updated = [...prev];
        updated[existingIndex] = latestCandle;
        return updated;
      } else {
        // Add new candle
        const updated = [...prev, latestCandle];
        // Keep maximum of 500 candles
        if (updated.length > 500) {
          updated.shift();
        }
        return updated;
      }
    });
  }, [latestCandle]);

  return {
    candles,
    isLoading,
    error,
    isLive: isConnected,
    metadata: historicalData?.metadata,
  };
}

// Hook to format price changes
export function usePriceFormatting() {
  const formatPrice = useCallback((price: number, symbol: string): string => {
    // Crypto typically has more decimal places
    const isCrypto = ['BTC', 'ETH', 'LTC', 'XRP'].some(s => symbol.includes(s));
    const decimals = isCrypto ? 2 : 2;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(price);
  }, []);

  const formatChange = useCallback((change: number, isPercent: boolean = true): string => {
    const prefix = change >= 0 ? '+' : '';
    if (isPercent) {
      return `${prefix}${change.toFixed(2)}%`;
    }
    return `${prefix}${formatPrice(change, 'USD')}`;
  }, [formatPrice]);

  const getChangeColor = useCallback((change: number): string => {
    if (change > 0) return '#00FF88'; // Green
    if (change < 0) return '#FF3366'; // Red
    return '#B8B8BD'; // Gray
  }, []);

  return { formatPrice, formatChange, getChangeColor };
}
