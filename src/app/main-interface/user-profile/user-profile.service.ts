import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  doc,
  DocumentData,
  DocumentSnapshot,
  Firestore,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { getDoc, Timestamp } from 'firebase/firestore';
import { cloudinary } from '../../../environments/cloudinary';
import { UserProfile } from '../../shared/model/user-profile.model';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  // Save user profile using UID as document ID
  async addUserProfile(userProfile: UserProfile): Promise<void> {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const userDocRef = doc(this.firestore, 'users', currentUser.uid);
      await setDoc(userDocRef, { ...userProfile });

      console.log('User profile added with UID:', currentUser.uid);
    } catch (err) {
      console.error('Error adding user profile:', err);
      throw err;
    }
  }

  async getUserProfile(): Promise<UserProfile | null> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      console.warn('No authenticated user.');
      return null;
    }

    const docRef = doc(this.firestore, 'users', currentUser.uid);
    const docSnap: DocumentSnapshot<DocumentData> = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      console.warn('User profile not found.');
      return null;
    }
  }

  async updateStatusAndLastSeen(to: Timestamp) {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      console.warn('No authenticated user.');
      return;
    }

    const profile = await this.getUserProfile();
    if (profile) {
      profile.lastSeen = to;
      profile.status = 'Online';

      try {
        const docRef = doc(this.firestore, 'users', currentUser.uid);
        await updateDoc(docRef, { ...profile });
      } catch (err) {
        console.error('Error updating current status and last seen:', err);
        throw err;
      }
    }
  }

  // Upload profile picture to Cloudinary
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
