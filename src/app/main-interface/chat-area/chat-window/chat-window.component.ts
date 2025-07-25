import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  Output,
  signal,
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
import { ChatInfoComponent } from './chat-info/chat-info.component';
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
    ChatInfoComponent,
  ],
  templateUrl: './chat-window.component.html',
})
export class ChatWindowComponent implements OnDestroy {
  // init
  chat = signal<Chat | null>(null);
  chatSub!: Subscription;
  messagesSub!: Subscription;

  @ViewChild('scrollDiv') private scrollDiv!: ElementRef;
  scrollToBottom() {
    setTimeout(() => {
      this.scrollDiv.nativeElement.scrollTop =
        this.scrollDiv.nativeElement.scrollHeight;
    });
  }

  // header
  chatUID!: string;
  chatName!: string;

  // inputs
  messages = signal<{ id: string; message: Message }[] | null>(null);
  textContent = signal<string | null>(null);
  photosSelected = signal<File[]>([]);
  photosSelectedPreview = signal<
    {
      name: string;
      url: string;
    }[]
  >([]);

  // image preview
  messageViewed = signal<{ id: string; message: Message } | null>(null);

  // chat info toggle
  showChatInfo = signal(false);

  // mobile view
  @Output() back = new EventEmitter();
  isMobile = false;

  constructor(
    private chatService: ChatService,
    private messageService: MessageService,
    private messagesPreviewService: MessagesPreviewService,
    private store$: Store<storeStructure>
  ) {
    this.load();
  }

  ngOnInit() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768; // md breakpoint
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
      this.chat.set(c.chat);
      this.chatUID = c.id;
      if (c.chat.chatName.type === 'private' && currUserUID)
        this.chatName = c.chat.chatName.names[currUserUID] ?? 'Unknown';
      else if (c.chat.chatName.type === 'group')
        this.chatName = c.chat.chatName.name ?? 'Unknown';

      this.messagesSub = this.messageService
        .getMessages(this.chatUID)
        .subscribe((m) => {
          this.messages.set(m);
          this.scrollToBottom();
        });
    });
  }

  async sendQuickReaction() {
    const chat = this.chat();
    if (chat) {
      const message = await this.messageService.sendTextMessage(
        chat.quickReaction,
        chat,
        this.chatUID
      );
      await this.updateMessagePreview(message);
    }
  }

  async sendMessage() {
    let messageSent: Message | null = null;
    // send photos

    if (this.chat() && this.photosSelected) {
      const messagesSent = await this.messageService.sendPhotos(
        this.photosSelected(),
        this.chat() as Chat,
        this.chatUID
      );
      if (messageSent) messageSent = messageSent[messagesSent.length - 1];
    }

    // send text
    if (this.chat() && this.textContent)
      messageSent = await this.messageService.sendTextMessage(
        this.textContent()!,
        this.chat() as Chat,
        this.chatUID
      );

    if (messageSent) await this.updateMessagePreview(messageSent);

    this.textContent.set(null);
    this.photosSelected.set([]);
    this.photosSelectedPreview.set([]);
  }

  async updateMessagePreview(message: Message) {
    const userUID = await firstValueFrom(
      this.store$.pipe(select(selectCurrUserUID))
    );
    const userProfile = await (
      await firstValueFrom(this.store$.pipe(select(selectUserProfile)))
    ).userProfile;

    if (!userUID || !this.chat() || !userProfile)
      throw 'User not authenticated!';

    this.messagesPreviewService.updateMessagePreview(
      {
        chatUID: this.chatUID,
        lastMessage: message.toFirestore(),
        read: false,
      },
      this.chatUID,
      Object.keys((this.chat() as Chat).members)
    );
  }

  addPhoto(event: Event) {
    const photo = (event.target as HTMLInputElement).files?.[0];
    if (photo) {
      this.photosSelected.update((p) => [...p, photo]);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this.photosSelectedPreview.update((p) => [
            ...p,
            {
              name: photo.name,
              url: reader.result as string,
            },
          ]);
        }
      };
      reader.readAsDataURL(photo);
    }
  }

  removePhoto(name: string) {
    this.photosSelected.update((p) => p.filter((photo) => photo.name !== name));
    this.photosSelectedPreview.update((p) =>
      p.filter((photo) => photo.name !== name)
    );
  }

  viewMessage(message: { id: string; message: Message }) {
    if (message.message.type === 'Image') {
      this.messageViewed.set(message);
    }
  }

  closeMessage() {
    this.messageViewed.set(null);
  }

  viewChatInfo() {
    this.showChatInfo.set(true);
  }

  closeChatInfo() {
    this.showChatInfo.set(false);
    this.scrollToBottom();
  }
}
