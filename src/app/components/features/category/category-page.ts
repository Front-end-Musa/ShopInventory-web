import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoriesFacade } from './data-access/categories.facade';
import { Observable } from 'rxjs';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import { CategoryApiService } from './data-access/category-api.service';
import { Category } from './data-access/category.models';

@Component({
  imports: [
    FormField,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule,
  ],
  template: `<section class="page">
    <header class="page-heading">
      <div>
        <p class="eyebrow">INVENTORY</p>
        <h1>Categories</h1>
        <p class="description">Organize your products into useful groups.</p>
      </div>
      <button mat-stroked-button [disabled]="busy()" (click)="load()">
        <mat-icon>refresh</mat-icon>Refresh categories
      </button>
    </header>
    @if (error()) {
      <p class="notice error" role="alert">{{ error() }}</p>
    }
    @if (busy()) {
      <mat-progress-bar mode="indeterminate" aria-label="Loading categories" />
      <p role="status">Loading…</p>
    }
    <mat-card appearance="outlined" class="panel"
      ><h2>{{ editing() ? 'Edit category' : 'Add category' }}</h2>
      <form (submit)="save($event)" novalidate>
        <div class="form-grid">
          <mat-form-field appearance="outline"
            ><mat-label>Name</mat-label><input matInput [formField]="fields.name" />
            @if (fields.name().invalid()) {
              <mat-error>Name is required.</mat-error>
            }</mat-form-field
          ><mat-form-field appearance="outline"
            ><mat-label>Description</mat-label
            ><textarea matInput [formField]="fields.description"></textarea>
          </mat-form-field>
        </div>
        <div class="actions">
          <button mat-flat-button [disabled]="busy() || fields().invalid()">Save category</button
          ><button mat-button type="button" (click)="reset()">Cancel</button>
        </div>
      </form></mat-card
    >
    <mat-card appearance="outlined" class="panel"
      ><h2>All categories</h2>
      <mat-list>
        @for (category of categories(); track category.id) {
          <mat-list-item
            ><span matListItemTitle>{{ category.name }}</span
            ><span matListItemLine>{{ category.description || 'No description' }}</span
            ><button
              mat-button
              matListItemMeta
              (click)="edit(category)"
              [attr.aria-label]="'Edit ' + category.name"
            >
              Edit
            </button></mat-list-item
          >
        } @empty {
          @if (!busy() && !error()) {
            <p role="status">No categories found.</p>
          }
        }
      </mat-list>
      <p class="muted">
        Category deletion is unavailable until the server prevents deleting categories containing
        products.
      </p>
      <button mat-button disabled>Delete category unavailable</button></mat-card
    >
  </section>`,
  styles: [
    `
      mat-list-item {
        margin-bottom: 12px;
      }
    `,
  ],
})
export class CategoryPage {
  private readonly destroyRef = inject(DestroyRef);
  private readonly api = inject(CategoryApiService);
  private readonly categoryFacade = inject(CategoriesFacade);
  readonly categories = this.categoryFacade.categories;
  readonly busy = signal(false);
  readonly error = signal('');
  readonly editing = signal<number | null>(null);
  readonly value = signal({ name: '', description: '' });
  readonly fields = form(this.value, (p) => required(p.name));
  constructor() {
    this.load();
  }
  load(): void {
    this.busy.set(true);
    this.error.set('');
    this.api
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => {
          this.categories.set(categories);
          this.busy.set(false);
        },
        error: () => {
          this.error.set('Unable to load categories. Retry using Refresh.');
          this.busy.set(false);
        },
      });
  }
  edit(category: Category): void {
    this.editing.set(category.id);
    this.value.set({ name: category.name, description: category.description ?? '' });
    document.querySelector<HTMLInputElement>('input')?.focus();
  }
  reset(): void {
    this.editing.set(null);
    this.value.set({ name: '', description: '' });
    this.fields().reset();
  }
  save(event: Event): void {
    event.preventDefault();
    if (this.busy() || this.fields().invalid() || !this.value().name.trim()) return;
    this.busy.set(true);
    this.error.set('');
    const request = {
      name: this.value().name.trim(),
      description: this.value().description.trim(),
    };
    const id = this.editing();
    const operation: Observable<unknown> =
      id === null ? this.api.create(request) : this.api.update(id, request);
    operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.reset();
        this.load();
      },
      error: () => {
        this.busy.set(false);
        this.error.set('Unable to save category. Please try again.');
      },
    });
  }
}
