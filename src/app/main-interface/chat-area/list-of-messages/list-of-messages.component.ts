import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Inject,
  OnDestroy,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpeechRecognitionService } from '@ng-web-apis/speech';
import { Observable, Subscription } from 'rxjs';

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
  private recognitionSub!: Subscription;

  @Output() chatSelected = new EventEmitter();

  showCreateGroupChat = false;
  searchTerm = '';

  isListening = false;

  constructor(
    private messagesPreviewService: MessagesPreviewService,
    public chatService: ChatService,
    @Inject(SpeechRecognitionService)
    private readonly recognition$: Observable<SpeechRecognitionResult[]>
  ) {
    this.load();
  }

  ngOnDestroy(): void {
    if (this.previewsSub) this.previewsSub.unsubscribe();
    if (this.recognitionSub) this.recognitionSub.unsubscribe();
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

  initSpeechRecognition() {
    // If already listening, cancel it
    if (this.isListening) {
      this.isListening = false;
      if (this.recognitionSub) {
        this.recognitionSub.unsubscribe();
        this.recognitionSub = undefined!;
      }
      return;
    }

    // Start listening
    this.isListening = true;
    this.recognitionSub = this.recognition$.subscribe((results) => {
      const transcript = Array.from(results)
        .map((result) => result[0].transcript)
        .join(' ')
        .trim();

      this.searchTerm = transcript;
      this.isListening = false;
    });
  }
}
