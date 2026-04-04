// Centralized subscription tier configuration
// Single source of truth for all feature limits, gating, and pricing

export type TierName = 'free' | 'lite' | 'starter' | 'pro' | 'enterprise';

export interface TierLimits {
  stores: number;           // -1 = unlimited
  productsPerStore: number; // -1 = unlimited
  scrapesPerMonth: number;  // -1 = unlimited
  exports: boolean;
  scheduledExports: boolean;
  apiAccess: boolean;
}

export interface TierAlerts {
  priceAlerts: boolean;
  productAlerts: boolean;
  percentageThreshold: boolean;
  frequencies: string[];
  channels: string[];       // email, slack, webhook, sms
}

export interface TierData {
  analytics: boolean;        // Advanced analytics
  basicData: boolean;        // title, price, vendor
  fullData: boolean;         // descriptions, status, variants
  enhancedData: boolean;     // same as full
  completeData: boolean;     // SKUs, barcodes, metafields
  enterpriseData: boolean;   // all Shopify fields
}

export interface TierConfig {
  name: string;
  displayName: string;
  price: string;
  subtitle: string;
  limits: TierLimits;
  alerts: TierAlerts;
  data: TierData;
  nextTier: TierName | null;
  nextPrice: string | null;
}

export const TIER_CONFIG: Record<TierName, TierConfig> = {
  free: {
    name: 'free',
    displayName: 'Free',
    price: '£0',
    subtitle: 'Lead Gen / Hook',
    limits: {
      stores: 1,
      productsPerStore: -1,
      scrapesPerMonth: 10,
      exports: false,
      scheduledExports: false,
      apiAccess: false,
    },
    alerts: {
      priceAlerts: false,
      productAlerts: true,
      percentageThreshold: false,
      frequencies: ['weekly'],
      channels: ['email'],
    },
    data: {
      analytics: false,
      basicData: true,
      fullData: false,
      enhancedData: false,
      completeData: false,
      enterpriseData: false,
    },
    nextTier: 'lite',
    nextPrice: '£9',
  },
  lite: {
    name: 'lite',
    displayName: 'Lite',
    price: '£9',
    subtitle: 'Low-Barrier Upgrade',
    limits: {
      stores: 1,
      productsPerStore: 200,
      scrapesPerMonth: -1, // daily scraping
      exports: true,
      scheduledExports: false,
      apiAccess: false,
    },
    alerts: {
      priceAlerts: true,
      productAlerts: true,
      percentageThreshold: false,
      frequencies: ['daily'],
      channels: ['email'],
    },
    data: {
      analytics: false,
      basicData: true,
      fullData: true,
      enhancedData: false,
      completeData: false,
      enterpriseData: false,
    },
    nextTier: 'starter',
    nextPrice: '£19',
  },
  starter: {
    name: 'starter',
    displayName: 'Starter',
    price: '£19',
    subtitle: 'Perfect for Small Brands',
    limits: {
      stores: 2,
      productsPerStore: 500,
      scrapesPerMonth: -1,
      exports: true,
      scheduledExports: false,
      apiAccess: false,
    },
    alerts: {
      priceAlerts: true,
      productAlerts: true,
      percentageThreshold: false,
      frequencies: ['weekly'],
      channels: ['email'],
    },
    data: {
      analytics: false,
      basicData: true,
      fullData: true,
      enhancedData: true,
      completeData: false,
      enterpriseData: false,
    },
    nextTier: 'pro',
    nextPrice: '£49',
  },
  pro: {
    name: 'pro',
    displayName: 'Pro',
    price: '£49',
    subtitle: 'Growth-Stage eCommerce',
    limits: {
      stores: 10,
      productsPerStore: -1,
      scrapesPerMonth: -1,
      exports: true,
      scheduledExports: true,
      apiAccess: true,
    },
    alerts: {
      priceAlerts: true,
      productAlerts: true,
      percentageThreshold: true,
      frequencies: ['realtime', 'daily', 'weekly'],
      channels: ['email'],
    },
    data: {
      analytics: true,
      basicData: true,
      fullData: true,
      enhancedData: true,
      completeData: true,
      enterpriseData: false,
    },
    nextTier: 'enterprise',
    nextPrice: '£99+',
  },
  enterprise: {
    name: 'enterprise',
    displayName: 'Enterprise',
    price: '£99+',
    subtitle: 'Large Brands & Agencies',
    limits: {
      stores: -1,
      productsPerStore: -1,
      scrapesPerMonth: -1,
      exports: true,
      scheduledExports: true,
      apiAccess: true,
    },
    alerts: {
      priceAlerts: true,
      productAlerts: true,
      percentageThreshold: true,
      frequencies: ['realtime', 'hourly', 'daily', 'weekly'],
      channels: ['email', 'slack', 'webhook', 'sms'],
    },
    data: {
      analytics: true,
      basicData: true,
      fullData: true,
      enhancedData: true,
      completeData: true,
      enterpriseData: true,
    },
    nextTier: null,
    nextPrice: null,
  },
};

export const getTierConfig = (tier: string | null, subscribed: boolean): TierConfig => {
  if (!subscribed) return TIER_CONFIG.free;
  const key = (tier?.toLowerCase() || 'free') as TierName;
  return TIER_CONFIG[key] || TIER_CONFIG.free;
};

export const getNextTierConfig = (currentTier: TierName): TierConfig | null => {
  const config = TIER_CONFIG[currentTier];
  if (!config.nextTier) return null;
  return TIER_CONFIG[config.nextTier];
};

export const FREQUENCY_LABELS: Record<string, string> = {
  realtime: 'Real-time',
  hourly: 'Hourly',
  daily: 'Daily',
  weekly: 'Weekly',
};
