import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductsApiService } from './products-api.service';

describe('ProductsApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] }));
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('combines category, search, sorting and pagination', () => {
    TestBed.inject(ProductsApiService).getAll({ categoryId: 3, searchInput: ' bread ', page: 2, pageSize: 10, sortBy: 'price', sortOrder: 'desc' }).subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne(r => r.url.endsWith('/products'));
    expect(request.request.params.get('categoryId')).toBe('3');
    expect(request.request.params.get('searchInput')).toBe('bread');
    expect(request.request.params.get('page')).toBe('2');
    request.flush({ products: [], totalCount: 0, totalPages: 0, page: 2, pageSize: 10 });
  });
  it('omits category for all categories', () => {
    TestBed.inject(ProductsApiService).getAll({ searchInput: '', page: 1, pageSize: 10, sortBy: 'name', sortOrder: 'asc' }).subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne(r => r.url.endsWith('/products'));
    expect(request.request.params.has('categoryId')).toBe(false);
    request.flush({ products: [], totalCount: 0, totalPages: 0, page: 1, pageSize: 10 });
  });
  it('accepts an update with no response body', () => {
    let completed = false;
    TestBed.inject(ProductsApiService).update(4, { name: 'Bread', sku: 'B', price: 2, costPrice: 1, categoryId: 1, quantityInStock: 3, minimumStockLevel: 1 }).subscribe(() => completed = true);
    const request = TestBed.inject(HttpTestingController).expectOne(r => r.url.endsWith('/products/4'));
    expect(request.request.method).toBe('PUT');
    request.flush(null, { status: 204, statusText: 'No Content' });
    expect(completed).toBe(true);
  });
});
