import { RouterLink } from '@angular/router';
import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../data-access/products.models';

@Component({
  imports: [CurrencyPipe, RouterLink],
  selector: 'app-product-table',
  styleUrl: './product-table.scss',
  templateUrl: './product-table.html',
})
export class ProductTable {
  readonly deleteRequested = output<Product>();
  readonly products = input.required<readonly Product[]>();
}
