"use client";

import { useEffect, useState } from 'react';
import { useAuth } from "@/components/providers/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getTierConfig, TierConfig, TierName } from "@/config/tierConfig";

export interface UsageData {
  stores: number;
  scrapes: number;
  exports: number;
}

export const useSubscriptionLimits = () => {
  const supabase = getSupabaseClient();
  const { user, subscribed, subscriptionTier = 'free' } = useAuth();
  const [usage, setUsage] = useState<UsageData>({ stores: 0, scrapes: 0, exports: 0 });

  const tierConfig = getTierConfig(subscriptionTier, subscribed);
  const tierName = (subscribed ? subscriptionTier?.toLowerCase() : 'free') as TierName;

  useEffect(() => {
    if (user) fetchUsage();
  }, [user]);

  const fetchUsage = async () => {
    if (!user) return;
    try {
      const [{ data: scrapes }, { data: hiddenStores }] = await Promise.all([
        supabase
          .from('user_scrapes')
          .select('store_url, scrape_date')
          .eq('user_id', user.id),
        supabase
          .from('user_hidden_stores')
          .select('store_url')
          .eq('user_id', user.id),
      ]);

      const normalizeUrl = (url: string) =>
        url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

      const hiddenStoreUrls = new Set((hiddenStores || []).map(s => normalizeUrl(s.store_url)));

      // Count only ACTIVE stores (not hidden) toward the store limit
      const activeStoreUrls = new Set(
        (scrapes || []).map(s => normalizeUrl(s.store_url)).filter(url => !hiddenStoreUrls.has(url))
      );

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const monthlyScrapes = (scrapes || []).filter(
        s => new Date(s.scrape_date) >= startOfMonth
      ).length;

      setUsage({ stores: activeStoreUrls.size, scrapes: monthlyScrapes, exports: 0 });
    } catch (error) {
      console.error('Error fetching usage:', error);
    }
  };

  const canUseFeature = (feature: 'stores' | 'scrapes' | 'exports') => {
    if (feature === 'exports') return tierConfig.limits.exports;
    if (feature === 'stores') {
      if (tierConfig.limits.stores === -1) return true;
      return usage.stores < tierConfig.limits.stores;
    }
    if (feature === 'scrapes') {
      if (tierConfig.limits.scrapesPerMonth === -1) return true;
      return usage.scrapes < tierConfig.limits.scrapesPerMonth;
    }
    return true;
  };

  const getLimit = (feature: 'stores' | 'scrapes') => {
    if (feature === 'stores') return tierConfig.limits.stores;
    if (feature === 'scrapes') return tierConfig.limits.scrapesPerMonth;
    return -1;
  };

  const getUpgradeMessage = (feature: string) => {
    const next = tierConfig.nextTier;
    const nextName = next ? next.charAt(0).toUpperCase() + next.slice(1) : 'Pro';
    const nextPrice = tierConfig.nextPrice || '£49';
    return {
      title: `${nextName} required`,
      description: `Upgrade to ${nextName} (${nextPrice}/mo) to access this feature`,
      action: () => (window.location.href = '/pricing'),
    };
  };

  return {
    usage,
    tierConfig,
    tierName,
    canUseFeature,
    getLimit,
    getUpgradeMessage,
    refreshUsage: fetchUsage,
  };
};

// Keep backward compat for the component import
export const SubscriptionLimits = () => null;
