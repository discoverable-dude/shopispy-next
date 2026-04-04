"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Users, Star, Check } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getTierConfig, TierName } from "@/config/tierConfig";

const TIER_ICONS: Record<string, React.ReactNode> = {
  free: <Star className="h-5 w-5 text-green-600" />,
  lite: <Zap className="h-5 w-5 text-cyan-600" />,
  starter: <Zap className="h-5 w-5 text-blue-600" />,
  pro: <Crown className="h-5 w-5 text-orange-600" />,
  enterprise: <Users className="h-5 w-5 text-purple-600" />,
};

const TIER_COLORS: Record<string, { color: string; textColor: string; badgeColor: string }> = {
  free: { color: 'border-green-200 bg-green-50', textColor: 'text-green-800', badgeColor: 'bg-green-100 text-green-800' },
  lite: { color: 'border-cyan-200 bg-cyan-50', textColor: 'text-cyan-800', badgeColor: 'bg-cyan-100 text-cyan-800' },
  starter: { color: 'border-blue-200 bg-blue-50', textColor: 'text-blue-800', badgeColor: 'bg-blue-100 text-blue-800' },
  pro: { color: 'border-orange-200 bg-orange-50', textColor: 'text-orange-800', badgeColor: 'bg-orange-100 text-orange-800' },
  enterprise: { color: 'border-purple-200 bg-purple-50', textColor: 'text-purple-800', badgeColor: 'bg-purple-100 text-purple-800' },
};

export const PlanStatus = () => {
  const supabase = getSupabaseClient();
  const { user, subscribed, subscriptionTier = 'free' } = useAuth();

  if (!user) return null;

  const currentPlan = subscribed ? (subscriptionTier?.toLowerCase() ?? 'free') : 'free';
  const config = getTierConfig(subscriptionTier, subscribed);
  const colors = TIER_COLORS[currentPlan] || TIER_COLORS.free;
  const icon = TIER_ICONS[currentPlan] || TIER_ICONS.free;

  const features = [
    `${config.limits.stores === -1 ? 'Unlimited' : config.limits.stores} competitor store${config.limits.stores !== 1 ? 's' : ''}`,
    config.limits.scrapesPerMonth === -1 ? 'Unlimited scrapes' : `${config.limits.scrapesPerMonth} scrapes/month`,
    config.limits.exports ? 'CSV exports' : 'CSV export locked',
    config.alerts.priceAlerts ? 'Price alerts' : 'New product alerts only',
  ];

  return (
    <Card className={`${colors.color} border-2`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <CardTitle className={`text-lg ${colors.textColor}`}>
                {config.displayName} Plan
              </CardTitle>
              <Badge className={colors.badgeColor}>
                {subscribed ? 'Active Subscription' : 'Current Plan'}
              </Badge>
            </div>
          </div>
          {config.nextTier && (
            <Button
              onClick={() => window.location.href = '/pricing'}
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to {config.nextTier.charAt(0).toUpperCase() + config.nextTier.slice(1)}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className={`font-medium mb-2 ${colors.textColor}`}>Your Plan Includes:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {config.nextTier && (
            <div className="pt-3 border-t border-current/20">
              <div className="flex items-center justify-between text-sm">
                <span className={colors.textColor}>
                  Want more features? Upgrade to {config.nextTier.charAt(0).toUpperCase() + config.nextTier.slice(1)}
                </span>
                <span className="font-medium">
                  From {config.nextPrice}/mo
                </span>
              </div>
            </div>
          )}

          {subscribed && (
            <div className="pt-3 border-t border-current/20">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const { data } = await supabase.functions.invoke('customer-portal');
                    if (data?.url) {
                      window.open(data.url, '_blank');
                    }
                  } catch (error) {
                    console.error('Error opening customer portal:', error);
                  }
                }}
                className="w-full"
              >
                Manage Subscription
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
