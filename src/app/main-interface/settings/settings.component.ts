import { Component } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  constructor(private auth: Auth, private router: Router) {}
  logout() {
    signOut(this.auth)
      .then(() => this.router.navigate(['/authentication']))
      .catch((err) => console.log('sign out error: ' + err));
  }
}
