import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Chat } from '../../../shared/model/chat.model';
import { Message } from '../../../shared/model/message';
import { MessagesSortByDatePipe } from '../../../shared/pipes/messages-sort-by-date.pipe';
import { ChatService } from '../chat.service';
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
    private messageService: MessageService
  ) {
    this.load();
  }

  ngOnDestroy(): void {
    this.chatSub.unsubscribe();
    this.messagesSub.unsubscribe();
  }

  load() {
    this.chatSub = this.chatService.getChat().subscribe((c) => {
      this.chat = c.chat;
      this.chatUID = c.id;

      this.messagesSub = this.messageService
        .getMessages(this.chatUID)
        .subscribe((m) => {
          this.messages = m;
        });
    });
  }

  sendQuickReaction() {
    if (this.chat?.quickReaction)
      this.messageService.sendTextMessage(
        this.chat.quickReaction,
        this.chat,
        this.chatUID
      );
  }

  sendTextMessage() {
    if (this.chat && this.textContent)
      this.messageService.sendTextMessage(
        this.textContent,
        this.chat,
        this.chatUID
      );
    this.textContent = null;
  }
}
