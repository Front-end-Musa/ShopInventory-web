import { Category } from "../../category/data-access/category.models";

export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string | null;
  description: string | null;
  price: number;
  costPrice: number;
  categoryId: number;
  category: Category;
  quantityInStock: number;
  minimumStockLevel: number;
}

export interface ProductsResponse {
  products: Product[];
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

export interface ProductRequestDto {
  name: string;
  sku: string;
  barcode?: string | null;
  description?: string | null;
  price: number;
  costPrice: number;
  categoryId: number;
  quantityInStock: number;
  minimumStockLevel: number;
}
