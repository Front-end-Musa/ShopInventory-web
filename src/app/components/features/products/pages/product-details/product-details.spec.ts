import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ProductDetails } from './product-details';
import { ProductsApiService } from '../../data-access/products-api.service';
describe('Product details', () => {
  const getById = vi.fn();
  beforeEach(() => {
    getById.mockReset();
    TestBed.configureTestingModule({
      imports: [ProductDetails],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: new Map([['id', '1']]) } } },
        { provide: ProductsApiService, useValue: { getById } },
      ],
    });
  });
  it('loads and displays product data', () => {
    getById.mockReturnValue(
      of({
        id: 1,
        name: 'Bread',
        sku: 'B1',
        barcode: null,
        description: null,
        price: 2,
        costPrice: 1,
        categoryId: 1,
        category: { id: 1, name: 'Food' },
        quantityInStock: 3,
        minimumStockLevel: 5,
      }),
    );
    const fixture = TestBed.createComponent(ProductDetails);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Bread');
    expect(fixture.nativeElement.textContent).toContain('Low stock');
  });
  it('distinguishes missing products and permits retry', () => {
    getById.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
    const fixture = TestBed.createComponent(ProductDetails);
    fixture.detectChanges();
    expect(fixture.componentInstance.error()).toBe('Product not found.');
    fixture.componentInstance.load();
    expect(getById).toHaveBeenCalledTimes(2);
  });
});
