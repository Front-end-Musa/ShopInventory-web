import { Component, computed, input } from '@angular/core';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-product-barcode',
  template: `
    <figure>
      @if (encoding(); as code) {
        <div class="barcode-scroll" tabindex="0" role="region" aria-label="Scrollable product barcode">
          <svg role="img" [attr.aria-label]="'Code 128 barcode: ' + value()"
            [attr.viewBox]="'0 0 ' + code.width + ' 64'" [attr.width]="code.width * 1.5" height="96">
            <rect width="100%" height="100%" fill="#fff" />
            <path [attr.d]="code.path" fill="#000" />
          </svg>
        </div>
      } @else {
        <p>Barcode unavailable</p>
      }
      <figcaption><span>{{ barcode()?.trim() ? 'Barcode' : 'Internal SKU' }}</span> {{ value() || 'Not provided' }}</figcaption>
    </figure>
  `,
  styles: [`
    :host { display: block; min-width: 0; width: 100%; }
    figure { margin: 0; padding: 1rem; background: #fff; color: #17243b; }
    .barcode-scroll { overflow-x: auto; text-align: center; }
    .barcode-scroll:focus-visible { outline: 2px solid #2456a6; outline-offset: 2px; }
    svg { display: block; margin-inline: auto; max-width: none; }
    figcaption { margin-top: .5rem; text-align: center; overflow-wrap: anywhere; font-family: monospace; }
    figcaption span { display: block; font-family: sans-serif; font-size: .75rem; margin-bottom: .25rem; }
    p { text-align: center; }
  `],
})
export class ProductBarcode {
  readonly barcode = input<string | null>(null);
  readonly sku = input.required<string>();
  readonly value = computed(() => this.barcode()?.trim() || this.sku().trim());
  readonly encoding = computed(() => {
    const value = this.value();
    if (!value) return null;
    const result: { encodings?: { data: string }[] } = {};
    try {
      JsBarcode(result, value, { format: 'CODE128', displayValue: false });
      const data = result.encodings?.map(encoding => encoding.data).join('');
      if (!data) return null;
      const path: string[] = [];
      for (let index = 0; index < data.length;) {
        if (data[index] !== '1') { index++; continue; }
        const start = index;
        while (data[index] === '1') index++;
        path.push(`M${start + 10} 4h${index - start}v56h-${index - start}z`);
      }
      return { width: data.length + 20, path: path.join('') };
    } catch {
      return null;
    }
  });
}
