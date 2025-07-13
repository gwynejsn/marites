import { Injectable } from '@angular/core';
import { Auth, authState, User } from '@angular/fire/auth';
import {
  collection,
  collectionGroup,
  doc,
  Firestore,
  getDocs,
  setDoc,
  Timestamp,
} from '@angular/fire/firestore';
import { select, Store } from '@ngrx/store';
import {
  firstValueFrom,
  forkJoin,
  from,
  map,
  Observable,
  switchMap,
  throwError,
} from 'rxjs';
import { storeStructure } from '../../app.config';
import { FriendRequest } from '../../shared/model/friend-request.model';
import { UserProfile } from '../../shared/model/user-profile.model';
import { selectUserProfile } from '../user-profile/store/user-profile.selectors';

@Injectable({ providedIn: 'root' })
export class FriendsService {
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

  getAddableUsers(): Observable<
    {
      id: string;
      profile: UserProfile;
    }[]
  > {
    return this.authState$.pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(() => new Error('User not authenticated'));
        }

        // angular fire observables
        const users$ = from(getDocs(collection(this.firestore, 'users')));
        const sentFriendRequests$ = from(
          getDocs(collectionGroup(this.firestore, 'friendRequests'))
        );
        const receivedFriendRequests$ = from(
          getDocs(
            collection(this.firestore, 'users', user.uid, 'friendRequests')
          )
        );
        const currentFriends$ = from(
          getDocs(collection(this.firestore, 'users', user.uid, 'friends'))
        );

        return forkJoin([
          users$,
          sentFriendRequests$,
          receivedFriendRequests$,
          currentFriends$,
        ]).pipe(
          map(([usersSnap, sentSnap, receivedSnap, friendsSnap]) => {
            const currentUserId = user.uid;

            const sentTo = sentSnap.docs
              .filter((doc) => doc.ref.parent.parent?.id === currentUserId) // your sent requests
              .map((doc) => doc.id);

            const receivedFrom = receivedSnap.docs.map((doc) => doc.id);

            const friends = friendsSnap.docs.map((doc) => doc.id);

            const blacklist = new Set<string>([
              currentUserId,
              ...sentTo,
              ...receivedFrom,
              ...friends,
            ]);

            return usersSnap.docs
              .filter((doc) => !blacklist.has(doc.id))
              .map((doc) => ({
                id: doc.id,
                profile: UserProfile.fromJSON(doc.data()),
              }));
          })
        );
      })
    );
  }

  async addFriend(UID: string): Promise<void> {
    const user = await firstValueFrom(this.authState$);
    if (user && this.userProfile) {
      try {
        const fullName =
          this.userProfile.firstName + ' ' + this.userProfile.lastName;
        const friendRequest: FriendRequest = new FriendRequest(
          user.uid,
          fullName,
          this.userProfile.profilePicture,
          'pending',
          Timestamp.now()
        );
        const requestDocRef = doc(
          this.firestore,
          `users/${UID}/friendRequests/${user.uid}`
        );
        await setDoc(requestDocRef, { ...friendRequest }); // use setDoc
      } catch (err) {
        console.log(err);
      }
    }
  }
}
