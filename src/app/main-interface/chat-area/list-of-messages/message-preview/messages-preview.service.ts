import { Injectable } from '@angular/core';
import {
  collection,
  doc,
  Firestore,
  onSnapshot,
  updateDoc,
} from '@angular/fire/firestore';
import { select, Store } from '@ngrx/store';
import { setDoc } from 'firebase/firestore';
import { Observable, switchMap, throwError } from 'rxjs';
import { storeStructure } from '../../../../app.config';
import { selectCurrUserUID } from '../../../../authentication/store/authentication.selectors';
import { MessagePreview } from '../../../../shared/model/message-preview';

@Injectable({ providedIn: 'root' })
export class MessagesPreviewService {
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

  async createMessagePreview(
    messagePreview: MessagePreview,
    chatUID: string,
    membersUID: string[]
  ): Promise<void> {
    for (const memberUID of membersUID)
      await setDoc(
        doc(this.firestore, `users/${memberUID}/messagesPreview/${chatUID}`),
        messagePreview.toFirestore()
      );
  }

  async updateMessagePreview(
    update: any, // object of MessagePreview
    chatUID: string,
    membersUID: string[]
  ): Promise<void> {
    for (const memberUID of membersUID)
      await updateDoc(
        doc(this.firestore, `users/${memberUID}/messagesPreview/${chatUID}`),
        update
      );
  }
}
