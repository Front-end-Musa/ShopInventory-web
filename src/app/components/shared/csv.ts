import { Product } from '../features/products/data-access/products.models';
export function csvCell(value: string | number | null): string {
  const text = String(value ?? '');
  const safe = /^[\s]*[=+@-]/.test(text) ? "'" + text : text;
  return '"' + safe.replace(/"/g, '""') + '"';
}
export function productsCsv(products: readonly Product[]): string {
  const rows: (string | number | null)[][] = [
    [
      'Name',
      'SKU',
      'Barcode',
      'Category',
      'Price',
      'Cost price',
      'Quantity',
      'Minimum stock level',
      'Description',
    ],
    ...products.map((p) => [
      p.name,
      p.sku,
      p.barcode,
      p.category.name,
      p.price,
      p.costPrice,
      p.quantityInStock,
      p.minimumStockLevel,
      p.description,
    ]),
  ];
  return '\uFEFF' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
}
