import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface SidebarSection {
  title: string;
  link: string;
  icon: string
}

@Component({
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  selector: 'app-sidebar',
  styleUrl: './sidebar.scss',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  public sidebarSections: SidebarSection[] = [ 
    {
      title: "Dashboard",
      link: "/dashboard",
      icon: "home"
    },
    {
      title: "Products",
      link: "/products",
      icon: "shop"
    },
    {
      title: "Categories",
      link: "/category",
      icon: "table"
    },
  ]
}
