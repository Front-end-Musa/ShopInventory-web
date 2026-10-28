import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/products-list/products-list')
        .then(m => m.ProductsList),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./components/product-form/product-form')
        .then(m => m.ProductForm),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/product-details/product-details')
        .then(m => m.ProductDetails),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./components/product-form/product-form')
        .then(m => m.ProductForm),
  },
];