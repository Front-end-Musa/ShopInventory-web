import { Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { ProductBarcode } from '../../components/product-barcode/product-barcode';
import { ProductTable } from '../../components/product-table/product-table';
import { Product } from '../../data-access/products.models';
import { ProductsApiService } from '../../data-access/products-api.service';
import { ProductsFacade } from '../../state/products.facade';
import { SortByType, SortOrderType } from '../../data-access/products-sorting.types';
import { CategoriesFacade } from '../../../category/data-access/categories.facade';
import { AnalyticsOverview, AnalyticsService } from '../../../dashboard/analytics.service';
import { DeleteConfirmation } from '../../../../shared/delete-confirmation';
import { PreferencesService } from '../../../../shared/preferences.service';
import { productsCsv } from '../../../../shared/csv';
@Component({
  selector: 'app-products-list',
  imports: [
    CurrencyPipe,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatPaginatorModule,
    MatProgressBarModule,
    ProductBarcode,
    ProductTable,
  ],
  templateUrl: './products-list.html',
  styleUrl: './products-list.scss',
})
export class ProductsList {
  readonly productsFacade = inject(ProductsFacade);
  readonly categoriesFacade = inject(CategoriesFacade);
  private readonly api = inject(ProductsApiService);
  private readonly analyticsApi = inject(AnalyticsService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly preferences = inject(PreferencesService);
  readonly categories = this.categoriesFacade.categories;
  readonly productsSignal = toSignal(this.productsFacade.products$, { initialValue: [] });
  readonly totalCount = toSignal(this.productsFacade.totalCount$, { initialValue: 0 });
  readonly isLoading = toSignal(this.productsFacade.isLoading$, { initialValue: false });
  readonly loadError = toSignal(this.productsFacade.error$, { initialValue: null });
  readonly query = this.productsFacade.query;
  readonly currentPage = computed(() => this.query().page);
  readonly pageSize = computed(() => this.query().pageSize);
  readonly viewMode = signal<'grid' | 'table'>('grid');
  readonly filtersOpen = signal(true);
  readonly deleting = signal(false);
  readonly actionError = signal('');
  readonly analytics = signal<AnalyticsOverview | null>(null);
  readonly analyticsError = signal(false);
  readonly searchControl = new FormControl(this.query().searchInput, { nonNullable: true });
  private preferencesApplied = false;
  constructor() {
    this.categoriesFacade.load();
    this.loadAnalytics();
    this.reload();
    effect(() => {
      if (this.preferences.ready() && !this.preferencesApplied) {
        this.preferencesApplied = true;
        this.viewMode.set(this.preferences.value().view);
        this.productsFacade.loadProducts(1, this.preferences.value().pageSize);
      }
    });
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => this.productsFacade.searchChanged(value));
  }
  loadAnalytics(): void {
    this.analyticsError.set(false);
    this.analyticsApi
      .overview()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (value) => this.analytics.set(value),
        error: () => this.analyticsError.set(true),
      });
  }
  reload(): void {
    const q = this.query();
    this.productsFacade.loadProducts(q.page, q.pageSize, q.sortBy as SortByType, q.sortOrder);
  }
  categoryChanged(categoryId: number | undefined): void {
    this.productsFacade.categoryChanged(categoryId);
  }
  onSortChange(value: string): void {
    const [sortBy, order] = value.split('-') as [SortByType, SortOrderType];
    this.productsFacade.loadProducts(1, this.pageSize(), sortBy, order);
  }
  pageChanged(event: PageEvent): void {
    const q = this.query();
    this.productsFacade.loadProducts(
      event.pageIndex + 1,
      event.pageSize,
      q.sortBy as SortByType,
      q.sortOrder,
    );
  }
  setViewMode(mode: 'grid' | 'table'): void {
    this.viewMode.set(mode);
    this.preferences.save({ ...this.preferences.value(), view: mode });
  }
  deleteProduct(product: Product): void {
    if (this.deleting()) return;
    this.dialog
      .open(DeleteConfirmation, {
        data: product.name,
        restoreFocus: true,
        autoFocus: 'first-tabbable',
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (confirmed !== true) return;
        this.deleting.set(true);
        this.actionError.set('');
        this.api
          .delete(product.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.deleting.set(false);
              const q = this.query();
              this.productsFacade.loadProducts(
                this.productsSignal().length === 1 ? Math.max(1, q.page - 1) : q.page,
                q.pageSize,
                q.sortBy as SortByType,
                q.sortOrder,
              );
              this.loadAnalytics();
            },
            error: () => {
              this.deleting.set(false);
              this.actionError.set('Unable to delete product. Please try again.');
            },
          });
      });
  }
  exportProducts(): void {
    const url = URL.createObjectURL(
      new Blob([productsCsv(this.productsSignal())], { type: 'text/csv;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'products-page-' + this.currentPage() + '.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
