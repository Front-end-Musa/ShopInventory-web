import { Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
@Component({
  imports: [MatDialogModule, MatButtonModule],
  template: `<h2 mat-dialog-title>Your shop, under control</h2>
    <mat-dialog-content
      ><p>Add categories, then create products with prices and stock levels.</p>
      <p>
        Use search and filters to find products. Low-stock badges identify products below their
        minimum stock level. Export downloads the currently loaded catalog page.
      </p>
      <p>
        Dashboard analytics show inventory health. Sales and historical metrics require a connected
        data source.
      </p></mat-dialog-content
    ><mat-dialog-actions align="end"
      ><button mat-button mat-dialog-close>Got it</button></mat-dialog-actions
    >`,
})
export class InventoryHelp {}
@Component({
  imports: [RouterLink, RouterLinkActive, MatIconModule, MatListModule, MatButtonModule],
  selector: 'app-sidebar',
  styleUrl: './sidebar.scss',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  readonly compact = input(false);
  private readonly dialog = inject(MatDialog);
  readonly sidebarSections = [
    { title: 'Dashboard', link: '/dashboard', icon: 'dashboard' },
    { title: 'Products', link: '/products', icon: 'inventory_2' },
    { title: 'Categories', link: '/categories', icon: 'category' },
    { title: 'Settings', link: '/settings', icon: 'settings' },
  ];
  help(): void {
    this.dialog.open(InventoryHelp, { width: '480px', restoreFocus: true });
  }
}
