import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ProductsList } from './products-list';
import { ProductsFacade } from '../../state/products.facade';
import { ProductsApiService } from '../../data-access/products-api.service';
import { CategoriesFacade } from '../../../category/data-access/categories.facade';
import { AnalyticsService } from '../../../dashboard/analytics.service';
import { PreferencesService } from '../../../../shared/preferences.service';
import { MatButtonToggleHarness } from '@angular/material/button-toggle/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
describe('Products catalog', () => {
  const query = signal({
    page: 1,
    pageSize: 20,
    sortBy: 'name',
    sortOrder: 'asc',
    searchInput: '',
  });
  const loadProducts = vi.fn();
  const categoryChanged = vi.fn();
  const save = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    query.set({ page: 1, pageSize: 20, sortBy: 'name', sortOrder: 'asc', searchInput: '' });
    TestBed.configureTestingModule({
      imports: [ProductsList],
      providers: [
        provideRouter([]),
        {
          provide: ProductsFacade,
          useValue: {
            query,
            products$: of([]),
            totalCount$: of(0),
            isLoading$: of(false),
            error$: of(null),
            loadProducts,
            categoryChanged,
            searchChanged: vi.fn(),
          },
        },
        { provide: ProductsApiService, useValue: { delete: vi.fn() } },
        {
          provide: CategoriesFacade,
          useValue: { categories: signal([]), status: signal('loaded'), load: vi.fn() },
        },
        {
          provide: AnalyticsService,
          useValue: { overview: () => throwError(() => new Error('offline')) },
        },
        {
          provide: PreferencesService,
          useValue: { ready: signal(true), value: signal({ view: 'grid', pageSize: 20 }), save },
        },
      ],
    });
  });
  it('applies display defaults once and keeps page indices compatible with API', async () => {
    const fixture = TestBed.createComponent(ProductsList);
    await fixture.whenStable();
    expect(loadProducts).toHaveBeenCalledWith(1, 20);
    fixture.componentInstance.pageChanged({ pageIndex: 2, pageSize: 50, length: 150 });
    expect(loadProducts).toHaveBeenLastCalledWith(3, 50, 'name', 'asc');
  });
  it('changes views with the Material toggle and persists the choice', async () => {
    const fixture = TestBed.createComponent(ProductsList);
    await fixture.whenStable();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const table = await loader.getHarness(
      MatButtonToggleHarness.with({ selector: '[value="table"]' }),
    );
    await table.check();
    expect(fixture.componentInstance.viewMode()).toBe('table');
    expect(save).toHaveBeenCalledWith({ view: 'table', pageSize: 20 });
  });
  it('keeps catalog usable when analytics fails and delegates filters and sort', async () => {
    const fixture = TestBed.createComponent(ProductsList);
    await fixture.whenStable();
    expect(fixture.componentInstance.analyticsError()).toBe(true);
    fixture.componentInstance.categoryChanged(7);
    expect(categoryChanged).toHaveBeenCalledWith(7);
    fixture.componentInstance.onSortChange('price-desc');
    expect(loadProducts).toHaveBeenLastCalledWith(1, 20, 'price', 'desc');
    expect(fixture.nativeElement.textContent).toContain('No products found');
  });
});
