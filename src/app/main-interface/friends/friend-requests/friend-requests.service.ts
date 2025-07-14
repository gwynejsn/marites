import { Injectable } from '@angular/core';
import { Auth, authState, User } from '@angular/fire/auth';
import {
  collection,
  deleteDoc,
  Firestore,
  getDocs,
  setDoc,
} from '@angular/fire/firestore';
import { select, Store } from '@ngrx/store';
import { doc } from 'firebase/firestore';
import {
  firstValueFrom,
  from,
  map,
  Observable,
  switchMap,
  throwError,
} from 'rxjs';
import { storeStructure } from '../../../app.config';
import { FriendRequest } from '../../../shared/model/friend-request.model';
import { Friend } from '../../../shared/model/friend.model';
import { UserProfile } from '../../../shared/model/user-profile.model';
import { selectUserProfile } from '../../user-profile/store/user-profile.selectors';

@Injectable({ providedIn: 'root' })
export class FriendRequestsService {
  private authState$: Observable<User | null>;
  private userProfile: UserProfile | null = null;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private store$: Store<storeStructure>
  ) {
    this.authState$ = authState(auth);
    store$.pipe(select(selectUserProfile)).subscribe((up) => {
      this.userProfile = up.userProfile;
    });
  }

  getFriendRequests(): Observable<
    { id: string; friendRequest: FriendRequest }[]
  > {
    return this.authState$.pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(() => new Error('User not authenticated'));
        }

        const colRef = collection(
          this.firestore,
          'users',
          user.uid,
          'friendRequests'
        );

        return from(getDocs(colRef)).pipe(
          map((snapshot) => {
            const requests = snapshot.docs.map((request) => {
              return {
                id: request.id,
                friendRequest: FriendRequest.fromJSON(request.data()),
              };
            });
            return requests;
          })
        );
      })
    );
  }

  async acceptRequest(
    UID: string,
    name: string,
    profilePicture: string
  ): Promise<void> {
    const user = await firstValueFrom(this.authState$);
    if (user && this.userProfile) {
      // add to my friends
      await setDoc(doc(this.firestore, `users/${user.uid}/friends/${UID}`), {
        ...new Friend(UID, name, profilePicture),
      });
      // add to his friends
      const fullName =
        this.userProfile.firstName + ' ' + this.userProfile.lastName;
      await setDoc(doc(this.firestore, `users/${UID}/friends/${user.uid}`), {
        ...new Friend(user.uid, fullName, this.userProfile.profilePicture),
      });
      // remove from my friend requests
      await deleteDoc(
        doc(this.firestore, `users/${user.uid}/friendRequests/${UID}`)
      );
      // remove from their sent requests
      await deleteDoc(
        doc(this.firestore, `users/${UID}/sentFriendRequests/${user.uid}`)
      );
    }
  }

  async rejectRequest(UID: string): Promise<void> {
    const user = await firstValueFrom(this.authState$);
    if (user && this.userProfile) {
      // remove from my friend requests
      await deleteDoc(
        doc(this.firestore, `users/${user.uid}/friendRequests/${UID}`)
      );
      // remove from their sent requests
      await deleteDoc(
        doc(this.firestore, `users/${UID}/sentFriendRequests/${user.uid}`)
      );
    }
  }
}
