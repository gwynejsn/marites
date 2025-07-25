import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MessagePreview } from '../../../shared/model/message-preview';
import { PreviewsSortByDatePipe } from '../../../shared/pipes/previews-sort-by-date.pipe';
import { SearchByNamePipe } from '../../../shared/pipes/search-by-name.pipe';
import { ChatService } from '../chat.service';
import { CreateGroupChatComponent } from './create-group-chat/create-group-chat.component';
import { MessagePreviewComponent } from './message-preview/message-preview.component';
import { MessagesPreviewService } from './message-preview/messages-preview.service';

@Component({
  selector: 'app-list-of-messages',
  standalone: true,
  imports: [
    MessagePreviewComponent,
    CommonModule,
    CreateGroupChatComponent,
    PreviewsSortByDatePipe,
    FormsModule,
    SearchByNamePipe,
  ],
  templateUrl: './list-of-messages.component.html',
})
export class ListOfMessagesComponent implements OnDestroy {
  messages!: { previewId: string; preview: MessagePreview }[];

  private previewsSub!: Subscription;

  @Output() chatSelected = new EventEmitter();

  showCreateGroupChat = false;

  searchTerm = '';

  constructor(
    private messagesPreviewService: MessagesPreviewService,
    public chatService: ChatService,
    public cdr: ChangeDetectorRef
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
