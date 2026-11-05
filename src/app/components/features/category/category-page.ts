import { Observable } from 'rxjs';
import { Component, inject, signal } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import { CategoryApiService } from './data-access/category-api.service';
import { Category } from './data-access/category.models';

@Component({
  imports: [FormField],
  template: `<main><h1>Categories</h1>
    @if (error()) { <p role="alert">{{ error() }}</p> }
    <button type="button" (click)="load()">Refresh categories</button>
    <form (submit)="save($event)">
      <h2>{{ editing() ? 'Edit category' : 'Add category' }}</h2>
      <label>Name <input [formField]="fields.name" /></label>
      <label>Description <textarea [formField]="fields.description"></textarea></label>
      <button [disabled]="busy() || fields().invalid()">Save category</button>
      <button type="button" (click)="reset()">Cancel</button>
    </form>
    @if (busy()) { <p role="status">Loading…</p> }
    <ul>@for (category of categories(); track category.id) {
      <li><strong>{{ category.name }}</strong> {{ category.description }}
        <button type="button" (click)="edit(category)">Edit {{ category.name }}</button>
        <button type="button" disabled title="Deletion requires server protection against deleting associated products">Delete {{ category.name }}</button>
      </li>
    } @empty { <li>No categories found.</li> }</ul>
    <p>Category deletion is unavailable until the server prevents deleting categories containing products.</p>
  </main>`,
  styles: [`main { padding: 2rem; } form { display: grid; gap: 1rem; max-width: 32rem; } label { display: grid; gap: .5rem; } li { padding: 1rem; }`],
})
export class CategoryPage {
  private readonly api = inject(CategoryApiService);
  readonly categories = signal<Category[]>([]);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly editing = signal<number | null>(null);
  readonly value = signal({ name: '', description: '' });
  readonly fields = form(this.value, p => required(p.name));
  constructor() { this.load(); }
  load(): void {
    this.busy.set(true);
    this.api.getAll().subscribe({ next: categories => { this.categories.set(categories); this.busy.set(false); }, error: () => { this.error.set('Unable to load categories. Retry using Refresh.'); this.busy.set(false); } });
  }
  edit(category: Category): void { this.editing.set(category.id); this.value.set({ name: category.name, description: category.description ?? '' }); }
  reset(): void { this.editing.set(null); this.value.set({ name: '', description: '' }); }
  save(event: Event): void {
    event.preventDefault();
    if (this.busy() || this.fields().invalid() || !this.value().name.trim()) return;
    this.busy.set(true); this.error.set('');
    const request = { name: this.value().name.trim(), description: this.value().description.trim() };
    const id = this.editing();
    const operation: Observable<unknown> = id === null ? this.api.create(request) : this.api.update(id, request);
    operation.subscribe({ next: () => { this.reset(); this.load(); }, error: () => { this.busy.set(false); this.error.set('Unable to save category. Please try again.'); } });
  }
}
