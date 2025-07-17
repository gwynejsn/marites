import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  Firestore,
  Timestamp,
} from '@angular/fire/firestore';
import { select, Store } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';
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

  constructor(
    private firestore: Firestore,
    private store$: Store<storeStructure>,
    private listOfMessagesService: ListOfMessagesService
  ) {
    store$.pipe(select(selectUserProfile)).subscribe((up) => {
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
      ...chatCreated,
    });

    // create a preview of this chat
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
          Timestamp.now(), // or Timestamp.fromMillis(0) if you prefer
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
}
