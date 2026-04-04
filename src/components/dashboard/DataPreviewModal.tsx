"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: number;
  title: string;
  vendor?: string | null;
  product_type?: string | null;
  variants?: any[];
  price?: number;
  compare_at_price?: number;
  created_at?: string | null;
}

interface DataPreviewModalProps {
  products: Product[];
  storeName: string;
  onExport: (format: 'csv' | 'xlsx' | 'json') => void;
  children: React.ReactNode;
}

export const DataPreviewModal = ({ products, storeName, onExport, children }: DataPreviewModalProps) => {
  const previewData = products.slice(0, 10); // Show first 10 products
  const hasMore = products.length > 10;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Data Preview - {storeName}
          </DialogTitle>
          <DialogDescription>
            Preview of {products.length} products before exporting
            {hasMore && ` (showing first 10)`}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {product.title}
                  </TableCell>
                  <TableCell>{product.vendor || '-'}</TableCell>
                  <TableCell>
                    {product.product_type && (
                      <Badge variant="secondary" className="text-xs">
                        {product.product_type}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.variants?.[0]?.price ? (
                      <span className="font-medium">
                        £{Number(product.variants[0].price).toFixed(2)}
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {product.variants?.length || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {product.created_at ?
                      new Date(product.created_at).toLocaleDateString() : '-'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Total: {products.length} products
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onExport('csv')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => onExport('xlsx')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export XLSX
            </Button>
            <Button
              variant="outline"
              onClick={() => onExport('json')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
