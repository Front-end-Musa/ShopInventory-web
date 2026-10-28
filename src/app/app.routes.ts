import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/layout/layout').then(c => c.Layout),
        children: [
            {
                path: '',
                redirectTo: 'products',
                pathMatch: 'full'
            },
            {
                path: 'products',
                loadChildren: () =>
                import('./components/features/products/products.routes')
                    .then(m => m.PRODUCTS_ROUTES),
            },
        ]
    },
];
