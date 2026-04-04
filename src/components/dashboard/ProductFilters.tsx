"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Product } from "@/components/marketing/ScraperContent";
import { Filter, X } from "lucide-react";

interface ProductFiltersProps {
  products: Product[];
  storeInfo?: {
    currency: string;
    currencySymbol: string;
    name: string;
    domain: string;
  } | null;
  onFilterChange: (filters: {
    search: string;
    productType: string;
    vendor: string;
    minPrice: number;
    maxPrice: number;
  }) => void;
}

export const ProductFilters = ({ products, onFilterChange, storeInfo }: ProductFiltersProps) => {
  const [search, setSearch] = useState("");
  const [productType, setProductType] = useState("");
  const [vendor, setVendor] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Get unique values for dropdowns
  const uniqueProductTypes = [...new Set(products.map(p => p.product_type).filter(Boolean))];
  const uniqueVendors = [...new Set(products.map(p => p.vendor).filter(Boolean))];

  useEffect(() => {
    onFilterChange({
      search,
      productType,
      vendor,
      minPrice: parseFloat(minPrice) || 0,
      maxPrice: parseFloat(maxPrice) || 0,
    });
  }, [search, productType, vendor, minPrice, maxPrice, onFilterChange]);

  const clearFilters = () => {
    setSearch("");
    setProductType("");
    setVendor("");
    setMinPrice("");
    setMaxPrice("");
  };

  const hasActiveFilters = search || productType || vendor || minPrice || maxPrice;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </span>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-type">Product Type</Label>
            <Select value={productType} onValueChange={setProductType}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-types">All types</SelectItem>
                {uniqueProductTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor</Label>
            <Select value={vendor} onValueChange={setVendor}>
              <SelectTrigger>
                <SelectValue placeholder="All vendors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-vendors">All vendors</SelectItem>
                {uniqueVendors.map((vendorName) => (
                  <SelectItem key={vendorName} value={vendorName}>
                    {vendorName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="min-price">Min Price {storeInfo?.currencySymbol && `(${storeInfo.currencySymbol})`}</Label>
            <Input
              id="min-price"
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-price">Max Price {storeInfo?.currencySymbol && `(${storeInfo.currencySymbol})`}</Label>
            <Input
              id="max-price"
              type="number"
              placeholder="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
