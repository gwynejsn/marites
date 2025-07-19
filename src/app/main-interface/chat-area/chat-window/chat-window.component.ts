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
import { firstValueFrom, Subscription } from 'rxjs';
import { storeStructure } from '../../../app.config';
import { selectCurrUserUID } from '../../../authentication/store/authentication.selectors';
import { Chat } from '../../../shared/model/chat.model';
import { Message } from '../../../shared/model/message';
import { MessagesSortByDatePipe } from '../../../shared/pipes/messages-sort-by-date.pipe';
import { selectUserProfile } from '../../user-profile/store/user-profile.selectors';
import { ChatService } from '../chat.service';
import { MessagesPreviewService } from '../list-of-messages/message-preview/messages-preview.service';
import { ImagePreviewComponent } from './image-preview/image-preview.component';
import { MessageService } from './message.service';
import { MessageComponent } from './message/message.component';
@Component({
  selector: 'app-chat-window',
  imports: [
    CommonModule,
    MessageComponent,
    FormsModule,
    MessagesSortByDatePipe,
    ImagePreviewComponent,
  ],
  templateUrl: './chat-window.component.html',
})
export class ChatWindowComponent implements OnDestroy {
  chat: Chat | null = null;
  chatUID!: string;
  chatName!: string;
  messages: { id: string; message: Message }[] | null = null;
  textContent: string | null = null;
  photosSelected: File[] = [];
  photosSelectedPreview: {
    name: string;
    url: string;
  }[] = [];

  messageViewed: { id: string; message: Message } | null = null;

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

    if (this.chat) {
      if (this.chat.chatName.type === 'group') {
        console.log('Group name:', this.chat.chatName.name);
      } else if (this.chat.chatName.type === 'private') {
        const myUID = 'userA';
        console.log('My view of name:', this.chat.chatName.names[myUID]);
      }
    }
  }

  ngOnDestroy(): void {
    this.chatSub?.unsubscribe();
    this.messagesSub?.unsubscribe();
  }

  async load() {
    const currUserUID = await firstValueFrom(
      this.store$.pipe(select(selectCurrUserUID))
    );
    this.chatSub = this.chatService.getChat().subscribe((c) => {
      this.chat = c.chat;
      this.chatUID = c.id;
      if (c.chat.chatName.type === 'private' && currUserUID)
        this.chatName = c.chat.chatName.names[currUserUID] ?? 'Unknown';
      else if (c.chat.chatName.type === 'group')
        this.chatName = c.chat.chatName.name ?? 'Unknown';

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

  @ViewChild('scrollDiv') private scrollDiv!: ElementRef;
  scrollToBottom() {
    setTimeout(() => {
      this.scrollDiv.nativeElement.scrollTop =
        this.scrollDiv.nativeElement.scrollHeight;
    });
  }

  async sendQuickReaction() {
    if (this.chat?.quickReaction) {
      const message = await this.messageService.sendTextMessage(
        this.chat.quickReaction,
        this.chat,
        this.chatUID
      );
      await this.updateMessagePreview(message);
    }
  }

  async sendMessage() {
    let messageSent: Message | null = null;
    // send photos

    if (this.chat && this.photosSelected) {
      const messagesSent = await this.messageService.sendPhotos(
        this.photosSelected,
        this.chat,
        this.chatUID
      );
      if (messageSent) messageSent = messageSent[messagesSent.length - 1];
    }

    // send text
    if (this.chat && this.textContent)
      messageSent = await this.messageService.sendTextMessage(
        this.textContent,
        this.chat,
        this.chatUID
      );

    if (messageSent) await this.updateMessagePreview(messageSent);

    this.textContent = null;
    this.photosSelected = [];
    this.photosSelectedPreview = [];
  }

  async updateMessagePreview(message: Message) {
    const userUID = await firstValueFrom(
      this.store$.pipe(select(selectCurrUserUID))
    );
    const userProfile = await (
      await firstValueFrom(this.store$.pipe(select(selectUserProfile)))
    ).userProfile;

    if (!userUID || !this.chat || !userProfile) throw 'User not authenticated!';

    this.messagesPreviewService.updateMessagePreview(
      {
        chatUID: this.chatUID,
        lastMessage: message.toFirestore(),
      },
      this.chatUID,
      Object.keys(this.chat.members)
    );
  }

  addPhoto(event: Event) {
    console.log('adding photo');

    const photo = (event.target as HTMLInputElement).files?.[0];
    if (photo) {
      this.photosSelected.push(photo);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this.photosSelectedPreview.push({
            name: photo.name,
            url: reader.result,
          });
          this.cdr.detectChanges();
        }
      };
      reader.readAsDataURL(photo);
      console.log(this.photosSelected);
    }
  }

  removePhoto(name: string) {
    console.log('removing ', name);

    this.photosSelected = this.photosSelected.filter((p) => p.name !== name);
    this.photosSelectedPreview = this.photosSelectedPreview.filter(
      (p) => p.name !== name
    );
    this.cdr.detectChanges();
  }

  viewMessage(message: { id: string; message: Message }) {
    console.log('viewing');

    if (message.message.type === 'Image') {
      this.messageViewed = message;
      this.cdr.detectChanges();
    }
  }

  closeMessage() {
    this.messageViewed = null;
    this.cdr.detectChanges();
  }
}
