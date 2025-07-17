import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  Firestore,
  onSnapshot,
} from '@angular/fire/firestore';
import { select, Store } from '@ngrx/store';
import { Observable, switchMap, throwError } from 'rxjs';
import { storeStructure } from '../../../app.config';
import { selectCurrUserUID } from '../../../authentication/store/authentication.selectors';
import { MessagePreview } from '../../../shared/model/message-preview';

@Injectable({ providedIn: 'root' })
export class ListOfMessagesService {
  constructor(
    private firestore: Firestore,
    private store$: Store<storeStructure>
  ) {}

  getMessagesPreviews(): Observable<
    {
      id: string;
      preview: MessagePreview;
    }[]
  > {
    return this.store$.pipe(
      select(selectCurrUserUID),
      switchMap((userUID) => {
        if (!userUID) {
          return throwError(() => new Error('User not authenticated'));
        }

        const colRef = collection(
          this.firestore,
          `users/${userUID}/messagesPreview`
        );

        return new Observable<{ id: string; preview: MessagePreview }[]>(
          (subscriber) => {
            const unsubscribe = onSnapshot(
              colRef,
              (snapshot) => {
                const previews = snapshot.docs.map((request) => ({
                  id: request.id,
                  preview: MessagePreview.fromJSON(request.data()),
                }));
                subscriber.next(previews);
              },
              (error) => subscriber.error(error)
            );

            return unsubscribe;
          }
        );
      })
    );
  }

  async createPrivateMessagePreview(
    messagePreview: MessagePreview,
    currUserUID: string,
    otherUserUID: string
  ): Promise<void> {
    // add to my previews
    await addDoc(
      collection(this.firestore, `users/${currUserUID}/messagesPreview`),
      messagePreview.toFirestore()
    );

    // add to his previews
    await addDoc(
      collection(this.firestore, `users/${otherUserUID}/messagesPreview`),
      messagePreview.toFirestore()
    );

    console.log('previews added');
  }
}
