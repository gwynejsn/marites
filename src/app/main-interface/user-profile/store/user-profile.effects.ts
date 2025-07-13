import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs';
import { storeStructure } from '../../../app.config';
import { UserProfileService } from '../user-profile.service';
import { removeUserProfile, setUserProfile } from './user-profile.actions';

@Injectable({ providedIn: 'root' })
export class UserProfileEffects {
  private actions$ = inject(Actions);
  constructor(
    private auth: Auth,
    private userProfileService: UserProfileService,
    private router: Router,
    private store$: Store<storeStructure>
  ) {}

  saveUserProfileLocalStorage = createEffect(
    () =>
      this.actions$.pipe(
        ofType(setUserProfile),
        tap(({ userProfile }) => {
          localStorage.setItem('userProfile', JSON.stringify(userProfile));
        })
      ),
    { dispatch: false }
  );

  removeUserProfile = createEffect(
    () =>
      this.actions$.pipe(
        ofType(removeUserProfile),
        tap(() => {
          localStorage.clear();
        })
      ),
    {
      dispatch: false,
    }
  );
}
