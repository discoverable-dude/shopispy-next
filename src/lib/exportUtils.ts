// @ts-nocheck
import ExcelJS from 'exceljs';

interface Product {
  id: number;
  title: string;
  vendor?: string | null;
  product_type?: string | null;
  handle?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  variants?: any[];
}

interface ScrapeData {
  id: string;
  store_url: string;
  store_name: string;
  total_products: number;
  scrape_date: string;
  products: Product[];
}

export const generateCSV = (data: ScrapeData): string => {
  const headers = [
    'Product Title',
    'Vendor',
    'Product Type', 
    'Handle',
    'Price',
    'Compare At Price',
    'SKU',
    'Inventory',
    'Available',
    'Created Date',
    'Updated Date'
  ];

  const rows = data.products.flatMap(product =>
    (product.variants?.length ?? 0) > 0 
      ? (product.variants ?? []).map(variant => [
          escapeCsvField(product.title || ''),
          escapeCsvField(product.vendor || ''),
          escapeCsvField(product.product_type || ''),
          escapeCsvField(product.handle || ''),
          escapeCsvField(variant.price?.toString() || ''),
          escapeCsvField(variant.compare_at_price?.toString() || ''),
          escapeCsvField(variant.sku || ''),
          escapeCsvField(variant.inventory_quantity?.toString() || ''),
          escapeCsvField(variant.available ? 'Yes' : 'No'),
          escapeCsvField(product.created_at || ''),
          escapeCsvField(product.updated_at || '')
        ])
      : [[
          escapeCsvField(product.title || ''),
          escapeCsvField(product.vendor || ''),
          escapeCsvField(product.product_type || ''),
          escapeCsvField(product.handle || ''),
          '',
          '',
          '',
          '',
          '',
          escapeCsvField(product.created_at || ''),
          escapeCsvField(product.updated_at || '')
        ]]
  );

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
};

const escapeCsvField = (field: string): string => {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
};

export const generateXLSX = async (data: ScrapeData): Promise<Uint8Array> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Products');

  worksheet.columns = [
    { header: 'Product Title', key: 'title', width: 30 },
    { header: 'Vendor', key: 'vendor', width: 20 },
    { header: 'Product Type', key: 'product_type', width: 20 },
    { header: 'Handle', key: 'handle', width: 25 },
    { header: 'Price', key: 'price', width: 12 },
    { header: 'Compare At Price', key: 'compare_at_price', width: 15 },
    { header: 'SKU', key: 'sku', width: 15 },
    { header: 'Inventory', key: 'inventory', width: 12 },
    { header: 'Available', key: 'available', width: 10 },
    { header: 'Created Date', key: 'created_at', width: 20 },
    { header: 'Updated Date', key: 'updated_at', width: 20 },
  ];

  data.products.forEach(product => {
    if ((product.variants?.length ?? 0) > 0) {
      product.variants.forEach(variant => {
        worksheet.addRow({
          title: product.title || '',
          vendor: product.vendor || '',
          product_type: product.product_type || '',
          handle: product.handle || '',
          price: variant.price || '',
          compare_at_price: variant.compare_at_price || '',
          sku: variant.sku || '',
          inventory: variant.inventory_quantity || '',
          available: variant.available ? 'Yes' : 'No',
          created_at: product.created_at || '',
          updated_at: product.updated_at || '',
        });
      });
    } else {
      worksheet.addRow({
        title: product.title || '',
        vendor: product.vendor || '',
        product_type: product.product_type || '',
        handle: product.handle || '',
        price: '',
        compare_at_price: '',
        sku: '',
        inventory: '',
        available: '',
        created_at: product.created_at || '',
        updated_at: product.updated_at || '',
      });
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer);
};

export const generateJSON = (data: ScrapeData): string => {
  const exportData = {
    exportInfo: {
      storeName: data.store_name,
      scrapeDate: data.scrape_date,
      totalProducts: data.products.length,
      exportDate: new Date().toISOString()
    },
    products: data.products.map(product => ({
      id: product.id,
      title: product.title,
      vendor: product.vendor,
      productType: product.product_type,
      handle: product.handle,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      variants: product.variants?.map(variant => ({
        id: variant.id,
        title: variant.title,
        price: variant.price,
        compareAtPrice: variant.compare_at_price,
        sku: variant.sku,
        inventoryQuantity: variant.inventory_quantity,
        available: variant.available
      })) || []
    }))
  };

  return JSON.stringify(exportData, null, 2);
};

export const downloadFile = (content: string | Uint8Array | ArrayBuffer, filename: string, mimeType: string) => {
  const blob = new Blob([content as BlobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
