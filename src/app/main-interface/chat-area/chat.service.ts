import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  onSnapshot,
  Timestamp,
  updateDoc,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
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
import { CloudinaryService } from '../../shared/cloudinary.service';
import { Chat } from '../../shared/model/chat.model';
import { MessagePreview } from '../../shared/model/message-preview';
import { UserProfile } from '../../shared/model/user-profile.model';
import { chatMemberMap } from '../../shared/types';
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
    private messagesPreviewService: MessagesPreviewService,
    private cloudinaryService: CloudinaryService,
    private router: Router
  ) {
    this.store$.pipe(select(selectUserProfile)).subscribe((up) => {
      this.userProfile = up.userProfile;
    });
  }

  async createGroupChat(
    members: chatMemberMap,
    groupChatName: string,
    groupChatPhoto: File
  ) {
    const userUID = await firstValueFrom(
      this.store$.pipe(select(selectCurrUserUID))
    );
    if (!userUID || !this.userProfile)
      throw new Error('User not authenticated');

    const chatPhotoLink = await this.cloudinaryService.upload(groupChatPhoto);

    const chatCreated = new Chat(
      'Group',
      Timestamp.now(),
      {
        type: 'group',
        name: groupChatName,
      },
      {
        type: 'group',
        photo: chatPhotoLink,
      },
      environment.defaultQuickReaction,
      null,
      members
    );

    const chatRef = await addDoc(collection(this.firestore, 'chats'), {
      ...chatCreated.toJSON(),
    });

    await this.messagesPreviewService.createMessagePreviewForGroup(
      MessagePreview.init(
        groupChatName,
        chatPhotoLink,
        Object.keys(members),
        'Group'
      ),
      chatRef.id,
      Object.keys(members)
    );
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
      {
        type: 'private',
        photos: {
          [withUID]: this.userProfile.profilePicture,
          [userUID]: withProfilePicture,
        },
      },
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
      MessagePreview.init(
        withName,
        withProfilePicture,
        [withUID, userUID],
        'Private'
      ),
      MessagePreview.init(
        this.userProfile.fullName,
        this.userProfile.profilePicture,
        [withUID, userUID],
        'Private'
      ),
      chatRef.id,
      userUID,
      withUID
    );
  }

  async updateChat(chatUID: string, update: any) {
    console.log(update);

    await updateDoc(doc(this.firestore, `chats/${chatUID}`), update);
  }

  async updateGroupPhoto(chatUID: string, photo: File, membersUID: string[]) {
    const photoLink = await this.cloudinaryService.upload(photo);

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
  }

  async updateGroupName(
    chatUID: string,
    newName: string,
    membersUID: string[]
  ) {
    await this.updateChat(chatUID, {
      chatName: {
        type: 'group',
        name: newName,
      },
    });

    await this.messagesPreviewService.updateMessagePreview(
      {
        chatName: newName,
      },
      chatUID,
      membersUID
    );
  }

  async removeMember(
    chatUID: string,
    members: chatMemberMap,
    memberUID: string
  ) {
    await this.messagesPreviewService.removeMessagePreviewFrom(
      memberUID,
      chatUID
    );

    // remove from chat
    delete members[memberUID];
    await this.updateChat(chatUID, {
      members: members,
    });
  }

  async addMember(
    member: {
      UID: string;
      name: string;
      profilePicture: string;
    },
    chatUID: string,
    members: chatMemberMap
  ) {
    // add to chat
    members[member.UID] = {
      name: member.name,
      profilePicture: member.profilePicture,
    };

    await this.updateChat(chatUID, {
      members: members,
    });

    // add to his preview
    await this.messagesPreviewService.addMessagePreviewTo(member.UID, chatUID);
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

  async deleteChat(chatUID: string, membersUID: string[]) {
    // delete from previews
    await this.messagesPreviewService.removeMessagePreviews(
      chatUID,
      membersUID
    );

    // delete chat
    await deleteDoc(doc(this.firestore, `chats/${chatUID}`));

    this.router.navigate(['/chat-area']).then(() => {
      window.location.reload();
    });
  }

  async leaveChat(chatUID: string, members: chatMemberMap) {
    const userUID = await firstValueFrom(
      this.store$.pipe(select(selectCurrUserUID))
    );

    if (!userUID) throw new Error('User not authenticated!');
    await this.removeMember(chatUID, members, userUID);

    // Your the only one left in the chat
    if (Object.keys(members).length <= 1)
      this.deleteChat(chatUID, Object.keys(members));

    this.router.navigate(['/chat-area']).then(() => {
      window.location.reload();
    });
  }
}
