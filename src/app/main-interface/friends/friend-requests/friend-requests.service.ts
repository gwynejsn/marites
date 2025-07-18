import { Injectable } from '@angular/core';
import {
  collection,
  deleteDoc,
  Firestore,
  onSnapshot,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { select, Store } from '@ngrx/store';
import { arrayRemove, doc } from 'firebase/firestore';
import { firstValueFrom, Observable, switchMap, throwError } from 'rxjs';
import { storeStructure } from '../../../app.config';
import { selectCurrUserUID } from '../../../authentication/store/authentication.selectors';
import { FriendRequest } from '../../../shared/model/friend-request.model';
import { Friend } from '../../../shared/model/friend.model';
import { UserProfile } from '../../../shared/model/user-profile.model';
import { ChatService } from '../../chat-area/chat.service';
import { selectUserProfile } from '../../user-profile/store/user-profile.selectors';

@Injectable({ providedIn: 'root' })
export class FriendRequestsService {
  private userProfile: UserProfile | null = null;

  constructor(
    private firestore: Firestore,
    private store$: Store<storeStructure>,
    private chatService: ChatService
  ) {
    store$.pipe(select(selectUserProfile)).subscribe((up) => {
      this.userProfile = up.userProfile;
    });
  }

  getFriendRequests(): Observable<
    { id: string; friendRequest: FriendRequest }[]
  > {
    return this.store$.pipe(
      select(selectCurrUserUID),
      switchMap((userUID) => {
        if (!userUID) {
          return throwError(() => new Error('User not authenticated'));
        }

        const colRef = collection(
          this.firestore,
          'users',
          userUID,
          'friendRequests'
        );

        return new Observable<{ id: string; friendRequest: FriendRequest }[]>(
          (subscriber) => {
            const unsubscribe = onSnapshot(
              colRef,
              (snapshot) => {
                const requests = snapshot.docs.map((request) => ({
                  id: request.id,
                  friendRequest: FriendRequest.fromJSON(request.data()),
                }));
                subscriber.next(requests);
              },
              (error) => subscriber.error(error)
            );

            return unsubscribe;
          }
        );
      })
    );
  }

  async acceptRequest(
    UID: string,
    name: string,
    profilePicture: string
  ): Promise<void> {
    const userUID = await firstValueFrom(
      this.store$.pipe(select(selectCurrUserUID))
    );

    if (userUID && this.userProfile) {
      // add to my friends
      await setDoc(doc(this.firestore, `users/${userUID}/friends/${UID}`), {
        ...new Friend(UID, name, profilePicture),
      });
      // add to his friends
      const fullName =
        this.userProfile.firstName + ' ' + this.userProfile.lastName;
      await setDoc(doc(this.firestore, `users/${UID}/friends/${userUID}`), {
        ...new Friend(userUID, fullName, this.userProfile.profilePicture),
      });
      // remove from my friend requests
      await deleteDoc(
        doc(this.firestore, `users/${userUID}/friendRequests/${UID}`)
      );
      // remove from their sent requests
      await deleteDoc(
        doc(this.firestore, `users/${UID}/sentFriendRequests/${userUID}`)
      );

      // create a chat to this person
      console.log('creating private chat');
      await this.chatService.createPrivateChat(UID, name, profilePicture);
    }
  }

  async rejectRequest(UID: string): Promise<void> {
    const userUID = await firstValueFrom(
      this.store$.pipe(select(selectCurrUserUID))
    );

    if (userUID && this.userProfile) {
      // remove from my friend requests
      await deleteDoc(
        doc(this.firestore, `users/${userUID}/friendRequests/${UID}`)
      );
      // remove from their sent requests
      await deleteDoc(
        doc(this.firestore, `users/${UID}/sentFriendRequests/${userUID}`)
      );

      // remove to my blacklist his UID
      await updateDoc(doc(this.firestore, `users/${userUID}`), {
        friendSuggestionsBlacklist: arrayRemove(UID),
      });
      // remove to his blacklist my UID
      await updateDoc(doc(this.firestore, `users/${UID}`), {
        friendSuggestionsBlacklist: arrayRemove(userUID),
      });
    }
  }
}
