import { Injectable } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { signOut, User } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { removeUserProfile } from '../main-interface/user-profile/store/user-profile.actions';
import { UserProfileService } from '../main-interface/user-profile/user-profile.service';
import { UserProfile } from '../shared/model/user-profile.model';
import { gender, signUpForm } from '../shared/types';
import {
  loginFailure,
  loginSuccess,
  logoutFailure,
  logoutSuccess,
  signUpFailure,
  signUpStart,
  signUpSuccess,
} from './store/authentication.actions';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private authState$: Observable<User | null>;
  constructor(
    private auth: Auth,
    private userProfileService: UserProfileService,
    private store$: Store,
    private router: Router
  ) {
    this.authState$ = authState(auth);
  }

  async signUp(form: signUpForm): Promise<void> {
    this.store$.dispatch(signUpStart()); // set loading to true
    try {
      // create acc
      await createUserWithEmailAndPassword(
        this.auth,
        form.email,
        form.password
      );

      // create user profile
      let imgUrl = environment.defaultProfilePicture;
      /**
       * 🌩️ Cloudinary Integration
       * In production, uncomment the code below to upload the profile picture to Cloudinary.
       *
       * if (profilePicture) {
       *   imgUrl = await this.userProfileService.uploadProfilePicture(profilePicture);
       * }
       */

      const newUserProfile = new UserProfile(
        form.firstName,
        form.lastName,
        form.age!,
        form.gender as gender,
        form.email,
        imgUrl,
        'Online',
        Timestamp.now()
      );

      // upload user profile
      await this.userProfileService.addUserProfile(newUserProfile);
      this.store$.dispatch(signUpSuccess()); // set loading to false
      this.router.navigate(['/chat-area']);
    } catch (err: any) {
      this.store$.dispatch(
        signUpFailure({
          error: this.handleErrors(err.code) || 'Signup failed',
        })
      );
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.store$.dispatch(removeUserProfile());
      this.router.navigate(['/authentication']);
      this.store$.dispatch(logoutSuccess());
    } catch (err: any) {
      this.store$.dispatch(
        logoutFailure({ error: this.handleErrors(err.code) || 'Logout failed' })
      );
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const loggedIn = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      console.log(loggedIn);

      // get user and set profile
      await this.userProfileService.loadUserProfile();
      this.store$.dispatch(loginSuccess());
      this.router.navigate(['/chat-area']);
    } catch (err: any) {
      this.store$.dispatch(
        loginFailure({ error: this.handleErrors(err.code) || 'Login failed' })
      );
    }
  }

  async autoLogin(): Promise<void> {
    const user = await firstValueFrom(this.authState$);
    console.log(user);
    if (user) {
      // change isAuthenticated
      this.store$.dispatch(loginSuccess());
      // load profile
      await this.userProfileService.autoLoadUserProfile();
    }
  }

  handleErrors(errMsg: string): string {
    switch (errMsg) {
      case 'auth/email-already-in-use':
        return 'This email is already associated with an account.';
      case 'auth/invalid-email':
        return 'The email address is badly formatted.';
      case 'auth/operation-not-allowed':
        return 'Creating accounts is currently disabled. Please contact support.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/internal-error':
        return 'An internal error occurred. Please try again.';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return 'Invalid email or password.';
      case 'auth/user-not-found':
        return 'No user found with this email.';
      case 'auth/user-disabled':
        return 'This user account has been disabled.';
      default:
        return 'An unknown error occurred. Please try again.';
    }
  }
}
