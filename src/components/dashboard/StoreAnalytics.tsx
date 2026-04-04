"use client";

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package, DollarSign, TrendingUp, Tag, ShoppingCart, Clock,
  CalendarDays, BarChart3, PieChart as PieChartIcon, Users
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getSupabaseClient } from "@/lib/supabase/client";
import { format } from 'date-fns';

interface StoreAnalyticsProps {
  storeId: string;
  storeName: string;
  storeUrl: string;
  products: any[];
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2, 160 60% 45%))',
  'hsl(var(--chart-3, 30 80% 55%))',
  'hsl(var(--chart-4, 280 65% 60%))',
  'hsl(var(--chart-5, 340 75% 55%))',
  'hsl(200, 70%, 50%)',
  'hsl(45, 85%, 50%)',
  'hsl(120, 50%, 45%)',
];

export const StoreAnalytics = ({ storeId, storeName, storeUrl, products }: StoreAnalyticsProps) => {
  const supabase = getSupabaseClient();
  const [fetchHistory, setFetchHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      if (!storeId) { setLoading(false); return; }

      // Get all store IDs that match (case-insensitive URL matching)
      const { data: allStores } = await supabase
        .from('stores')
        .select('id, store_url');

      const normalizedUrl = storeUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
      const matchingIds = (allStores || [])
        .filter(s => s.store_url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '') === normalizedUrl)
        .map(s => s.id);

      if (matchingIds.length > 0) {
        const { data } = await supabase
          .from('product_fetches')
          .select('fetched_at, total_products')
          .in('store_id', matchingIds)
          .order('fetched_at', { ascending: true });

        setFetchHistory(data || []);
      }
      setLoading(false);
    };
    loadHistory();
  }, [storeId, storeUrl]);

  const stats = useMemo(() => {
    if (!products.length) return null;

    const allVariants = products.flatMap(p => p.variants || []);
    const prices = allVariants.map(v => parseFloat(v.price)).filter(p => !isNaN(p) && p > 0);
    const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;

    const inStock = allVariants.filter(v => v.available === true).length;
    const outOfStock = allVariants.filter(v => v.available === false).length;
    const totalVariants = allVariants.length;
    const stockRate = totalVariants > 0 ? Math.round((inStock / totalVariants) * 100) : null;

    const onSale = allVariants.filter(v => v.compare_at_price && parseFloat(v.compare_at_price) > parseFloat(v.price)).length;

    // Vendor breakdown
    const vendorMap = new Map<string, number>();
    products.forEach(p => {
      const vendor = p.vendor || 'Unknown';
      vendorMap.set(vendor, (vendorMap.get(vendor) || 0) + 1);
    });
    const vendors = Array.from(vendorMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    // Type breakdown
    const typeMap = new Map<string, number>();
    products.forEach(p => {
      const type = p.product_type || 'Uncategorized';
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });
    const types = Array.from(typeMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    // Price distribution buckets
    const bucketCount = 8;
    const range = maxPrice - minPrice;
    const bucketSize = range > 0 ? Math.ceil(range / bucketCount) : 1;
    const priceBuckets: { range: string; count: number }[] = [];
    for (let i = 0; i < bucketCount; i++) {
      const lo = minPrice + i * bucketSize;
      const hi = lo + bucketSize;
      const count = prices.filter(p => p >= lo && (i === bucketCount - 1 ? p <= hi : p < hi)).length;
      if (count > 0) {
        priceBuckets.push({ range: `$${Math.round(lo)}-${Math.round(hi)}`, count });
      }
    }

    // Newest & recently updated
    const sorted = [...products].sort((a, b) =>
      new Date(b.created_at || b.inserted_at).getTime() - new Date(a.created_at || a.inserted_at).getTime()
    );
    const newest = sorted[0];
    const recentlyUpdated = [...products].sort((a, b) =>
      new Date(b.updated_at || b.inserted_at).getTime() - new Date(a.updated_at || a.inserted_at).getTime()
    )[0];

    return {
      avgPrice, minPrice, maxPrice, inStock, outOfStock, totalVariants,
      stockRate, onSale, vendors, types, priceBuckets, newest, recentlyUpdated
    };
  }, [products]);

  // Format fetch history for chart
  const historyChart = useMemo(() => {
    // Deduplicate by date (keep latest per day)
    const byDate = new Map<string, number>();
    fetchHistory.forEach(f => {
      const day = format(new Date(f.fetched_at), 'MMM dd');
      byDate.set(day, f.total_products);
    });
    return Array.from(byDate.entries()).map(([date, products]) => ({ date, products }));
  }, [fetchHistory]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (!stats) return null;

  const ProductSpotlight = ({ product, label, icon: Icon, dateField, dateLabel }: {
    product: any; label: string; icon: any; dateField: string; dateLabel: string;
  }) => {
    if (!product) return null;
    const img = product.images?.[0]?.src;
    const price = product.variants?.[0]?.price;
    const dateVal = product[dateField] || product.inserted_at;

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            {label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {img && (
              <img src={img} alt={product.title} className="w-12 h-12 object-cover rounded shrink-0" loading="lazy" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{product.title}</p>
              <p className="text-xs text-muted-foreground">{product.vendor || storeName}</p>
            </div>
          </div>
          <div className="flex justify-between mt-3 text-sm">
            <span className="text-muted-foreground">{dateLabel}:</span>
            <span className="font-medium">
              {dateVal ? format(new Date(dateVal), 'dd/MM/yyyy') : '—'}
            </span>
          </div>
          {price && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price:</span>
              <span className="font-semibold text-primary">${parseFloat(price).toFixed(2)}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 border-t bg-muted/10">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Total Products</span>
              <Package className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">{products.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Average Price</span>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">${stats.avgPrice.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              ${stats.minPrice.toFixed(0)} – ${stats.maxPrice.toFixed(0)} range
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">In Stock</span>
              <ShoppingCart className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">
              {stats.stockRate !== null ? `${stats.stockRate}%` : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.inStock} of {stats.totalVariants} variants
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">On Sale</span>
              <Tag className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">{stats.onSale}</p>
            <p className="text-xs text-muted-foreground mt-1">
              variants with discounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Newest & Recently Updated */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProductSpotlight
          product={stats.newest}
          label="Newest Product"
          icon={CalendarDays}
          dateField="created_at"
          dateLabel="Created"
        />
        <ProductSpotlight
          product={stats.recentlyUpdated}
          label="Recently Updated"
          icon={Clock}
          dateField="updated_at"
          dateLabel="Updated"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product count over time */}
        {historyChart.length > 1 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Product Count Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={historyChart}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--card-foreground))',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="products"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Price distribution */}
        {stats.priceBuckets.length > 1 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Price Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.priceBuckets}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="range" tick={{ fontSize: 10 }} className="fill-muted-foreground" angle={-20} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--card-foreground))',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Vendor breakdown */}
        {stats.vendors.length > 1 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                By Vendor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={stats.vendors}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {stats.vendors.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--card-foreground))',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Product type breakdown */}
        {stats.types.length > 1 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-primary" />
                By Product Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={stats.types}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {stats.types.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--card-foreground))',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Stock availability breakdown */}
        {(stats.inStock > 0 || stats.outOfStock > 0) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-primary" />
                Stock Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'In Stock', value: stats.inStock },
                      { name: 'Out of Stock', value: stats.outOfStock },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    <Cell fill="hsl(var(--primary))" />
                    <Cell fill="hsl(var(--muted-foreground))" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--card-foreground))',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
