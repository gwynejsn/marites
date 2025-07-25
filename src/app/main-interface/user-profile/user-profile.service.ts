import { Injectable } from '@angular/core';
import { Auth, authState, User } from '@angular/fire/auth';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import { select, Store } from '@ngrx/store';
import { getDoc } from 'firebase/firestore';
import { firstValueFrom, Observable } from 'rxjs';
import { storeStructure } from '../../app.config';
import { selectCurrUserUID } from '../../authentication/store/authentication.selectors';
import { CloudinaryService } from '../../shared/cloudinary.service';
import { UserProfile } from '../../shared/model/user-profile.model';
import { setUserProfile } from './store/user-profile.actions';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private authState$: Observable<User | null>;

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private store$: Store<storeStructure>,
    private cloudinaryService: CloudinaryService
  ) {
    this.authState$ = authState(this.auth);
  }

  // Save user profile using UID as document ID
  async addUserProfile(userProfile: UserProfile): Promise<void> {
    const userUID = await firstValueFrom(
      this.store$.pipe(select(selectCurrUserUID))
    );

    if (!userUID) throw new Error('User not authenticated');

    const userDocRef = doc(this.firestore, 'users', userUID);
    // upload user profile
    await setDoc(userDocRef, { ...userProfile });
    // set locally
    this.store$.dispatch(setUserProfile({ userProfile: userProfile }));
  }

  async getUserProfile(): Promise<UserProfile> {
    const userUID = await firstValueFrom(
      this.store$.pipe(select(selectCurrUserUID))
    );

    if (!userUID) throw new Error('User not authenticated');

    const docRef = doc(this.firestore, 'users', userUID);
    return (await getDoc(docRef)).data() as UserProfile;
  }

  async loadUserProfile(): Promise<void> {
    const userProfileFetched = await this.getUserProfile();
    this.store$.dispatch(setUserProfile({ userProfile: userProfileFetched }));
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
