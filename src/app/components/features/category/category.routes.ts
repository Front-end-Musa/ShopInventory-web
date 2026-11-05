import { Routes } from '@angular/router';
export const CATEGORY_ROUTES: Routes = [{ path: '', loadComponent: () => import('./category-page').then(m => m.CategoryPage) }];
