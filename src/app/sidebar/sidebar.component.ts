import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { DarkModeService } from '../shared/dark-mode.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  showSidebar = signal(false);

  constructor(public darkModeService: DarkModeService) {}

  toggleSidebar() {
    this.showSidebar.update((v) => !v);
  }
}
