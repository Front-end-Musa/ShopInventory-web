import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AnalyticsService } from './analytics.service';
describe('Analytics API contract', () => {
  it('requests the selected reporting range and preserves unavailable sales', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(AnalyticsService)
      .overview(7)
      .subscribe((value) => {
        expect(value.sales.revenue).toBeNull();
        expect(value.availability.sales).toBe(false);
      });
    const request = http.expectOne('https://localhost:7126/api/analytics/overview?days=7');
    expect(request.request.method).toBe('GET');
    request.flush({ sales: { revenue: null, unitsSold: null }, availability: { sales: false } });
    http.verify();
  });
});
