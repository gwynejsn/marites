import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Auth, authState, User } from '@angular/fire/auth';
import { RouterOutlet } from '@angular/router';
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

  constructor(private auth: Auth) {
    const authState$ = authState(auth);
    authState$.subscribe(
      (user: User | null) => (this.authenticated = user ? true : false)
    );
  }
}
