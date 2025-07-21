import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  Firestore,
  onSnapshot,
  Timestamp,
} from '@angular/fire/firestore';
import { select, Store } from '@ngrx/store';
import { firstValueFrom, Observable, switchMap, throwError } from 'rxjs';
import { cloudinary } from '../../../../environments/cloudinary';
import { storeStructure } from '../../../app.config';
import { selectCurrUserUID } from '../../../authentication/store/authentication.selectors';
import { Chat } from '../../../shared/model/chat.model';
import { Message } from '../../../shared/model/message';
import { UserProfile } from '../../../shared/model/user-profile.model';
import { selectUserProfile } from '../../user-profile/store/user-profile.selectors';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private userProfile: UserProfile | null = null;

  constructor(
    private firestore: Firestore,
    private store$: Store<storeStructure>
  ) {
    this.store$.pipe(select(selectUserProfile)).subscribe((up) => {
      this.userProfile = up.userProfile;
    });
  }

  getMessages(chatUID: string): Observable<{ id: string; message: Message }[]> {
    return this.store$.pipe(
      select(selectCurrUserUID),
      switchMap((userUID) => {
        if (!userUID) {
          return throwError(() => new Error('User not authenticated'));
        }

        const colRef = collection(this.firestore, `chats/${chatUID}/messages`);

        return new Observable<{ id: string; message: Message }[]>(
          (subscriber) => {
            const unsubscribe = onSnapshot(
              colRef,
              (snapshot) => {
                const messages = snapshot.docs.map((request) => ({
                  id: request.id,
                  message: Message.fromJSON(request.data()),
                }));

                subscriber.next(messages);
              },
              (error) => subscriber.error(error)
            );

            return unsubscribe;
          }
        );
      })
    );
  }

  async sendPhotos(
    photos: File[],
    chat: Chat,
    chatUID: string
  ): Promise<Message[]> {
    console.log('sending photos');
    const userUID = await firstValueFrom(
      this.store$.pipe(select(selectCurrUserUID))
    );

    if (!userUID || !this.userProfile)
      throw new Error('User not authenticated');

    const sentMessages: Message[] = [];

    for (const photo of photos) {
      try {
        const data = new FormData();
        data.append('file', photo);
        data.append('upload_preset', cloudinary.presetName);

        const endpoint = `https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/upload`;

        const res = await fetch(endpoint, {
          method: 'POST',
          body: data,
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Cloudinary upload failed: ${res.status} ${errText}`);
        }

        const photoLink = (await res.json()).url;

        const message = new Message(
          'Image',
          userUID,
          this.userProfile.profilePicture,
          chat.members[userUID].name,
          Timestamp.now(),
          '',
          photoLink,
          false
        );

        await addDoc(collection(this.firestore, `chats/${chatUID}/messages`), {
          ...message,
        });

        sentMessages.push(message);
      } catch (err) {
        console.error('Failed to upload photo to cloudinary!');
        console.error(err);
      }
    }

    return sentMessages;
  }

  async sendTextMessage(
    content: string,
    chat: Chat,
    chatUID: string
  ): Promise<Message> {
    const userUID = await firstValueFrom(
      this.store$.pipe(select(selectCurrUserUID))
    );

    if (!userUID || !this.userProfile)
      throw new Error('User not authenticated');

    const message = new Message(
      'Text',
      userUID,
      this.userProfile.profilePicture,
      chat.members[userUID].name,
      Timestamp.now(),
      content,
      '',
      false
    );

    await addDoc(collection(this.firestore, `chats/${chatUID}/messages`), {
      ...message,
    });

    return message;
  }
}
