import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ProductForm } from './product-form';
import { ProductsFacade } from '../../state/products.facade';
import { CategoryApiService } from '../../../category/data-access/category-api.service';

describe('ProductForm', () => {
  const createProduct = vi.fn();
  beforeEach(() => {
    createProduct.mockClear();
    TestBed.configureTestingModule({
      imports: [ProductForm],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { routeConfig: { path: 'new' } } } },
        { provide: ProductsFacade, useValue: {
          resetCreation: vi.fn(), createProduct,
          creationStatus: signal('idle'), creationError: signal(null),
        } },
        { provide: CategoryApiService, useValue: { getAll: () => of([{ id: 1, name: 'Food' }]) } },
      ],
    });
  });

  it('rejects invalid input', () => {
    const fixture = TestBed.createComponent(ProductForm);
    fixture.detectChanges();
    fixture.componentInstance.submit(new Event('submit'));
    expect(createProduct).not.toHaveBeenCalled();
  });

  it('submits the existing DTO with normalized optional fields', () => {
    const fixture = TestBed.createComponent(ProductForm);
    fixture.detectChanges();
    fixture.componentInstance.value.update(value => ({
      ...value, name: ' Bread ', sku: ' B1 ', price: 2, categoryId: 1,
    }));
    fixture.componentInstance.submit(new Event('submit'));
    expect(createProduct).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Bread', sku: 'B1', barcode: null, description: null, categoryId: 1,
    }));
  });
});
