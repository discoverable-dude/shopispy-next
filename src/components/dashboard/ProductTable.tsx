"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product } from "@/components/marketing/ScraperContent";
import { ExternalLink, Crown, Lock } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

interface ProductTableProps {
  products: Product[];
  storeInfo?: {
    currency: string;
    currencySymbol: string;
    name: string;
    domain: string;
    favicon?: string;
  } | null;
}

export const ProductTable = ({ products, storeInfo }: ProductTableProps) => {
  const { user, subscribed } = useAuth();

  const formatPrice = (price: string) => {
    const numericPrice = parseFloat(price);
    const currencyCode = storeInfo?.currency || 'USD';
    const symbol = storeInfo?.currencySymbol || '$';

    // Format just the number part
    const formattedNumber = numericPrice.toFixed(2);

    return {
      formatted: `${symbol}${formattedNumber}`,
      symbol: symbol,
      amount: formattedNumber
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Limit products for users who are not signed in (logged-in free users can see all)
  const shouldLimitProducts = !user;
  const displayProducts = shouldLimitProducts ? products.slice(0, 5) : products;
  const hiddenProductsCount = shouldLimitProducts ? Math.max(0, products.length - 5) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {storeInfo?.favicon && (
              <img
                src={storeInfo.favicon}
                alt={`${storeInfo.name} favicon`}
                className="w-5 h-5 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            {storeInfo?.name && (
              <span className="text-muted-foreground text-sm font-normal">
                {storeInfo.name} -
              </span>
            )}
            Products ({products.length})
            {shouldLimitProducts && (
              <Badge variant="secondary" className="text-xs">
                <Lock className="h-3 w-3 mr-1" />
                {!user ? 'Sign In Required' : 'Free Trial'}
              </Badge>
            )}
          </CardTitle>
          {subscribed && (
            <Badge variant="default" className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.images[0] ? (
                      <img
                        src={product.images[0].src}
                        alt={product.images[0].alt || product.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs">
                        No Image
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.title}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        {product.handle}
                        <ExternalLink className="h-3 w-3" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.product_type || "N/A"}</Badge>
                  </TableCell>
                  <TableCell>{product.vendor}</TableCell>
                  <TableCell>
                    {product.variants[0] ? (
                      <div>
                        <div className="font-medium">
                          {formatPrice(product.variants[0].price).formatted}
                        </div>
                        {product.variants[0].compare_at_price && (
                          <div className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.variants[0].compare_at_price).formatted}
                          </div>
                        )}
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(product.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {(() => {
                        const tags = Array.isArray(product.tags)
                          ? product.tags
                          : typeof product.tags === 'string'
                            ? product.tags.split(',')
                            : [];

                        return (
                          <>
                            {tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {typeof tag === 'string' ? tag.trim() : String(tag).trim()}
                              </Badge>
                            ))}
                            {tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{tags.length - 3}
                              </Badge>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {shouldLimitProducts && hiddenProductsCount > 0 && (
          <div className="mt-6 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Lock className="h-5 w-5" />
                <span className="font-semibold">Unlock Full Access</span>
              </div>
              <p className="text-muted-foreground">
                You're viewing 5 of {products.length} products. Sign in to see all {hiddenProductsCount} remaining products for free.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button
                  className="bg-gradient-to-r from-primary to-primary/80"
                  onClick={() => window.location.href = '/auth'}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Sign In to View All Products
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
