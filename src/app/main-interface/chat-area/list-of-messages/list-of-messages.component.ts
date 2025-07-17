import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessagePreview } from '../../../shared/model/message-preview';
import { ChatService } from '../chat.service';
import { ListOfMessagesService } from './list-of-messages.service';
import { MessagePreviewComponent } from './message-preview/message-preview.component';

@Component({
  selector: 'app-list-of-messages',
  standalone: true,
  imports: [MessagePreviewComponent, CommonModule],
  templateUrl: './list-of-messages.component.html',
})
export class ListOfMessagesComponent implements OnDestroy {
  messages: MessagePreview[] = [];

  private previewsSub!: Subscription;

  constructor(
    private listOfMessagesService: ListOfMessagesService,
    public chatService: ChatService
  ) {
    // this.mock();
    this.load();
  }

  ngOnDestroy(): void {
    this.previewsSub.unsubscribe();
  }

  load() {
    this.previewsSub = this.listOfMessagesService
      .getMessagesPreviews()
      .subscribe((previews) => {
        console.log(previews);
        this.messages = previews.map((p) => p.preview);
      });
  }

  // mock() {
  //   this.messages = [
  //     new MessagePreview(
  //       'chat001',
  //       'Alice Johnson',
  //       new Message(
  //         'Text',
  //         'alice123',
  //         'https://i.pravatar.cc/150?img=1',
  //         'Alice Johnson',
  //         'Ally',
  //         Timestamp.fromDate(new Date('2025-07-15T09:00:00')),
  //         'Good morning!',
  //         ''
  //       ),
  //       'https://i.pravatar.cc/150?img=1',
  //       'Online',
  //       false
  //     ),
  //     new MessagePreview(
  //       'chat002',
  //       'Bob Ramirez',
  //       new Message(
  //         'Image',
  //         'bob456',
  //         'https://i.pravatar.cc/150?img=2',
  //         'Bob Ramirez',
  //         'Bobby',
  //         Timestamp.fromDate(new Date('2025-07-14T22:45:00')),
  //         '',
  //         'https://example.com/images/photo1.jpg'
  //       ),
  //       'https://i.pravatar.cc/150?img=2',
  //       'Offline',
  //       true
  //     ),
  //     new MessagePreview(
  //       'chat003',
  //       'Charlie Kim',
  //       new Message(
  //         'File',
  //         'charlie789',
  //         'https://i.pravatar.cc/150?img=3',
  //         'Charlie Kim',
  //         'CK',
  //         Timestamp.fromDate(new Date('2025-07-15T00:15:00')),
  //         '',
  //         'https://example.com/files/document.pdf'
  //       ),
  //       'https://i.pravatar.cc/150?img=3',
  //       'Online',
  //       true
  //     ),
  //     new MessagePreview(
  //       'group001',
  //       'UST Dev Team',
  //       new Message(
  //         'Text',
  //         'justin001',
  //         'https://cdn-icons-png.flaticon.com/512/168/168734.png',
  //         'Justin Cruz',
  //         'JC',
  //         Timestamp.fromDate(new Date('2025-07-15T10:05:00')),
  //         'I pushed the latest commit to GitHub.',
  //         ''
  //       ),
  //       'https://cdn-icons-png.flaticon.com/512/168/168734.png', // Group icon
  //       'Online',
  //       false
  //     ),
  //   ];
  //   this.sortByUnread(this.messages);
  // }

  // sortByUnread(messages: MessagePreview[]) {
  //   return messages.sort((a, b) => Number(a.read) - Number(b.read));
  // }
}
