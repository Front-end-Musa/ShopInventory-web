import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as ProductsActions from './products.actions';
import { ProductsApiService } from '../data-access/products-api.service';

@Injectable()
export class ProductsEffects {
  private readonly productsService = inject(ProductsApiService);
  private readonly actions$ = inject(Actions);

  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.loadProducts),
      switchMap(() =>
        this.productsService.getAll().pipe(
          map((products) => ProductsActions.loadProductsSuccess({ products })),
          catchError((error: unknown) => of(ProductsActions.loadProductsFailure({ error }))),
        ),
      ),
    ),
  );

  loadProductById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.loadProductById),
      switchMap(({ id }) =>
        this.productsService.getById(id).pipe(
          map((product) => ProductsActions.loadProductByIdSuccess({ product })),
          catchError((error: unknown) => of(ProductsActions.loadProductByIdFailure({ error }))),
        ),
      ),
    ),
  );

  createProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.createProduct),
      switchMap(({ request }) =>
        this.productsService.create(request).pipe(
          map((product) => ProductsActions.createProductSuccess({ product })),
          catchError((error: unknown) => of(ProductsActions.createProductFailure({ error }))),
        ),
      ),
    ),
  );

  deleteProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.deleteProduct),
      switchMap(({ id }) =>
        this.productsService.delete(id).pipe(
          map(() => ProductsActions.deleteProductSuccess({ id })),
          catchError((error: unknown) => of(ProductsActions.deleteProductFailure({ error }))),
        ),
      ),
    ),
  );
}
