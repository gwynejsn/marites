import { Injectable } from '@angular/core';
import {
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  Firestore,
  onSnapshot,
  updateDoc,
} from '@angular/fire/firestore';
import { select, Store } from '@ngrx/store';
import { firstValueFrom, Observable, switchMap, throwError } from 'rxjs';
import { storeStructure } from '../../app.config';
import { selectCurrUserUID } from '../../authentication/store/authentication.selectors';
import { Friend } from '../../shared/model/friend.model';
import { MessagePreview } from '../../shared/model/message-preview';
import { ChatService } from '../chat-area/chat.service';
import { MessagesPreviewService } from '../chat-area/list-of-messages/message-preview/messages-preview.service';
import { selectUserProfile } from '../user-profile/store/user-profile.selectors';

@Injectable({ providedIn: 'root' })
export class FriendsService {
  constructor(
    private firestore: Firestore,
    private store$: Store<storeStructure>,
    private chatService: ChatService,
    private messagesPreviewService: MessagesPreviewService
  ) {}

  getFriends(): Observable<{ id: string; friend: Friend }[]> {
    return this.store$.pipe(
      select(selectCurrUserUID),
      switchMap((userUID) => {
        if (!userUID)
          return throwError(() => new Error('User not authenticated'));

        const ref = collection(this.firestore, `users/${userUID}/friends`);

        return new Observable<{ id: string; friend: Friend }[]>(
          (subscriber) => {
            const unsubscribe = onSnapshot(
              ref,
              (snapshot) => {
                const friends = snapshot.docs.map((request) => ({
                  id: request.id,
                  friend: Friend.fromJSON(request.data()),
                }));
                subscriber.next(friends);
              },
              (error) => subscriber.error(error)
            );

            // cleanup/teardown function
            return unsubscribe;
          }
        );
      })
    );
  }

  async unfriend(UID: string) {
    const userUID = await firstValueFrom(
      this.store$.pipe(select(selectCurrUserUID))
    );
    const userProfile = (
      await firstValueFrom(this.store$.pipe(select(selectUserProfile)))
    ).userProfile;

    if (!userUID || !userProfile) throw new Error('User not authenticated!');

    // Remove from my friends
    await deleteDoc(doc(this.firestore, `users/${userUID}/friends/${UID}`));

    // Remove from their friends
    await deleteDoc(doc(this.firestore, `users/${UID}/friends/${userUID}`));

    // remove to my blacklist his UID
    await updateDoc(doc(this.firestore, `users/${userUID}`), {
      friendSuggestionsBlacklist: arrayRemove(UID),
    });
    // remove to his blacklist my UID
    await updateDoc(doc(this.firestore, `users/${UID}`), {
      friendSuggestionsBlacklist: arrayRemove(userUID),
    });

    // get chats with him included
    const previews = await firstValueFrom(
      this.messagesPreviewService.getMessagesPreviews()
    );

    if (previews.length > 0) {
      console.log('test ', previews);

      const filteredPreviews = previews.filter((p) => {
        const prev = MessagePreview.fromJSON(p.preview);

        return prev.memberUIDs.includes(UID) && prev.chatType === 'Private';
      });

      // remove individual chats
      console.log('filtered: ', filteredPreviews);

      if (filteredPreviews.length !== 1)
        throw new Error('Got more than 1 individual chat!');
      const chatPreview = previews[0];

      console.log('removing chat uid ', chatPreview.id);

      try {
        await this.chatService.deleteChat(chatPreview.id, [userUID, UID]);
      } catch (err: any) {
        console.log('here in deleting chats ', err);
      }
    }
  }
}
