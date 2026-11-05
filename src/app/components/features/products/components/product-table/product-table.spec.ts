import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductTable } from './product-table';

describe('ProductTable', () => {
  let component: ProductTable;
  let fixture: ComponentFixture<ProductTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductTable],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductTable);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('products', []);
    await fixture.whenStable();
  });

  it('emits the selected product for deletion', () => {
    const product = { id: 1, name: 'Bread', sku: 'B', barcode: null, description: null, price: 2, costPrice: 1, categoryId: 1, category: { id: 1, name: 'Food' }, quantityInStock: 3, minimumStockLevel: 1 };
    fixture.componentRef.setInput('products', [product]);
    let selected: unknown;
    component.deleteRequested.subscribe(value => selected = value);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector('button')?.click();
    expect(selected).toBe(product);
    expect((fixture.nativeElement as HTMLElement).querySelector('a')?.getAttribute('href')).toBe('/products/1/edit');
  });

  it('should create' , () => {
    expect(component).toBeTruthy();
  });
});
