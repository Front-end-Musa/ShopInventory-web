import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
export type AnalyticsRange = 7 | 30 | 90;
export interface InventorySummary {
  productCount: number;
  categoryCount: number;
  inventoryValue: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
}
export interface AnalyticsDay {
  date: string;
  quantity: number | null;
  inventoryValue: number | null;
  revenue: number | null;
  unitsSold: number | null;
}
export interface AnalyticsOverview {
  currency: string;
  timezone: string;
  generatedAt: string;
  startDate: string;
  endDate: string;
  availability: {
    inventory: boolean;
    history: boolean;
    sales: boolean;
    salesReason: string | null;
  };
  inventory: InventorySummary;
  sales: { revenue: number | null; unitsSold: number | null };
  categories: {
    id: number;
    name: string;
    productCount: number;
    quantity: number;
    inventoryValue: number;
  }[];
  lowStockProducts: {
    id: number;
    name: string;
    quantityInStock: number;
    minimumStockLevel: number;
  }[];
  daily: AnalyticsDay[];
}
@Service()
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  overview(days: AnalyticsRange = 30) {
    return this.http.get<AnalyticsOverview>('https://localhost:7126/api/analytics/overview', {
      params: { days },
    });
  }
}
