"use client";

import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';

interface AutocompleteOptions<T> {
  data: T[];
  keys: string[];
  threshold?: number;
  limit?: number;
}

export function useAutocomplete<T>({
  data,
  keys,
  threshold = 0.3,
  limit = 10
}: AutocompleteOptions<T>) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);

  const fuse = useMemo(() => {
    return new Fuse(data, {
      keys,
      threshold,
      includeScore: true,
      includeMatches: true,
    });
  }, [data, keys, threshold]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults = fuse.search(query, { limit });
    setResults(searchResults.map(result => result.item));
  }, [query, fuse, limit]);

  return {
    query,
    setQuery,
    results,
    hasResults: results.length > 0,
  };
}
