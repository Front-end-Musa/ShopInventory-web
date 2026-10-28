export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string | null;
  description: string | null;
  price: number;
  costPrice: number;
  categoryId: number;
  category: string;
  quantityInStock: number;
  minimumStock: number;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  barcode?: string | null;
  description?: string | null;
  price: number;
  costPrice: number;
  categoryId: number;
  quantityInStock: number;
  minimumStock: number;
}