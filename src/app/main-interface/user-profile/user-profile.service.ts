import { Injectable, OnDestroy } from '@angular/core';
import { Auth, authState, User } from '@angular/fire/auth';
import { doc, Firestore, onSnapshot, setDoc } from '@angular/fire/firestore';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription, switchMap, throwError } from 'rxjs';
import { storeStructure } from '../../app.config';
import { selectCurrUserUID } from '../../authentication/store/authentication.selectors';
import { CloudinaryService } from '../../shared/cloudinary.service';
import { UserProfile } from '../../shared/model/user-profile.model';
import { setUserProfile } from './store/user-profile.actions';

@Injectable({ providedIn: 'root' })
export class UserProfileService implements OnDestroy {
  private authState$: Observable<User | null>;
  private userProfileSub!: Subscription;

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private store$: Store<storeStructure>,
    private cloudinaryService: CloudinaryService
  ) {
    this.authState$ = authState(this.auth);
  }

  ngOnDestroy(): void {
    this.userProfileSub?.unsubscribe();
  }

  // Save user profile using UID as document ID
  async addUserProfile(
    userProfile: UserProfile,
    userUID: string
  ): Promise<void> {
    if (!userUID) throw new Error('User not authenticated');

    const userDocRef = doc(this.firestore, 'users', userUID);
    // upload user profile
    await setDoc(userDocRef, { ...userProfile });
    // set locally
    this.store$.dispatch(setUserProfile({ userProfile: userProfile }));
  }

  getUserProfile(): Observable<{
    id: string;
    profile: UserProfile;
  }> {
    return this.store$.pipe(
      select(selectCurrUserUID),
      switchMap((userUID) => {
        if (!userUID) {
          return throwError(() => new Error('User not authenticated'));
        }

        const docRef = doc(this.firestore, 'users', userUID);
        return new Observable<{ id: string; profile: UserProfile }>(
          (subscriber) => {
            const userProfileUnsubscribe = onSnapshot(
              docRef,
              (snapshot) =>
                subscriber.next({
                  id: snapshot.id,
                  profile: UserProfile.fromJSON(snapshot.data()),
                }),

              (error) => subscriber.error(error)
            );

            return userProfileUnsubscribe;
          }
        );
      })
    );
  }

  async loadUserProfile(): Promise<void> {
    this.userProfileSub = this.getUserProfile().subscribe((up) => {
      this.store$.dispatch(setUserProfile({ userProfile: up.profile }));
    });
  }

  async autoLoadUserProfile(): Promise<void> {
    const userProfileJSON = localStorage.getItem('userProfile');
    // 1 situation: saved locally
    if (userProfileJSON) {
      const userProfile = UserProfile.fromJSON(JSON.parse(userProfileJSON));
      this.store$.dispatch(setUserProfile({ userProfile: userProfile }));
    } else {
      // 2 situation: authenticated but local storage is cleared (when token is auto refreshed)
      this.loadUserProfile();
    }
  }
}
