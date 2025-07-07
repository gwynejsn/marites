import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { storeStructure } from '../../app.config';
import {
  loginStart,
  resetLoadingError,
} from '../../main-interface/user-profile/store/user-profile.actions';
import {
  selectUserProfileError,
  selectUserProfileLoading,
} from '../../main-interface/user-profile/store/user-profile.selectors';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styles: ``,
})
export class LoginComponent {
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor(private router: Router, private store$: Store<storeStructure>) {
    store$.dispatch(resetLoadingError());
    this.loading$ = store$.pipe(select(selectUserProfileLoading));
    this.error$ = store$.pipe(select(selectUserProfileError));
  }

  login(val: { email: string; password: string }) {
    this.store$.dispatch(
      loginStart({ email: val.email, password: val.password })
    );
  }
}
