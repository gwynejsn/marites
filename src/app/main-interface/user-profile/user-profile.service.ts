import { Injectable } from '@angular/core';
import { Auth, authState, User } from '@angular/fire/auth';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import { select, Store } from '@ngrx/store';
import { getDoc } from 'firebase/firestore';
import { firstValueFrom, Observable } from 'rxjs';
import { cloudinary } from '../../../environments/cloudinary';
import { storeStructure } from '../../app.config';
import { selectCurrUserUID } from '../../authentication/store/authentication.selectors';
import { UserProfile } from '../../shared/model/user-profile.model';
import { setUserProfile } from './store/user-profile.actions';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private authState$: Observable<User | null>;

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private store$: Store<storeStructure>
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

  async uploadProfilePicture(
    profilePicture: File | null
  ): Promise<string | null> {
    try {
      if (!profilePicture) return null;

      const data = new FormData();
      data.append('file', profilePicture);
      data.append('upload_preset', cloudinary.presetName);

      const endpoint = `https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/upload`;

      const res = await fetch(endpoint, {
        method: 'POST',
        body: data,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Cloudinary upload failed: ${res.status} ${errText}`);
      }

      const result = await res.json();
      return result.secure_url || result.url || null;
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      return null;
    }
  }
}
