import { CategoriesFacade } from '../../../category/data-access/categories.facade';
import { Component, effect, inject, signal } from '@angular/core';
import { FormField, form, min, required } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductsApiService } from '../../data-access/products-api.service';
import { CategoryApiService } from '../../../category/data-access/category-api.service';
import { Category } from '../../../category/data-access/category.models';
import { ProductsFacade } from '../../state/products.facade';

@Component({
  selector: 'app-product-form',
  imports: [FormField, RouterLink],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm {
  private readonly api = inject(ProductsApiService);
  private readonly route = inject(ActivatedRoute);
  readonly editStatus = signal<'idle' | 'saving' | 'error'>('idle');
  readonly editLoaded = signal(false);
  readonly facade = inject(ProductsFacade);
  private readonly router = inject(Router);
  private readonly categoriesFacade = inject(CategoriesFacade);
  private readonly saveRequest = takeUntilDestroyed<void>();
  private readonly categoryRequest = takeUntilDestroyed<Category[]>();
  readonly isCreate = inject(ActivatedRoute).snapshot.routeConfig?.path === 'new';
  readonly categories = this.categoriesFacade.categories;
  readonly categoryStatus = this.categoriesFacade.status;
  readonly submitted = signal(false);
  readonly value = signal({
    name: '', sku: '', barcode: '', description: '', price: 0,
    costPrice: 0, categoryId: 0, quantityInStock: 0, minimumStockLevel: 0,
  });
  readonly fields = form(this.value, path => {
    required(path.name);
    required(path.sku);
    min(path.price, 0.01);
    min(path.costPrice, 0);
    min(path.categoryId, 1);
    min(path.quantityInStock, 0);
    min(path.minimumStockLevel, 0);
  });

  constructor() {
    this.facade.resetCreation();
    this.loadCategories();
    if (!this.isCreate) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (Number.isInteger(id) && id > 0) this.api.getById(id).pipe(takeUntilDestroyed()).subscribe({
        next: product => { this.value.set({ name: product.name, sku: product.sku, barcode: product.barcode ?? '', description: product.description ?? '', price: product.price, costPrice: product.costPrice, categoryId: product.categoryId, quantityInStock: product.quantityInStock, minimumStockLevel: product.minimumStockLevel }); this.editLoaded.set(true); },
        error: () => this.editStatus.set('error'),
      });
      else this.editStatus.set('error');
    }
    effect(() => {
      if (this.isCreate && this.facade.creationStatus() === 'success') {
        void this.router.navigateByUrl('/products');
      }
    });
  }

  loadCategories(): void {
    this.categoriesFacade.load();
  }

  selectCategory(event: Event): void {
    const categoryId = Number((event.target as HTMLSelectElement).value);
    this.value.update(value => ({ ...value, categoryId }));
  }

  submit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    const value = this.value();
    const validIntegers = [value.quantityInStock, value.minimumStockLevel].every(
      value => Number.isInteger(value) && value >= 0 && value <= 2147483647,
    );
    if (this.facade.creationStatus() === 'saving' || this.editStatus() === 'saving' || (!this.isCreate && !this.editLoaded())) return;
    if (this.fields().invalid() || !value.name.trim() || !value.sku.trim() ||
        !validIntegers || !this.categories().some(category => category.id === value.categoryId)) {
      (event.target as HTMLFormElement | null)?.querySelector<HTMLElement>(':invalid, input')?.focus();
      return;
    }
    const request = {
      ...value, name: value.name.trim(), sku: value.sku.trim(),
      barcode: value.barcode.trim() || null, description: value.description.trim() || null,
    };
    if (this.isCreate) this.facade.createProduct(request);
    else {
      this.editStatus.set('saving');
      this.api.update(Number(this.route.snapshot.paramMap.get('id')), request).pipe(this.saveRequest).subscribe({
        next: () => { void this.router.navigateByUrl('/products'); },
        error: () => this.editStatus.set('error'),
      });
    }
  }
}
