import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';
import { ConfirmDialogComponent } from '../generic/confirm-dialog/confirm-dialog.component';
import { DarkModeService } from '../shared/dark-mode.service';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterModule,
    CommonModule,
    ConfirmDialogComponent,
  ],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  showSidebar = signal(false);
  showLogoutPopup = signal(false);

  constructor(
    public darkModeService: DarkModeService,
    private authenticationService: AuthenticationService
  ) {}

  toggleSidebar() {
    this.showSidebar.update((v) => !v);
  }

  logout() {
    this.authenticationService.logout();
  }
}
