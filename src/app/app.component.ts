import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router, RouterOutlet } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { storeStructure } from './app.config';
import { AuthenticationService } from './authentication/authentication.service';
import { selectIsAuthenticated } from './authentication/store/authentication.selectors';
import { DarkModeService } from './shared/dark-mode.service';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'marites';
  isAuthenticated$: Observable<boolean>;

  constructor(
    private auth: Auth,
    private store$: Store<storeStructure>,
    private darkModeService: DarkModeService,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
    this.isAuthenticated$ = store$.pipe(select(selectIsAuthenticated));
    authenticationService.autoLogin();
  }

  get isAuthRoute(): boolean {
    return this.router.url.startsWith('/authentication');
  }
}
