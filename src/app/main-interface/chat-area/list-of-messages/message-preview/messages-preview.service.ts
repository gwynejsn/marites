import { Injectable } from '@angular/core';
import {
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  onSnapshot,
  updateDoc,
} from '@angular/fire/firestore';
import { select, Store } from '@ngrx/store';
import { setDoc } from 'firebase/firestore';
import { firstValueFrom, Observable, switchMap, throwError } from 'rxjs';
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

  async createMessagePreviewForPrivate(
    currUserMessagePreview: MessagePreview,
    otherUserMessagePreview: MessagePreview,
    chatUID: string,
    currUserUID: string,
    otherUserUID: string
  ): Promise<void> {
    await setDoc(
      doc(this.firestore, `users/${currUserUID}/messagesPreview/${chatUID}`),
      currUserMessagePreview.toFirestore()
    );
    await setDoc(
      doc(this.firestore, `users/${otherUserUID}/messagesPreview/${chatUID}`),
      otherUserMessagePreview.toFirestore()
    );
  }

  async createMessagePreviewForGroup(
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

  async removeMessagePreviewFrom(memberUID: string, chatUID: string) {
    await deleteDoc(
      doc(this.firestore, `users/${memberUID}/messagesPreview/${chatUID}`)
    );
  }

  async addMessagePreviewTo(memberUID: string, chatUID: string) {
    // get message preview first
    const userUID = await firstValueFrom(
      this.store$.pipe(select(selectCurrUserUID))
    );
    const docSnap = await getDoc(
      doc(this.firestore, `users/${userUID}/messagesPreview/${chatUID}`)
    );

    if (!docSnap.exists()) throw new Error('Message preview not found');

    // add to his preview
    await setDoc(
      doc(this.firestore, `users/${memberUID}/messagesPreview/${chatUID}`),
      docSnap.data()
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

  async setMessagePreviewToRead(chatUID: string) {
    const userUID = await firstValueFrom(
      this.store$.pipe(select(selectCurrUserUID))
    );
    await updateDoc(
      doc(this.firestore, `users/${userUID}/messagesPreview/${chatUID}`),
      {
        read: true,
      }
    );
  }
}
