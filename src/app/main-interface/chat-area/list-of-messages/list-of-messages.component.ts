import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessagePreview } from '../../../shared/model/message-preview';
import { ChatService } from '../chat.service';
import { MessagePreviewComponent } from './message-preview/message-preview.component';
import { MessagesPreviewService } from './message-preview/messages-preview.service';

@Component({
  selector: 'app-list-of-messages',
  standalone: true,
  imports: [MessagePreviewComponent, CommonModule],
  templateUrl: './list-of-messages.component.html',
})
export class ListOfMessagesComponent implements OnDestroy {
  messages!: { previewId: string; preview: MessagePreview }[];

  private previewsSub!: Subscription;

  constructor(
    private messagesPreviewService: MessagesPreviewService,
    public chatService: ChatService
  ) {
    this.load();
  }

  ngOnDestroy(): void {
    if (this.previewsSub) this.previewsSub.unsubscribe();
  }

  load() {
    this.previewsSub = this.messagesPreviewService
      .getMessagesPreviews()
      .subscribe((previews) => {
        this.messages = previews.map((p) => ({
          previewId: p.id,
          preview: p.preview,
        }));
      });
  }
}
