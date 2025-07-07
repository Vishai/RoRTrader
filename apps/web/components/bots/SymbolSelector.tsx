import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Symbol {
  symbol: string;
  name: string;
  type: 'crypto' | 'stock';
  exchange: string;
  popular?: boolean;
}

// Popular symbols for quick access
const POPULAR_SYMBOLS: Symbol[] = [
  // Crypto
  { symbol: 'BTC-USD', name: 'Bitcoin', type: 'crypto', exchange: 'coinbase', popular: true },
  { symbol: 'ETH-USD', name: 'Ethereum', type: 'crypto', exchange: 'coinbase', popular: true },
  { symbol: 'SOL-USD', name: 'Solana', type: 'crypto', exchange: 'coinbase', popular: true },
  { symbol: 'MATIC-USD', name: 'Polygon', type: 'crypto', exchange: 'coinbase', popular: true },
  
  // Stocks
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', exchange: 'alpaca', popular: true },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', exchange: 'alpaca', popular: true },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'stock', exchange: 'alpaca', popular: true },
  { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'stock', exchange: 'alpaca', popular: true },
];

// All available symbols (in production, this would come from an API)
const ALL_SYMBOLS: Symbol[] = [
  ...POPULAR_SYMBOLS,
  // Additional crypto
  { symbol: 'ADA-USD', name: 'Cardano', type: 'crypto', exchange: 'coinbase' },
  { symbol: 'DOT-USD', name: 'Polkadot', type: 'crypto', exchange: 'coinbase' },
  { symbol: 'LINK-USD', name: 'Chainlink', type: 'crypto', exchange: 'coinbase' },
  { symbol: 'UNI-USD', name: 'Uniswap', type: 'crypto', exchange: 'coinbase' },
  { symbol: 'AVAX-USD', name: 'Avalanche', type: 'crypto', exchange: 'coinbase' },
  
  // Additional stocks
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', exchange: 'alpaca' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', exchange: 'alpaca' },
  { symbol: 'META', name: 'Meta Platforms', type: 'stock', exchange: 'alpaca' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', type: 'stock', exchange: 'alpaca' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', type: 'stock', exchange: 'alpaca' },
];

interface SymbolSelectorProps {
  value?: string;
  onChange: (symbol: string) => void;
  assetType?: 'crypto' | 'stock' | 'all';
  exchange?: string;
  className?: string;
  placeholder?: string;
}

export function SymbolSelector({
  value,
  onChange,
  assetType = 'all',
  exchange,
  className,
  placeholder = 'Select symbol...'
}: SymbolSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter symbols based on asset type and exchange
  const filteredSymbols = ALL_SYMBOLS.filter(symbol => {
    if (assetType !== 'all' && symbol.type !== assetType) return false;
    if (exchange && symbol.exchange !== exchange) return false;
    return true;
  });

  const selectedSymbol = filteredSymbols.find(s => s.symbol === value);

  // Group symbols by type
  const groupedSymbols = filteredSymbols.reduce((acc, symbol) => {
    if (!acc[symbol.type]) {
      acc[symbol.type] = [];
    }
    acc[symbol.type].push(symbol);
    return acc;
  }, {} as Record<string, Symbol[]>);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between',
            !value && 'text-muted-foreground',
            className
          )}
        >
          {selectedSymbol ? (
            <div className="flex items-center gap-2">
              <span className="font-medium">{selectedSymbol.symbol}</span>
              <span className="text-muted-foreground text-sm">
                {selectedSymbol.name}
              </span>
              {selectedSymbol.popular && (
                <Badge variant="secondary" className="ml-auto">Popular</Badge>
              )}
            </div>
          ) : (
            <span>{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput
            placeholder="Search symbols..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandEmpty>No symbol found.</CommandEmpty>
          
          {/* Popular symbols section */}
          {!searchQuery && (
            <CommandGroup heading="Popular">
              {POPULAR_SYMBOLS
                .filter(symbol => {
                  if (assetType !== 'all' && symbol.type !== assetType) return false;
                  if (exchange && symbol.exchange !== exchange) return false;
                  return true;
                })
                .map((symbol) => (
                  <CommandItem
                    key={symbol.symbol}
                    value={symbol.symbol}
                    onSelect={() => {
                      onChange(symbol.symbol);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === symbol.symbol ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="font-medium">{symbol.symbol}</span>
                        <span className="text-muted-foreground text-sm ml-2">
                          {symbol.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={symbol.type === 'crypto' ? 'default' : 'secondary'}>
                          {symbol.type}
                        </Badge>
                      </div>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          )}

          {/* All symbols grouped by type */}
          {Object.entries(groupedSymbols).map(([type, symbols]) => (
            <CommandGroup key={type} heading={type === 'crypto' ? 'Cryptocurrency' : 'Stocks'}>
              {symbols
                .filter(symbol => 
                  !searchQuery || 
                  symbol.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  symbol.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((symbol) => (
                  <CommandItem
                    key={symbol.symbol}
                    value={symbol.symbol}
                    onSelect={() => {
                      onChange(symbol.symbol);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === symbol.symbol ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="font-medium">{symbol.symbol}</span>
                        <span className="text-muted-foreground text-sm ml-2">
                          {symbol.name}
                        </span>
                      </div>
                      {symbol.popular && (
                        <Badge variant="outline" className="ml-2">
                          Popular
                        </Badge>
                      )}
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          ))}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
