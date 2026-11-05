import { CategoriesFacade } from '../../../category/data-access/categories.facade';
import { CategoryApiService } from '../../../category/data-access/category-api.service';
import { Category } from '../../../category/data-access/category.models';
import { ProductsApiService } from '../../data-access/products-api.service';
import { effect, inject, afterNextRender, Component, DestroyRef, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductTable } from '../../components/product-table/product-table';
import { ProductsFacade } from '../../state/products.facade';
import { Product } from '../../data-access/products.models';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { CurrencyPipe } from '@angular/common';
import { SortByType, SortOrderType } from '../../data-access/products-sorting.types';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  imports: [RouterLink, ProductTable, CurrencyPipe, MatIconModule, ReactiveFormsModule],
  selector: 'app-products-list',
  styleUrl: './products-list.scss',
  templateUrl: './products-list.html',
})
export class ProductsList implements OnInit, OnDestroy {
  readonly categoriesFacade = inject(CategoriesFacade);
  readonly categories = this.categoriesFacade.categories;
  readonly actionError = signal('');
  readonly deleting = signal(false);
  private readonly api = inject(ProductsApiService);
  private readonly categoriesApi = inject(CategoryApiService);
  categoryChanged(event: Event): void {
    this.currentPage = 1;
    this.productsFacade.categoryChanged(Number((event.target as HTMLSelectElement).value) || undefined);
  }
  deleteProduct(product: Product): void {
    if (this.deleting() || !window.confirm(`Delete ${product.name}?`)) return;
    this.deleting.set(true);
    this.api.delete(product.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.deleting.set(false); if (this.productsSignal().length === 1 && this.currentPage > 1) this.currentPage--; this.productsFacade.loadProducts(this.currentPage, this.pageSize, this.sortBy, this.sortOrder); },
      error: () => { this.deleting.set(false); this.actionError.set('Unable to delete product. Please try again.'); },
    });
  }
  readonly viewMode = signal<'grid' | 'table'>('grid');

  setViewMode(mode: 'grid' | 'table'): void {
    this.viewMode.set(mode);
    try { localStorage.setItem('shopInventory.products.viewMode', mode); } catch { /* Storage may be unavailable. */ }
  }

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
  searchControl = new FormControl('', {
    nonNullable: true
  });
  constructor(private productsFacade: ProductsFacade, private destroyRef: DestroyRef) {
    effect(() => { this.currentPage = this.productsFacade.query().page; });
    afterNextRender(() => {
      try {
        const saved = localStorage.getItem('shopInventory.products.viewMode');
        if (saved === 'grid' || saved === 'table') this.viewMode.set(saved);
      } catch { /* Keep the default when storage is unavailable. */ }
    });
  }

  ngOnInit(): void {
    this.categoriesFacade.load();
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
    
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(searchInput => this.productsFacade.searchChanged(searchInput))
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
