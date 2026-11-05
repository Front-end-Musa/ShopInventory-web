import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ProductRequestDto } from '../data-access/products.models';
import * as ProductsActions from './products.actions';
import {
  productsFeature,
  selectAllProducts,
  selectError,
  selectIsLoading,
  selectSelectedProduct,
  selectSelectedProductId,
  selectStatus,
  selectTotal,
  selectTotalCount,
  selectTotalPages,
} from './products.reducer';
import { SortByType, SortOrderType } from '../data-access/products-sorting.types';

@Injectable({ providedIn: 'root' })
export class ProductsFacade {
  private readonly store = inject(Store);

  readonly query = this.store.selectSignal(productsFeature.selectQuery);
  readonly creationStatus = this.store.selectSignal(productsFeature.selectCreationStatus);
  readonly creationError = this.store.selectSignal(productsFeature.selectCreationError);
  resetCreation(): void { this.store.dispatch(ProductsActions.resetCreation()); }

  readonly products$ = this.store.select(selectAllProducts);
  readonly total$ = this.store.select(selectTotal);
  readonly totalPages$ = this.store.select(selectTotalPages);
  readonly totalCount$ = this.store.select(selectTotalCount);
  readonly status$ = this.store.select(selectStatus);
  readonly error$ = this.store.select(selectError);
  readonly isLoading$ = this.store.select(selectIsLoading);
  readonly selectedProduct$ = this.store.select(selectSelectedProduct);
  readonly selectedProductId$ = this.store.select(selectSelectedProductId);

  loadProducts(page: number, pageSize: number, sortBy?: SortByType, sortOrder?: SortOrderType): void {
      this.store.dispatch(ProductsActions.loadProducts({ page, pageSize, sortBy, sortOrder }));
  }

  loadProductById(id: number): void {
    this.store.dispatch(ProductsActions.loadProductById({ id }));
  }

  createProduct(request: ProductRequestDto): void {
    this.store.dispatch(ProductsActions.createProduct({ request }));
  }

  deleteProduct(id: number): void {
    this.store.dispatch(ProductsActions.deleteProduct({ id }));
  }

  categoryChanged(categoryId: number | undefined): void { this.store.dispatch(ProductsActions.categoryChanged({ categoryId })); }

  searchChanged(searchInput: string) {
    this.store.dispatch(ProductsActions.searchProducts({ searchInput }))
  }
}
