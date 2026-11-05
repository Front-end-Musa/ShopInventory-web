import { TestBed } from '@angular/core/testing';
import { ProductBarcode } from './product-barcode';

describe('ProductBarcode', () => {
  function setup(barcode: string | null = null, sku = 'SKU-001') {
    const fixture = TestBed.createComponent(ProductBarcode);
    fixture.componentRef.setInput('sku', sku);
    fixture.componentRef.setInput('barcode', barcode);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the existing barcode as accessible SVG', () => {
    const fixture = setup('0012345678905');
    const element = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance.value()).toBe('0012345678905');
    expect(element.querySelector('svg')?.getAttribute('aria-label')).toBe('Code 128 barcode: 0012345678905');
    expect(element.querySelector('path')?.getAttribute('d')).toBeTruthy();
    expect(element.querySelector('figcaption')?.textContent).toContain('0012345678905');
  });

  it('falls back to the SKU when the barcode is missing or blank', () => {
    const fixture = setup('   ');
    expect(fixture.componentInstance.value()).toBe('SKU-001');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Internal SKU');
    expect(fixture.componentInstance.encoding()).not.toBeNull();
  });

  it('updates the rendered bars when inputs change', () => {
    const fixture = setup();
    const first = fixture.componentInstance.encoding()?.path;
    fixture.componentRef.setInput('barcode', '987654321');
    fixture.detectChanges();
    expect(fixture.componentInstance.encoding()?.path).not.toBe(first);
  });

  it('shows text instead of crashing on unsupported characters', () => {
    const fixture = setup('商品');
    expect(fixture.componentInstance.encoding()).toBeNull();
    expect((fixture.nativeElement as HTMLElement).querySelector('svg')).toBeNull();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Barcode unavailable');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('商品');
  });

  it('handles missing barcode and SKU', () => {
    const fixture = setup(null, '');
    expect(fixture.componentInstance.encoding()).toBeNull();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Not provided');
  });

  it('retains quiet zones and native barcode width for long values', () => {
    const fixture = setup('LONG-SKU-1234567890-1234567890');
    const code = fixture.componentInstance.encoding();
    expect(code?.path.startsWith('M10 ')).toBe(true);
    expect(Number((fixture.nativeElement as HTMLElement).querySelector('svg')?.getAttribute('width'))).toBe((code?.width ?? 0) * 1.5);
    expect((fixture.nativeElement as HTMLElement).querySelector('[tabindex="0"]')).not.toBeNull();
  });
});
