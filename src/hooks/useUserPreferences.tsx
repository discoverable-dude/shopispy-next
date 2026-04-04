"use client";

import { useState, useEffect } from 'react';

interface UserPreferences {
  recentSearches: string[];
  defaultFilters: {
    storeFilter: string;
    searchTerm: string;
  };
  exportFormat: 'csv' | 'xlsx' | 'json';
  notificationSettings: {
    emailAlerts: boolean;
    browserNotifications: boolean;
  };
}

const DEFAULT_PREFERENCES: UserPreferences = {
  recentSearches: [],
  defaultFilters: {
    storeFilter: 'all',
    searchTerm: '',
  },
  exportFormat: 'csv',
  notificationSettings: {
    emailAlerts: true,
    browserNotifications: false,
  },
};

const STORAGE_KEY = 'shopispy-user-preferences';

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    }
  }, []);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
  };

  const addRecentSearch = (search: string) => {
    if (!search.trim()) return;

    const newSearches = [
      search,
      ...preferences.recentSearches.filter(s => s !== search)
    ].slice(0, 10); // Keep only last 10 searches

    updatePreferences({ recentSearches: newSearches });
  };

  const clearRecentSearches = () => {
    updatePreferences({ recentSearches: [] });
  };

  return {
    preferences,
    updatePreferences,
    addRecentSearch,
    clearRecentSearches,
  };
}
