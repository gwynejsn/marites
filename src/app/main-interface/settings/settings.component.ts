import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { storeStructure } from '../../app.config';
import { logout } from '../user-profile/store/user-profile.actions';

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  constructor(
    private auth: Auth,
    private router: Router,
    private store$: Store<storeStructure>
  ) {}
  logout() {
    this.store$.dispatch(logout());
  }
}
