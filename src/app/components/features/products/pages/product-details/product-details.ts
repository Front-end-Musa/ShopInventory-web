import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductsApiService } from '../../data-access/products-api.service';
import { Product } from '../../data-access/products.models';
import { ProductBarcode } from '../../components/product-barcode/product-barcode';
import { DeleteConfirmation } from '../../../../shared/delete-confirmation';
@Component({
  selector: 'app-product-details',
  imports: [
    CurrencyPipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    ProductBarcode,
  ],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
})
export class ProductDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ProductsApiService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  readonly product = signal<Product | null>(null);
  readonly loading = signal(false);
  readonly deleting = signal(false);
  readonly error = signal('');
  constructor() {
    this.load();
  }
  load(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.error.set('Product not found.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.api
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (p) => {
          this.product.set(p);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.loading.set(false);
          this.error.set(
            error instanceof HttpErrorResponse && error.status === 404
              ? 'Product not found.'
              : 'Unable to load product. Please retry.',
          );
        },
      });
  }
  deleteProduct(): void {
    const product = this.product();
    if (!product || this.deleting()) return;
    this.dialog
      .open(DeleteConfirmation, { data: product.name, restoreFocus: true })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (confirmed !== true) return;
        this.deleting.set(true);
        this.error.set('');
        this.api
          .delete(product.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => void this.router.navigateByUrl('/products'),
            error: () => {
              this.deleting.set(false);
              this.error.set('Unable to delete product. Please retry.');
            },
          });
      });
  }
}
