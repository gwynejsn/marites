import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  onSnapshot,
  Timestamp,
  updateDoc,
} from '@angular/fire/firestore';
import { select, Store } from '@ngrx/store';
import {
  BehaviorSubject,
  EMPTY,
  firstValueFrom,
  Observable,
  switchMap,
  throwError,
} from 'rxjs';
import { cloudinary } from '../../../environments/cloudinary';
import { environment } from '../../../environments/environment.development';
import { storeStructure } from '../../app.config';
import { selectCurrUserUID } from '../../authentication/store/authentication.selectors';
import { Chat } from '../../shared/model/chat.model';
import { MessagePreview } from '../../shared/model/message-preview';
import { UserProfile } from '../../shared/model/user-profile.model';
import { selectUserProfile } from '../user-profile/store/user-profile.selectors';
import { MessagesPreviewService } from './list-of-messages/message-preview/messages-preview.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private userProfile: UserProfile | null = null;
  private selectedChat$ = new BehaviorSubject<string | null>(null);
  private selectedChatStatus$ = new BehaviorSubject<string | null>(null);

  constructor(
    private firestore: Firestore,
    private store$: Store<storeStructure>,
    private messagesPreviewService: MessagesPreviewService
  ) {
    this.store$.pipe(select(selectUserProfile)).subscribe((up) => {
      this.userProfile = up.userProfile;
    });
  }

  async createPrivateChat(
    withUID: string,
    withName: string,
    withProfilePicture: string
  ): Promise<void> {
    const userUID = await firstValueFrom(
      this.store$.pipe(select(selectCurrUserUID))
    );
    if (!userUID || !this.userProfile)
      throw new Error('User not authenticated');

    const chatCreated = new Chat(
      'Private',
      Timestamp.now(),
      {
        type: 'private',
        names: {
          [withUID]: this.userProfile.fullName,
          [userUID]: withName,
        },
      },
      withProfilePicture,
      environment.defaultQuickReaction,
      null,
      {
        [withUID]: { name: withName, profilePicture: withProfilePicture },
        [userUID]: {
          name: this.userProfile.fullName,
          profilePicture: this.userProfile.profilePicture,
        },
      }
    );

    const chatRef = await addDoc(collection(this.firestore, 'chats'), {
      ...chatCreated.toJSON(),
    });

    await this.messagesPreviewService.createMessagePreviewForPrivate(
      MessagePreview.init(withName, withProfilePicture),
      MessagePreview.init(
        this.userProfile.fullName,
        this.userProfile.profilePicture
      ),
      chatRef.id,
      userUID,
      withUID
    );
  }

  async updateChat(chatUID: string, update: any) {
    await updateDoc(doc(this.firestore, `chats/${chatUID}`), update);
  }

  async updateGroupPhoto(chatUID: string, photo: File, membersUID: string[]) {
    // upload to cloudinary
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

      // change preview and chat photo
      await this.updateChat(chatUID, {
        chatPhoto: photoLink,
      });
      await this.messagesPreviewService.updateMessagePreview(
        {
          chatPhoto: photoLink,
        },
        chatUID,
        membersUID
      );
    } catch (err) {
      console.error('Failed to upload photo to cloudinary!');
      console.error(err);
    }
  }

  async selectChat(chatUID: string) {
    this.selectedChat$.next(chatUID);
    await this.messagesPreviewService.setMessagePreviewToRead(chatUID);
  }

  getChat(): Observable<{ id: string; chat: Chat }> {
    return this.selectedChat$.pipe(
      switchMap((selectedChat) => {
        if (!selectedChat) {
          return EMPTY;
        }

        return this.store$.pipe(
          select(selectCurrUserUID),
          switchMap((userUID) => {
            if (!userUID) {
              return throwError(() => new Error('User not authenticated'));
            }

            return new Observable<{
              id: string;
              chat: Chat;
            }>((subscriber) => {
              const docRef = doc(this.firestore, `chats/${selectedChat}`);

              const unsubscribe = onSnapshot(
                docRef,
                (snapshot) => {
                  const data = snapshot.data();
                  if (data) {
                    subscriber.next({
                      id: snapshot.id,
                      chat: Chat.fromJSON(data),
                    });
                  }
                },
                (error) => subscriber.error(error)
              );

              return unsubscribe;
            });
          })
        );
      })
    );
  }
}
