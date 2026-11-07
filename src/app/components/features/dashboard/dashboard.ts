import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap, catchError, of } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AnalyticsOverview, AnalyticsRange, AnalyticsService } from './analytics.service';
import { TrendChart } from './trend-chart';
@Component({
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    MatCardModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressBarModule,
    TrendChart,
  ],
  templateUrl: './dashboard.html',
  styles: [
    `
      .metrics,
      .charts {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 20px;
      }
      .metrics {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        margin-bottom: 20px;
      }
      .metric {
        padding: 20px;
      }
      .metric strong {
        font-size: 26px;
      }
      .metric p {
        color: #536278;
        margin-bottom: 8px;
      }
      td,
      th {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #e4e9ed;
      }
      @media (max-width: 1050px) {
        .metrics {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .charts {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 400px) {
        .metrics {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class Dashboard {
  private readonly api = inject(AnalyticsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly requests = new Subject<AnalyticsRange>();
  readonly days = signal<AnalyticsRange>(30);
  readonly overview = signal<AnalyticsOverview | null>(null);
  readonly loading = signal(false);
  readonly error = signal(false);
  readonly stockRows = computed(() => {
    const i = this.overview()?.inventory;
    return i
      ? [
          { label: 'In stock', count: i.inStockCount },
          { label: 'Low stock', count: i.lowStockCount },
          { label: 'Out of stock', count: i.outOfStockCount },
        ]
      : [];
  });
  constructor() {
    this.requests
      .pipe(
        switchMap((days) => this.api.overview(days).pipe(catchError(() => of(null)))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => {
        this.overview.set(value);
        this.loading.set(false);
        this.error.set(value === null);
      });
    this.load();
  }
  load(days: AnalyticsRange = this.days()): void {
    this.days.set(days);
    this.loading.set(true);
    this.error.set(false);
    this.requests.next(days);
  }
}
