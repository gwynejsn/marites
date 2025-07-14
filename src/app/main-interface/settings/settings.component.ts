import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { storeStructure } from '../../app.config';
import { AuthenticationService } from '../../authentication/authentication.service';

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  constructor(
    private auth: Auth,
    private router: Router,
    private store$: Store<storeStructure>,
    private authenticationService: AuthenticationService
  ) {}
  logout() {
    this.authenticationService.logout();
  }
}
