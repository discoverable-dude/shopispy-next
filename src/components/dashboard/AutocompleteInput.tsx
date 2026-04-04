"use client";

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAutocomplete } from '@/hooks/useAutocomplete';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface AutocompleteInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  suggestions?: string[];
  className?: string;
  disabled?: boolean;
}

export const AutocompleteInput = ({
  placeholder = "Search...",
  value,
  onChange,
  onSubmit,
  suggestions = [],
  className,
  disabled
}: AutocompleteInputProps) => {
  const [open, setOpen] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const { preferences, addRecentSearch } = useUserPreferences();

  const { query, setQuery, results } = useAutocomplete({
    data: suggestions.map(s => ({ value: s })),
    keys: ['value'],
    threshold: 0.4,
    limit: 8
  });

  const allSuggestions = [
    ...preferences.recentSearches.map(search => ({ type: 'recent', value: search })),
    ...results.map(result => ({ type: 'suggestion', value: result.value }))
  ].slice(0, 10);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    addRecentSearch(selectedValue);
    setOpen(false);
    onSubmit?.(selectedValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      addRecentSearch(value);
      onSubmit?.(value);
      setOpen(false);
    }
  };

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setQuery(newValue);
    if (newValue.length > 0) {
      setOpen(true);
    }
  };

  const showSuggestions = (inputFocused || open) && (value.length > 0 || preferences.recentSearches.length > 0);

  return (
    <div className={cn("relative", className)}>
      <Popover open={showSuggestions} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <form onSubmit={handleSubmit}>
              <Input
                value={value}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setTimeout(() => setInputFocused(false), 150)}
                placeholder={placeholder}
                disabled={disabled}
                className="pr-10"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {value && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted"
                    onClick={() => {
                      onChange('');
                      setQuery('');
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-muted"
                  disabled={disabled}
                >
                  <Search className="h-3 w-3" />
                </Button>
              </div>
            </form>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandList>
              {allSuggestions.length === 0 ? (
                <CommandEmpty>No suggestions found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {allSuggestions.map((item, index) => (
                    <CommandItem
                      key={`${item.type}-${index}`}
                      value={item.value}
                      onSelect={() => handleSelect(item.value)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {item.type === 'recent' ? (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Search className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="flex-1 truncate">{item.value}</span>
                      {item.type === 'recent' && (
                        <span className="text-xs text-muted-foreground">Recent</span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
