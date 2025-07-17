import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  onSnapshot,
  Timestamp,
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
import { environment } from '../../../environments/environment.development';
import { storeStructure } from '../../app.config';
import { selectCurrUserUID } from '../../authentication/store/authentication.selectors';
import { Chat } from '../../shared/model/chat.model';
import { Message } from '../../shared/model/message';
import { MessagePreview } from '../../shared/model/message-preview';
import { UserProfile } from '../../shared/model/user-profile.model';
import { selectUserProfile } from '../user-profile/store/user-profile.selectors';
import { ListOfMessagesService } from './list-of-messages/list-of-messages.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private userProfile: UserProfile | null = null;
  private selectedChatUID$ = new BehaviorSubject<string | null>(null);

  constructor(
    private firestore: Firestore,
    private store$: Store<storeStructure>,
    private listOfMessagesService: ListOfMessagesService
  ) {
    this.store$.pipe(select(selectUserProfile)).subscribe((up) => {
      this.userProfile = up.userProfile;
    });
  }

  async createPrivateChat(
    withUID: string,
    name: string,
    profilePicture: string
  ): Promise<void> {
    const userUID = await firstValueFrom(
      this.store$.pipe(select(selectCurrUserUID))
    );
    if (!userUID || !this.userProfile)
      throw new Error('User not authenticated');

    const currUserName =
      this.userProfile.firstName + ' ' + this.userProfile.lastName;

    const chatCreated = new Chat(
      'Private',
      Timestamp.now(),
      name,
      profilePicture,
      environment.defaultQuickReaction,
      null,
      'Online',
      {
        [withUID]: { name, nickname: name },
        [userUID]: { name: currUserName, nickname: currUserName },
      }
    );

    const chatRef = await addDoc(collection(this.firestore, 'chats'), {
      ...chatCreated.toJSON(),
    });

    await this.listOfMessagesService.createPrivateMessagePreview(
      new MessagePreview(
        chatRef.id,
        chatCreated.chatName,
        new Message(
          'Text',
          withUID,
          profilePicture,
          name,
          name,
          Timestamp.now(),
          '',
          '',
          true
        ),
        chatCreated.chatPhoto,
        chatCreated.status,
        []
      ),
      userUID,
      withUID
    );
  }

  selectChat(chatUID: string) {
    this.selectedChatUID$.next(chatUID);
  }

  getChat(): Observable<{ id: string; chat: Chat }> {
    return this.selectedChatUID$.pipe(
      switchMap((chatUID) => {
        if (!chatUID) {
          return EMPTY;
        }

        return this.store$.pipe(
          select(selectCurrUserUID),
          switchMap((userUID) => {
            if (!userUID) {
              return throwError(() => new Error('User not authenticated'));
            }

            return new Observable<{ id: string; chat: Chat }>((subscriber) => {
              console.log('fetching chat,' + chatUID);

              const docRef = doc(this.firestore, `chats/${chatUID}`);

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
