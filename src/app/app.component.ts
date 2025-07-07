import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Auth, authState, User } from '@angular/fire/auth';
import { Router, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { storeStructure } from './app.config';
import { autoLoadFromLocalStorage } from './main-interface/user-profile/store/user-profile.actions';
import { DarkModeService } from './shared/dark-mode.service';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'marites';
  authenticated = false;

  constructor(
    private auth: Auth,
    private store$: Store<storeStructure>,
    private darkModeService: DarkModeService,
    private router: Router
  ) {
    const authState$ = authState(auth);
    authState$.subscribe((user: User | null) => {
      this.authenticated = user ? true : false;
    });
    store$.dispatch(autoLoadFromLocalStorage());
  }

  get isAuthRoute(): boolean {
    return this.router.url.startsWith('/authentication');
  }
}
