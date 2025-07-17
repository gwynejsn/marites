import { Injectable } from '@angular/core';
import { Auth, authState, User } from '@angular/fire/auth';
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
import { FriendRequest } from '../../../shared/model/friend-request.model';
import { Friend } from '../../../shared/model/friend.model';
import { UserProfile } from '../../../shared/model/user-profile.model';
import { ChatService } from '../../chat-area/chat.service';
import { selectUserProfile } from '../../user-profile/store/user-profile.selectors';

@Injectable({ providedIn: 'root' })
export class FriendRequestsService {
  private authState$: Observable<User | null>;
  private userProfile: UserProfile | null = null;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private store$: Store<storeStructure>,
    private chatService: ChatService
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

      // create a chat to this person
      console.log('calling chat service create chat');

      await this.chatService.createPrivateChat(UID, name, profilePicture);
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

      // remove to my blacklist his UID
      await updateDoc(doc(this.firestore, `users/${user.uid}`), {
        friendSuggestionsBlacklist: arrayRemove(UID),
      });
      // remove to his blacklist my UID
      await updateDoc(doc(this.firestore, `users/${UID}`), {
        friendSuggestionsBlacklist: arrayRemove(user.uid),
      });
    }
  }
}
