"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Crown, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getTierConfig, TierName } from "@/config/tierConfig";

interface UpgradePromptProps {
  feature: string;
  requiredTier?: TierName;
  description?: string;
  compact?: boolean;
  className?: string;
}

export const UpgradePrompt = ({
  feature,
  requiredTier,
  description,
  compact = false,
  className = '',
}: UpgradePromptProps) => {
  const { subscribed, subscriptionTier = 'free' } = useAuth();
  const currentConfig = getTierConfig(subscriptionTier, subscribed);
  const nextTierName = requiredTier
    ? requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)
    : currentConfig.nextTier
    ? currentConfig.nextTier.charAt(0).toUpperCase() + currentConfig.nextTier.slice(1)
    : 'Pro';
  const nextPrice = requiredTier
    ? (() => { const prices: Record<string, string> = { lite: '£9', starter: '£19', pro: '£49', enterprise: '£99+' }; return prices[requiredTier] || '£9'; })()
    : currentConfig.nextPrice || '£9';

  if (compact) {
    return (
      <div className={`flex items-center gap-2 text-xs text-muted-foreground ${className}`}>
        <Lock className="h-3 w-3 shrink-0" />
        <span>{feature}</span>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs text-primary"
          onClick={() => (window.location.href = '/pricing')}
        >
          Upgrade to {nextTierName}
        </Button>
      </div>
    );
  }

  return (
    <Alert className={`border-muted bg-muted/30 ${className}`}>
      <Lock className="h-4 w-4 text-muted-foreground" />
      <AlertDescription>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{feature}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => (window.location.href = '/pricing')}
            className="shrink-0 gap-1.5"
          >
            <Crown className="h-3.5 w-3.5" />
            {nextTierName} — {nextPrice}/mo
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

/** Inline lock badge for individual features */
export const LockedBadge = ({ tierName }: { tierName: string }) => (
  <Badge
    variant="outline"
    className="text-xs gap-1 cursor-pointer hover:bg-muted"
    onClick={() => (window.location.href = '/pricing')}
  >
    <Lock className="h-2.5 w-2.5" />
    {tierName}+
  </Badge>
);

/** Usage bar with limit indicator */
interface UsageBarProps {
  label: string;
  current: number;
  limit: number; // -1 = unlimited
  className?: string;
}

export const UsageBar = ({ label, current, limit, className = '' }: UsageBarProps) => {
  if (limit === -1) {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <Badge variant="secondary" className="text-xs">Unlimited</Badge>
        </div>
      </div>
    );
  }

  const percentage = Math.min((current / limit) * 100, 100);
  const isAtLimit = current >= limit;
  const isNearLimit = percentage >= 80;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-medium ${isAtLimit ? 'text-destructive' : isNearLimit ? 'text-orange-600' : ''}`}>
          {current}/{limit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isAtLimit ? 'bg-destructive' : isNearLimit ? 'bg-orange-500' : 'bg-primary'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isAtLimit && (
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs text-destructive"
          onClick={() => (window.location.href = '/pricing')}
        >
          Limit reached — Upgrade now
        </Button>
      )}
    </div>
  );
};
