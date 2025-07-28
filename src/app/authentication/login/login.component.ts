import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { storeStructure } from '../../app.config';
import { AuthenticationService } from '../authentication.service';
import {
  selectAuthError,
  selectAuthLoading,
} from '../store/authentication.selectors';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styles: ``,
})
export class LoginComponent {
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  isMobile = false;

  constructor(
    private router: Router,
    private store$: Store<storeStructure>,
    private authenticationService: AuthenticationService
  ) {
    this.loading$ = store$.pipe(select(selectAuthLoading));
    this.error$ = store$.pipe(select(selectAuthError));
  }

  login(val: { email: string; password: string }) {
    this.authenticationService.login(val.email, val.password);
  }

  ngOnInit() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768; // md breakpoint
  }
}
