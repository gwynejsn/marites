import { inject, Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Timestamp } from 'firebase/firestore';
import { catchError, from, map, mergeMap, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { storeStructure } from '../../../app.config';
import { UserProfile } from '../../../shared/model/user-profile.model';
import { gender } from '../../../shared/types';
import { UserProfileService } from '../user-profile.service';
import {
  loginFailure,
  loginStart,
  loginSuccess,
  logout,
  signUpFailure,
  signUpStart,
  signUpSuccess,
} from './user-profile.actions';

@Injectable({ providedIn: 'root' })
export class UserProfileEffects {
  private actions$ = inject(Actions);
  constructor(
    private auth: Auth,
    private userProfileService: UserProfileService,
    private router: Router,
    private store$: Store<storeStructure>
  ) {}

  signUp = createEffect(() =>
    this.actions$.pipe(
      ofType(signUpStart),
      switchMap(({ form }) => {
        const {
          email,
          password,
          firstName,
          lastName,
          age,
          gender,
          profilePicture,
        } = form;

        return from(
          createUserWithEmailAndPassword(this.auth, email, password)
        ).pipe(
          switchMap(() => {
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
              firstName,
              lastName,
              age!,
              gender as gender,
              email,
              imgUrl,
              'Online',
              Timestamp.now(),
              []
            );

            return from(
              this.userProfileService.addUserProfile(newUserProfile)
            ).pipe(map(() => signUpSuccess({ userProfile: newUserProfile })));
          }),
          catchError((err) => {
            return of(
              signUpFailure({
                error: this.handleErrors(err.code) || 'Signup failed',
              })
            );
          })
        );
      })
    )
  );

  updateLastSeenAndStatus = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess),
        mergeMap(() =>
          from(
            this.userProfileService.updateStatusAndLastSeen(Timestamp.now())
          ).pipe(tap(() => this.router.navigate(['/chat-area'])))
        )
      ),
    { dispatch: false }
  );

  saveUserProfileLocalStorage = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess),
        tap(({ userProfile }) => {
          localStorage.setItem('userProfile', JSON.stringify(userProfile));
        })
      ),
    { dispatch: false }
  );

  logout = createEffect(
    () =>
      this.actions$.pipe(
        ofType(logout),
        tap(() => {
          localStorage.clear();
        }),
        switchMap(() => {
          return from(signOut(this.auth)).pipe(
            tap(() => {
              this.router.navigate(['/authentication']);
            })
          );
        })
      ),
    {
      dispatch: false,
    }
  );

  login = createEffect(() =>
    this.actions$.pipe(
      ofType(loginStart),
      switchMap(({ email, password }) =>
        from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
          switchMap(() =>
            from(this.userProfileService.getUserProfile()).pipe(
              map((userProfileFetched) => {
                if (userProfileFetched)
                  return loginSuccess({ userProfile: userProfileFetched });
                else return loginFailure({ error: 'User profile NOT found' });
              }),
              catchError((err) =>
                of(
                  signUpFailure({
                    error: err.message || 'Failed to fetch user profile',
                  })
                )
              )
            )
          ),
          catchError((err) =>
            of(
              signUpFailure({
                error: this.handleErrors(err.code) || 'Login failed',
              })
            )
          )
        )
      )
    )
  );

  // TODO save to local storage user profile

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
      case 'auth/invalid-email':
        return 'The email address is badly formatted.';
      case 'auth/internal-error':
        return 'An internal error occurred. Please try again.';
      default:
        return 'An unknown error occurred. Please try again.';
    }
  }
}
