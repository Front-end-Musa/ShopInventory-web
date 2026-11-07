import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../data-access/products.models';

@Component({
  imports: [CurrencyPipe, RouterLink, MatTableModule, MatButtonModule],
  selector: 'app-product-table',
  styleUrl: './product-table.scss',
  templateUrl: './product-table.html',
})
export class ProductTable {
  readonly deleting = input(false);
  readonly columns = ['name', 'sku', 'category', 'price', 'quantity', 'status', 'actions'];
  readonly deleteRequested = output<Product>();
  readonly products = input.required<readonly Product[]>();
}
