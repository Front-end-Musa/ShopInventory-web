import { afterNextRender, Service, signal } from '@angular/core';
export interface DisplayPreferences {
  view: 'grid' | 'table';
  pageSize: number;
}
export const DEFAULT_PREFERENCES: DisplayPreferences = { view: 'grid', pageSize: 20 };
@Service()
export class PreferencesService {
  readonly value = signal<DisplayPreferences>(DEFAULT_PREFERENCES);
  readonly ready = signal(false);
  readonly storageError = signal(false);
  constructor() {
    afterNextRender(() => {
      try {
        const stored: unknown = JSON.parse(
          localStorage.getItem('shopInventory.displayPreferences') ?? 'null',
        );
        if (stored && typeof stored === 'object' && 'view' in stored && 'pageSize' in stored) {
          this.value.set({
            view: stored.view === 'table' ? 'table' : 'grid',
            pageSize: [10, 20, 50].includes(Number(stored.pageSize)) ? Number(stored.pageSize) : 20,
          });
        } else if (localStorage.getItem('shopInventory.products.viewMode') === 'table')
          this.value.set({ ...DEFAULT_PREFERENCES, view: 'table' });
      } catch {
        this.storageError.set(true);
      }
      this.ready.set(true);
    });
  }
  save(value: DisplayPreferences): void {
    this.value.set(value);
    try {
      localStorage.setItem('shopInventory.displayPreferences', JSON.stringify(value));
      this.storageError.set(false);
    } catch {
      this.storageError.set(true);
    }
  }
  reset(): void {
    this.save({ ...DEFAULT_PREFERENCES });
  }
}
