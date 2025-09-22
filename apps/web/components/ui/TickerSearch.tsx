'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from './Button';

interface Ticker {
  symbol: string;
  name: string;
  exchange?: string;
  type?: string;
  price?: number;
  change?: number;
  changePercent?: number;
}

interface TickerSearchProps {
  value: string;
  onChange: (symbol: string) => void;
  placeholder?: string;
  popularTickers?: string[];
  onSearch?: (query: string) => Promise<Ticker[]>;
  className?: string;
}

// Default popular tickers with full names
const defaultPopularTickers: Ticker[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock' },
  { symbol: 'META', name: 'Meta Platforms Inc.', type: 'stock' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'stock' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'stock' },
  { symbol: 'V', name: 'Visa Inc.', type: 'stock' },
  { symbol: 'WMT', name: 'Walmart Inc.', type: 'stock' },
  { symbol: 'BTC-USD', name: 'Bitcoin', type: 'crypto' },
  { symbol: 'ETH-USD', name: 'Ethereum', type: 'crypto' },
];

// Comprehensive ticker database for client-side search
const tickerDatabase: Ticker[] = [
  ...defaultPopularTickers,
  { symbol: 'JNJ', name: 'Johnson & Johnson', type: 'stock' },
  { symbol: 'PG', name: 'Procter & Gamble Co.', type: 'stock' },
  { symbol: 'MA', name: 'Mastercard Inc.', type: 'stock' },
  { symbol: 'HD', name: 'Home Depot Inc.', type: 'stock' },
  { symbol: 'DIS', name: 'Walt Disney Co.', type: 'stock' },
  { symbol: 'BAC', name: 'Bank of America Corp.', type: 'stock' },
  { symbol: 'NFLX', name: 'Netflix Inc.', type: 'stock' },
  { symbol: 'ADBE', name: 'Adobe Inc.', type: 'stock' },
  { symbol: 'CRM', name: 'Salesforce Inc.', type: 'stock' },
  { symbol: 'PFE', name: 'Pfizer Inc.', type: 'stock' },
  { symbol: 'INTC', name: 'Intel Corporation', type: 'stock' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', type: 'stock' },
  { symbol: 'ORCL', name: 'Oracle Corporation', type: 'stock' },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.', type: 'stock' },
  { symbol: 'VZ', name: 'Verizon Communications', type: 'stock' },
  { symbol: 'T', name: 'AT&T Inc.', type: 'stock' },
  { symbol: 'XOM', name: 'Exxon Mobil Corp.', type: 'stock' },
  { symbol: 'CVX', name: 'Chevron Corporation', type: 'stock' },
  { symbol: 'KO', name: 'Coca-Cola Co.', type: 'stock' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', type: 'stock' },
  { symbol: 'MCD', name: 'McDonald\'s Corp.', type: 'stock' },
  { symbol: 'NKE', name: 'Nike Inc.', type: 'stock' },
  { symbol: 'BA', name: 'Boeing Co.', type: 'stock' },
  { symbol: 'GE', name: 'General Electric Co.', type: 'stock' },
  { symbol: 'F', name: 'Ford Motor Co.', type: 'stock' },
  { symbol: 'GM', name: 'General Motors Co.', type: 'stock' },
  { symbol: 'UBER', name: 'Uber Technologies Inc.', type: 'stock' },
  { symbol: 'LYFT', name: 'Lyft Inc.', type: 'stock' },
  { symbol: 'SQ', name: 'Block Inc.', type: 'stock' },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.', type: 'stock' },
  { symbol: 'SPOT', name: 'Spotify Technology', type: 'stock' },
  { symbol: 'SNAP', name: 'Snap Inc.', type: 'stock' },
  { symbol: 'PINS', name: 'Pinterest Inc.', type: 'stock' },
  { symbol: 'TWTR', name: 'Twitter Inc.', type: 'stock' },
  { symbol: 'BABA', name: 'Alibaba Group', type: 'stock' },
  { symbol: 'TSM', name: 'Taiwan Semiconductor', type: 'stock' },
  { symbol: 'NIO', name: 'NIO Inc.', type: 'stock' },
  { symbol: 'PLTR', name: 'Palantir Technologies', type: 'stock' },
  { symbol: 'COIN', name: 'Coinbase Global Inc.', type: 'stock' },
  { symbol: 'RBLX', name: 'Roblox Corporation', type: 'stock' },
  { symbol: 'HOOD', name: 'Robinhood Markets', type: 'stock' },
  { symbol: 'ZM', name: 'Zoom Video Communications', type: 'stock' },
  { symbol: 'DOCU', name: 'DocuSign Inc.', type: 'stock' },
  { symbol: 'SHOP', name: 'Shopify Inc.', type: 'stock' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', type: 'etf' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'etf' },
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF', type: 'etf' },
  { symbol: 'DIA', name: 'SPDR Dow Jones Industrial', type: 'etf' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market', type: 'etf' },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'etf' },
  { symbol: 'GLD', name: 'SPDR Gold Trust', type: 'etf' },
  { symbol: 'SLV', name: 'iShares Silver Trust', type: 'etf' },
  { symbol: 'ARKK', name: 'ARK Innovation ETF', type: 'etf' },
  { symbol: 'XLF', name: 'Financial Select Sector SPDR', type: 'etf' },
  { symbol: 'XLK', name: 'Technology Select Sector SPDR', type: 'etf' },
  { symbol: 'BNB-USD', name: 'Binance Coin', type: 'crypto' },
  { symbol: 'XRP-USD', name: 'XRP', type: 'crypto' },
  { symbol: 'ADA-USD', name: 'Cardano', type: 'crypto' },
  { symbol: 'SOL-USD', name: 'Solana', type: 'crypto' },
  { symbol: 'DOGE-USD', name: 'Dogecoin', type: 'crypto' },
  { symbol: 'DOT-USD', name: 'Polkadot', type: 'crypto' },
  { symbol: 'AVAX-USD', name: 'Avalanche', type: 'crypto' },
  { symbol: 'MATIC-USD', name: 'Polygon', type: 'crypto' },
  { symbol: 'LTC-USD', name: 'Litecoin', type: 'crypto' },
];

export const TickerSearch: React.FC<TickerSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search ticker...',
  popularTickers,
  onSearch,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Ticker[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Default search function using local database
  const defaultSearch = useCallback(async (searchQuery: string): Promise<Ticker[]> => {
    const lowerQuery = searchQuery.toLowerCase();

    if (!lowerQuery) {
      return defaultPopularTickers.slice(0, 10);
    }

    const results = tickerDatabase.filter(ticker =>
      ticker.symbol.toLowerCase().includes(lowerQuery) ||
      ticker.name.toLowerCase().includes(lowerQuery)
    );

    // Sort by relevance (symbol match first, then name match)
    results.sort((a, b) => {
      const aSymbolMatch = a.symbol.toLowerCase().startsWith(lowerQuery);
      const bSymbolMatch = b.symbol.toLowerCase().startsWith(lowerQuery);

      if (aSymbolMatch && !bSymbolMatch) return -1;
      if (!aSymbolMatch && bSymbolMatch) return 1;

      return a.symbol.localeCompare(b.symbol);
    });

    return results.slice(0, 15);
  }, []);

  // Search handler
  const handleSearch = useCallback(async (searchQuery: string) => {
    setIsSearching(true);
    try {
      const searchFunction = onSearch || defaultSearch;
      const results = await searchFunction(searchQuery);
      setSuggestions(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, [onSearch, defaultSearch]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        } else if (query) {
          // Allow custom ticker entry
          onChange(query.toUpperCase());
          setQuery('');
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelect = (ticker: Ticker) => {
    onChange(ticker.symbol);
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const getTickerTypeColor = (type?: string) => {
    switch (type) {
      case 'crypto':
        return 'text-accent-warning';
      case 'etf':
        return 'text-accent-purple';
      default:
        return 'text-accent-primary';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 bg-background-elevated border border-border-default rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
        />
        {value && (
          <span className="absolute right-10 top-1/2 transform -translate-y-1/2 px-2 py-0.5 bg-accent-primary/20 text-accent-primary text-xs font-medium rounded">
            {value}
          </span>
        )}
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <X className="w-4 h-4 text-text-tertiary hover:text-text-secondary" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-background-elevated border border-border-default rounded-lg shadow-xl max-h-96 overflow-y-auto"
        >
          {isSearching ? (
            <div className="px-4 py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary mx-auto"></div>
              <p className="text-text-tertiary text-sm mt-2">Searching...</p>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              {!query && (
                <div className="px-4 py-2 text-xs text-text-tertiary font-medium uppercase tracking-wider">
                  Popular Tickers
                </div>
              )}
              {suggestions.map((ticker, index) => (
                <button
                  key={ticker.symbol}
                  onClick={() => handleSelect(ticker)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full px-4 py-3 flex items-center justify-between hover:bg-background-tertiary transition-colors ${
                    index === selectedIndex ? 'bg-background-tertiary' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-primary">
                          {ticker.symbol}
                        </span>
                        {ticker.type && (
                          <span className={`text-xs px-1.5 py-0.5 rounded ${getTickerTypeColor(ticker.type)} bg-current/10`}>
                            {ticker.type.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-text-secondary text-left">
                        {ticker.name}
                      </div>
                    </div>
                  </div>
                  {ticker.changePercent !== undefined && (
                    <div className="flex items-center gap-1">
                      {ticker.changePercent >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-accent-secondary" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-accent-danger" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          ticker.changePercent >= 0 ? 'text-accent-secondary' : 'text-accent-danger'
                        }`}
                      >
                        {ticker.changePercent >= 0 ? '+' : ''}
                        {ticker.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  )}
                </button>
              ))}
              {query && (
                <div className="px-4 py-3 border-t border-border-default">
                  <button
                    onClick={() => {
                      onChange(query.toUpperCase());
                      setQuery('');
                      setIsOpen(false);
                    }}
                    className="text-sm text-accent-primary hover:text-accent-primary/80"
                  >
                    Use "{query.toUpperCase()}" as custom ticker
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-text-tertiary">No tickers found</p>
              {query && (
                <button
                  onClick={() => {
                    onChange(query.toUpperCase());
                    setQuery('');
                    setIsOpen(false);
                  }}
                  className="mt-2 text-sm text-accent-primary hover:text-accent-primary/80"
                >
                  Use "{query.toUpperCase()}" anyway
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TickerSearch;