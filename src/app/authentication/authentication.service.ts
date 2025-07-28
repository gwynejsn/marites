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
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { removeUserProfile } from '../main-interface/user-profile/store/user-profile.actions';
import { UserProfileService } from '../main-interface/user-profile/user-profile.service';
import { CloudinaryService } from '../shared/cloudinary.service';
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
    private router: Router,
    private cloudinaryService: CloudinaryService
  ) {
    this.authState$ = authState(auth);
  }

  async signUp(form: signUpForm): Promise<void> {
    this.store$.dispatch(signUpStart()); // set loading to true
    try {
      // create acc
      const accCreatedRef = await createUserWithEmailAndPassword(
        this.auth,
        form.email,
        form.password
      );

      // create user profile
      let imgUrl;
      if (form.profilePicture)
        imgUrl = await this.cloudinaryService.upload(form.profilePicture);
      else imgUrl = environment.defaultProfilePicture;

      const newUserProfile = new UserProfile(
        form.firstName,
        form.lastName,
        form.age!,
        form.gender as gender,
        form.email,
        imgUrl!,
        []
      );

      console.log('adding profile ', newUserProfile);

      // upload user profile
      await this.userProfileService.addUserProfile(
        newUserProfile,
        accCreatedRef.user.uid
      );
      this.store$.dispatch(signUpSuccess({ uid: accCreatedRef.user.uid })); // set loading to false
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
      this.router.navigate(['/']);
      this.store$.dispatch(logoutSuccess());
    } catch (err: any) {
      this.store$.dispatch(
        logoutFailure({ error: this.handleErrors(err.code) || 'Logout failed' })
      );
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const loggedInRef = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      // get user and set profile
      this.store$.dispatch(loginSuccess({ uid: loggedInRef.user.uid }));
      await this.userProfileService.loadUserProfile();
      this.router.navigate(['/chat-area']);
    } catch (err: any) {
      this.store$.dispatch(
        loginFailure({ error: this.handleErrors(err.code) || 'Login failed' })
      );
    }
  }

  async autoLogin(): Promise<void> {
    const user = await firstValueFrom(this.authState$);
    if (user) {
      // change isAuthenticated
      this.store$.dispatch(loginSuccess({ uid: user.uid }));
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
