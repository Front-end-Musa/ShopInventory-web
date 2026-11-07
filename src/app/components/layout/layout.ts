import { MatSidenavModule } from '@angular/material/sidenav';
import { Component } from '@angular/core';
import { Sidebar } from './sidebar/sidebar';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [Sidebar, RouterOutlet, MatSidenavModule],
  selector: 'app-layout',
  styleUrl: './layout.scss',
  templateUrl: './layout.html',
})
export class Layout {}
