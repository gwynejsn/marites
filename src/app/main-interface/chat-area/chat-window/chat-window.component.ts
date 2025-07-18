import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Timestamp } from 'firebase/firestore';
import { firstValueFrom, Subscription } from 'rxjs';
import { storeStructure } from '../../../app.config';
import { selectCurrUserUID } from '../../../authentication/store/authentication.selectors';
import { Chat } from '../../../shared/model/chat.model';
import { Message } from '../../../shared/model/message';
import { MessagesSortByDatePipe } from '../../../shared/pipes/messages-sort-by-date.pipe';
import { messageType } from '../../../shared/types';
import { selectUserProfile } from '../../user-profile/store/user-profile.selectors';
import { ChatService } from '../chat.service';
import { MessagesPreviewService } from '../list-of-messages/message-preview/messages-preview.service';
import { MessageService } from './message.service';
import { MessageComponent } from './message/message.component';
@Component({
  selector: 'app-chat-window',
  imports: [
    CommonModule,
    MessageComponent,
    FormsModule,
    MessagesSortByDatePipe,
  ],
  templateUrl: './chat-window.component.html',
})
export class ChatWindowComponent implements OnDestroy {
  chat: Chat | null = null;
  chatUID!: string;
  messages: { id: string; message: Message }[] | null = null;
  textContent: string | null = null;

  chatSub!: Subscription;
  messagesSub!: Subscription;

  constructor(
    private chatService: ChatService,
    private messageService: MessageService,
    private messagesPreviewService: MessagesPreviewService,
    private cdr: ChangeDetectorRef,
    private store$: Store<storeStructure>
  ) {
    this.load();
  }

  ngOnDestroy(): void {
    this.chatSub?.unsubscribe();
    this.messagesSub?.unsubscribe();
  }

  load() {
    this.chatSub = this.chatService.getChat().subscribe((c) => {
      this.chat = c.chat;
      this.chatUID = c.id;
      this.cdr.detectChanges();

      this.messagesSub = this.messageService
        .getMessages(this.chatUID)
        .subscribe((m) => {
          this.messages = m;
          this.cdr.detectChanges();
          this.scrollToBottom();
        });
    });
  }

  sendQuickReaction() {
    if (this.chat?.quickReaction) {
      this.messageService.sendTextMessage(
        this.chat.quickReaction,
        this.chat,
        this.chatUID
      );
      this.updateMessagePreview('Text', this.chat.quickReaction);
    }
  }

  sendTextMessage() {
    if (this.chat && this.textContent) {
      this.messageService.sendTextMessage(
        this.textContent,
        this.chat,
        this.chatUID
      );
      this.updateMessagePreview('Text', this.textContent);
    }

    this.textContent = null;
  }

  async updateMessagePreview(type: messageType, text = '', mediaUrl = '') {
    const userUID = await firstValueFrom(
      this.store$.pipe(select(selectCurrUserUID))
    );
    const userProfile = await (
      await firstValueFrom(this.store$.pipe(select(selectUserProfile)))
    ).userProfile;

    if (!userUID || !this.chat || !userProfile) throw 'User not authenticated!';

    const updatedMessage = new Message(
      type,
      userUID,
      userProfile.profilePicture,
      this.chat.members[userUID].name,
      this.chat.members[userUID].nickname,
      Timestamp.now(),
      text,
      mediaUrl,
      false
    ).toFirestore();

    this.messagesPreviewService.updateMessagePreview(
      {
        chatUID: this.chatUID,
        lastMessage: updatedMessage,
      },
      this.chatUID,
      Object.keys(this.chat.members)
    );
  }

  @ViewChild('scrollDiv') private scrollDiv!: ElementRef;
  scrollToBottom() {
    setTimeout(() => {
      this.scrollDiv.nativeElement.scrollTop =
        this.scrollDiv.nativeElement.scrollHeight;
    });
  }
}
