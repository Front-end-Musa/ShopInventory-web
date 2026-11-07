import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { PreferencesService } from '../../shared/preferences.service';
@Component({
  imports: [MatCardModule, MatSelectModule, MatButtonModule],
  template: `<section class="page">
    <header class="page-heading">
      <div>
        <p class="eyebrow">YOUR WORKSPACE</p>
        <h1>Settings</h1>
        <p class="description">Make your inventory work for you.</p>
      </div>
    </header>
    <mat-card appearance="outlined" class="panel"
      ><h2>Display preferences</h2>
      <p class="muted">Saved in this browser and applied when you next open the product catalog.</p>
      <div class="form-grid">
        <mat-form-field appearance="outline"
          ><mat-label>Default product view</mat-label
          ><mat-select [value]="preferences.value().view" (selectionChange)="setView($event.value)"
            ><mat-option value="grid">Grid</mat-option
            ><mat-option value="table">Table</mat-option></mat-select
          ></mat-form-field
        ><mat-form-field appearance="outline"
          ><mat-label>Products per page</mat-label
          ><mat-select
            [value]="preferences.value().pageSize"
            (selectionChange)="setSize($event.value)"
          >
            @for (size of [10, 20, 50]; track size) {
              <mat-option [value]="size">{{ size }}</mat-option>
            }
          </mat-select></mat-form-field
        >
      </div>
      <div class="actions">
        <button mat-stroked-button (click)="reset()">Reset defaults</button
        ><span role="status">{{ message() }}</span>
      </div>
      @if (preferences.storageError()) {
        <p role="status">Browser storage is unavailable. Preferences apply for this session.</p>
      }
    </mat-card>
  </section>`,
})
export class Settings {
  readonly preferences = inject(PreferencesService);
  readonly message = signal('');
  setView(view: 'grid' | 'table'): void {
    this.preferences.save({ ...this.preferences.value(), view });
    this.message.set('Preferences saved.');
  }
  setSize(pageSize: number): void {
    this.preferences.save({ ...this.preferences.value(), pageSize });
    this.message.set('Preferences saved.');
  }
  reset(): void {
    this.preferences.reset();
    this.message.set('Defaults restored.');
  }
}
