import { Injectable, inject, signal } from '@angular/core';
import { CategoryApiService } from './category-api.service';
import { Category } from './category.models';

@Injectable({ providedIn: 'root' })
export class CategoriesFacade {
  private readonly api = inject(CategoryApiService);
  readonly categories = signal<Category[]>([]);
  readonly status = signal<'loading' | 'loaded' | 'error'>('loading');
  load(): void {
    this.status.set('loading');
    this.api.getAll().subscribe({
      next: categories => { this.categories.set(categories); this.status.set('loaded'); },
      error: () => this.status.set('error'),
    });
  }
}
