import { Injectable } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import {
  addDoc,
  collection,
  Firestore,
  onSnapshot,
} from '@angular/fire/firestore';
import { User } from 'firebase/auth';
import { Observable, switchMap, throwError } from 'rxjs';
import { MessagePreview } from '../../../shared/model/message-preview';

@Injectable({ providedIn: 'root' })
export class ListOfMessagesService {
  private authState$: Observable<User | null>;

  constructor(private firestore: Firestore, private auth: Auth) {
    this.authState$ = authState(auth);
  }

  getMessagesPreviews(): Observable<
    {
      id: string;
      preview: MessagePreview;
    }[]
  > {
    return this.authState$.pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(() => new Error('User not authenticated'));
        }

        const colRef = collection(
          this.firestore,
          `users/${user.uid}/messagesPreview`
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
