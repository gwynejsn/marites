import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Auth, authState, User } from '@angular/fire/auth';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { storeStructure } from './app.config';
import { autoLoadFromLocalStorage } from './main-interface/user-profile/store/user-profile.actions';
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

  constructor(private auth: Auth, store$: Store<storeStructure>) {
    const authState$ = authState(auth);
    authState$.subscribe((user: User | null) => {
      this.authenticated = user ? true : false;
    });
    store$.dispatch(autoLoadFromLocalStorage());
  }
}
