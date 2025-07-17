import { Injectable } from '@angular/core';
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
import { selectCurrUserUID } from '../../../authentication/store/authentication.selectors';
import { FriendRequest } from '../../../shared/model/friend-request.model';
import { UserProfile } from '../../../shared/model/user-profile.model';
import { selectUserProfile } from '../../user-profile/store/user-profile.selectors';
import { FriendRequestsService } from '../friend-requests/friend-requests.service';
import { FriendsService } from '../friends.service';

@Injectable({ providedIn: 'root' })
export class FriendsAvailableService {
  private userProfile: UserProfile | null = null;

  constructor(
    private firestore: Firestore,
    private store$: Store<storeStructure>,
    private friendRequestsService: FriendRequestsService,
    private friendsService: FriendsService
  ) {
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
    return this.store$.pipe(
      select(selectCurrUserUID),
      switchMap((userUID) => {
        if (!userUID) {
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
                        userUID
                      ) && p.id !== userUID
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
    const userUID = await firstValueFrom(
      this.store$.pipe(select(selectCurrUserUID))
    );

    if (userUID && this.userProfile) {
      try {
        // creating my friend request info
        const fullName =
          this.userProfile.firstName + ' ' + this.userProfile.lastName;
        const friendRequest: FriendRequest = new FriendRequest(
          userUID,
          fullName,
          this.userProfile.profilePicture,
          'pending',
          Timestamp.now()
        );
        // get reference to who i will send
        const requestDocRef = doc(
          this.firestore,
          `users/${UID}/friendRequests/${userUID}`
        );
        // sending my friend request (adding in the collection)
        await setDoc(requestDocRef, { ...friendRequest }); // use setDoc

        // save to sent requests
        await setDoc(
          doc(this.firestore, `users/${userUID}/sentFriendRequests/${UID}`),
          {
            receiverId: UID,
            createdAt: serverTimestamp(),
          }
        );

        // add to his blacklist my UID
        await updateDoc(doc(this.firestore, `users/${userUID}`), {
          friendSuggestionsBlacklist: arrayUnion(UID),
        });
        // add to my blacklist his UID
        await updateDoc(doc(this.firestore, `users/${UID}`), {
          friendSuggestionsBlacklist: arrayUnion(userUID),
        });

        // TODO: throw an error and handle in template
      } catch (err) {
        console.log(err);
      }
    }
  }
}
