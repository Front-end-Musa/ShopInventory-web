import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { CreateProductRequest } from '../data-access/products.models';
import * as ProductsActions from './products.actions';
import {
  selectAllProducts,
  selectError,
  selectIsLoading,
  selectSelectedProduct,
  selectSelectedProductId,
  selectStatus,
  selectTotal,
} from './products.reducer';

@Injectable({ providedIn: 'root' })
export class ProductsFacade {
  private readonly store = inject(Store);

  readonly products$ = this.store.select(selectAllProducts);
  readonly total$ = this.store.select(selectTotal);
  readonly status$ = this.store.select(selectStatus);
  readonly error$ = this.store.select(selectError);
  readonly isLoading$ = this.store.select(selectIsLoading);
  readonly selectedProduct$ = this.store.select(selectSelectedProduct);
  readonly selectedProductId$ = this.store.select(selectSelectedProductId);

  loadProducts(): void {
    this.store.dispatch(ProductsActions.loadProducts());
  }

  loadProductById(id: number): void {
    this.store.dispatch(ProductsActions.loadProductById({ id }));
  }

  createProduct(request: CreateProductRequest): void {
    this.store.dispatch(ProductsActions.createProduct({ request }));
  }

  deleteProduct(id: number): void {
    this.store.dispatch(ProductsActions.deleteProduct({ id }));
  }
}
