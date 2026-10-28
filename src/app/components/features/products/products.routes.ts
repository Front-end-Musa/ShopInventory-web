import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { ProductsEffects } from './state/products.effects';
import { productsFeature } from './state/products.reducer';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    providers: [provideState(productsFeature), provideEffects(ProductsEffects)],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/products-list/products-list').then((m) => m.ProductsList),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./components/product-form/product-form').then((m) => m.ProductForm),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/product-details/product-details').then((m) => m.ProductDetails),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./components/product-form/product-form').then((m) => m.ProductForm),
      },
    ],
  },
];
