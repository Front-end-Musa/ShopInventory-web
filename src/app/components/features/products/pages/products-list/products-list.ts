import { Component, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { ProductsFacade } from '../../state/products.facade';
import { Product } from '../../data-access/products.models';
import { Subscription } from 'rxjs';
import { CurrencyPipe } from '@angular/common';
import { SortByType, SortOrderType } from '../../data-access/products-sorting.types';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [CurrencyPipe, MatIconModule],
  selector: 'app-products-list',
  styleUrl: './products-list.scss',
  templateUrl: './products-list.html',
})
export class ProductsList implements OnInit, OnDestroy {
  private productsSubscription: Subscription | null = null;
  private totalPagesSubscription: Subscription | null = null;
  private totalCountSubscription: Subscription | null = null;
  private loadingSubscription: Subscription | null = null;
  public productsSignal: WritableSignal<Product[]> = signal<Product[]>([]);
  public totalPages: WritableSignal<number> = signal<number>(0);
  public totalCount: WritableSignal<number> = signal<number>(0);
  public isLoading: WritableSignal<boolean> = signal(false);
  public currentPage = 1;
  public pageSize = 20;
  public sortOrder: SortOrderType = 'asc';
  public sortBy: SortByType = 'name';
  constructor(private productsFacade: ProductsFacade) {}

  ngOnInit(): void {
    this.productsSubscription = this.productsFacade.products$.subscribe((products) => {
      this.productsSignal.set(products);
    });
    this.totalPagesSubscription = this.productsFacade.totalPages$.subscribe((totalPages) => {
      this.totalPages.set(totalPages);
    });
    this.totalCountSubscription = this.productsFacade.totalCount$.subscribe((totalCount) => {
      this.totalCount.set(totalCount);
    });
    this.loadingSubscription = this.productsFacade.isLoading$.subscribe((isLoading) => {
      this.isLoading.set(isLoading);
    });
    this.productsFacade.loadProducts(this.currentPage, this.pageSize, this.sortBy, this.sortOrder);
  }

  ngOnDestroy(): void {
    this.productsSubscription?.unsubscribe();
    this.totalPagesSubscription?.unsubscribe();
    this.totalCountSubscription?.unsubscribe();
    this.loadingSubscription?.unsubscribe();
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages() }, (_, index) => index + 1);
  }

  loadPage(page: number): void {
    if (page < 1 || (this.totalPages() > 0 && page > this.totalPages()) || page === this.currentPage) {
      return;
    }

    this.currentPage = page;
    this.productsFacade.loadProducts(this.currentPage, this.pageSize, this.sortBy, this.sortOrder);
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const [sortBy, sortOrder] = value.split('-') as [SortByType, SortOrderType];
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    this.currentPage = 1;
    this.productsFacade.loadProducts(this.currentPage, this.pageSize, this.sortBy, this.sortOrder);
  }

  stockValue(): number {
    let totalValue: number = 0;
    this.productsSignal().forEach(product => {
      totalValue += product.price;
    });
    return totalValue;
  }

  lowStockIds(): number[] {
    let lowStockIds: number[] = [];
    this.productsSignal().forEach((product) => {
      if (product.quantityInStock < product.minimumStockLevel) {
        lowStockIds.push(product.id);
      };
    });
    return lowStockIds;
  }

  outOfStockIds(): number[] {
    let outOfStockIds: number[] = [];
    this.productsSignal().forEach((product) => {
      if (product.quantityInStock == 0) {
        outOfStockIds.push(product.id);
      };
    });
    return outOfStockIds;
  }
}
