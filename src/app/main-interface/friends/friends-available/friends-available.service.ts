import { Injectable } from '@angular/core';
import { Auth, authState, User } from '@angular/fire/auth';
import {
  arrayUnion,
  collection,
  doc,
  Firestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from '@angular/fire/firestore';
import { select, Store } from '@ngrx/store';
import { firstValueFrom, Observable, switchMap, throwError } from 'rxjs';
import { storeStructure } from '../../../app.config';
import { FriendRequest } from '../../../shared/model/friend-request.model';
import { UserProfile } from '../../../shared/model/user-profile.model';
import { selectUserProfile } from '../../user-profile/store/user-profile.selectors';
import { FriendRequestsService } from '../friend-requests/friend-requests.service';
import { FriendsService } from '../friends.service';

@Injectable({ providedIn: 'root' })
export class FriendsAvailableService {
  private authState$: Observable<User | null>;
  private userProfile: UserProfile | null = null;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private store$: Store<storeStructure>,
    private friendRequestsService: FriendRequestsService,
    private friendsService: FriendsService
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

        const usersColRef = collection(this.firestore, 'users');

        return new Observable<{ id: string; profile: UserProfile }[]>(
          (subscriber) => {
            const usersUnsubscribe = onSnapshot(
              usersColRef,
              (snapshot) => {
                const filteredUsers = snapshot.docs
                  .map((request) => ({
                    id: request.id,
                    profile: UserProfile.fromJSON(request.data()),
                  }))
                  .filter(
                    (p) =>
                      !p.profile.friendSuggestionsBlacklist?.includes(
                        user.uid
                      ) && p.id !== user.uid
                  );
                subscriber.next(filteredUsers);
              },
              (error) => subscriber.error(error)
            );

            return usersUnsubscribe;
          }
        );
      })
    );
  }

  async addFriend(UID: string): Promise<void> {
    const user = await firstValueFrom(this.authState$);
    if (user && this.userProfile) {
      try {
        // creating my friend request info
        const fullName =
          this.userProfile.firstName + ' ' + this.userProfile.lastName;
        const friendRequest: FriendRequest = new FriendRequest(
          user.uid,
          fullName,
          this.userProfile.profilePicture,
          'pending',
          Timestamp.now()
        );
        // get reference to who i will send
        const requestDocRef = doc(
          this.firestore,
          `users/${UID}/friendRequests/${user.uid}`
        );
        // sending my friend request (adding in the collection)
        await setDoc(requestDocRef, { ...friendRequest }); // use setDoc

        // save to sent requests
        await setDoc(
          doc(this.firestore, `users/${user.uid}/sentFriendRequests/${UID}`),
          {
            receiverId: UID,
            createdAt: serverTimestamp(),
          }
        );

        // add to his blacklist my UID
        await updateDoc(doc(this.firestore, `users/${user.uid}`), {
          friendSuggestionsBlacklist: arrayUnion(UID),
        });
        // add to my blacklist his UID
        await updateDoc(doc(this.firestore, `users/${UID}`), {
          friendSuggestionsBlacklist: arrayUnion(user.uid),
        });

        // TODO: throw an error and handle in template
      } catch (err) {
        console.log(err);
      }
    }
  }
}
