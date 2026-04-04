"use client";

import { useState, useEffect } from 'react';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

export interface PricingData {
  lite: { [key: string]: number };
  starter: { [key: string]: number };
  pro: { [key: string]: number };
}

const CURRENCY_MAP: { [key: string]: CurrencyInfo } = {
  'USD': { code: 'USD', symbol: '$', name: 'US Dollar' },
  'GBP': { code: 'GBP', symbol: '£', name: 'British Pound' },
  'EUR': { code: 'EUR', symbol: '€', name: 'Euro' }
};

// Base prices in USD (cents)
const BASE_PRICING: PricingData = {
  lite: { USD: 900, GBP: 900, EUR: 900 }, // $9, £9, €9
  starter: { USD: 2400, GBP: 1900, EUR: 2200 }, // $24, £19, €22
  pro: { USD: 6200, GBP: 4900, EUR: 5700 } // $62, £49, €57
};

// Country to currency mapping
const COUNTRY_CURRENCY_MAP: { [key: string]: string } = {
  'US': 'USD', 'CA': 'USD', 'MX': 'USD',
  'GB': 'GBP', 'IE': 'GBP',
  'DE': 'EUR', 'FR': 'EUR', 'ES': 'EUR', 'IT': 'EUR', 'NL': 'EUR',
  'AT': 'EUR', 'BE': 'EUR', 'FI': 'EUR', 'PT': 'EUR', 'GR': 'EUR',
  'LU': 'EUR', 'CY': 'EUR', 'MT': 'EUR', 'SI': 'EUR', 'SK': 'EUR',
  'EE': 'EUR', 'LV': 'EUR', 'LT': 'EUR'
};

export function useCurrency() {
  const [currency, setCurrency] = useState<CurrencyInfo>(CURRENCY_MAP.USD);
  const [isLoading, setIsLoading] = useState(true);
  const [country, setCountry] = useState<string>('');

  useEffect(() => {
    const detectCurrency = async () => {
      try {
        // Check if currency is already stored in localStorage
        const storedCurrency = localStorage.getItem('shopispy-currency');
        if (storedCurrency && CURRENCY_MAP[storedCurrency]) {
          setCurrency(CURRENCY_MAP[storedCurrency]);
          setIsLoading(false);
          return;
        }

        // Detect using geo IP
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();

        if (data.country_code) {
          setCountry(data.country_code);
          const detectedCurrency = COUNTRY_CURRENCY_MAP[data.country_code] || 'USD';
          const currencyInfo = CURRENCY_MAP[detectedCurrency];

          setCurrency(currencyInfo);
          localStorage.setItem('shopispy-currency', detectedCurrency);
        }
      } catch (error) {
        console.error('Failed to detect currency:', error);
        // Fallback to USD
        setCurrency(CURRENCY_MAP.USD);
      } finally {
        setIsLoading(false);
      }
    };

    detectCurrency();
  }, []);

  const changeCurrency = (currencyCode: string) => {
    if (CURRENCY_MAP[currencyCode]) {
      setCurrency(CURRENCY_MAP[currencyCode]);
      localStorage.setItem('shopispy-currency', currencyCode);
    }
  };

  const formatPrice = (plan: 'lite' | 'starter' | 'pro'): string => {
    const amount = BASE_PRICING[plan][currency.code];
    const price = amount / 100; // Convert from cents
    return `${currency.symbol}${price}`;
  };

  const getPriceAmount = (plan: 'lite' | 'starter' | 'pro'): number => {
    return BASE_PRICING[plan][currency.code];
  };

  return {
    currency,
    isLoading,
    country,
    formatPrice,
    getPriceAmount,
    changeCurrency,
    availableCurrencies: Object.values(CURRENCY_MAP)
  };
}
