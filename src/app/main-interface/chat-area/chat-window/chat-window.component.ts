import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { Timestamp } from 'firebase/firestore';
import { Chat } from '../../../shared/model/chat.model';
import { Message } from '../../../shared/model/message';
import { chatMember } from '../../../shared/types';
import { MessageComponent } from './message/message.component';
@Component({
  selector: 'app-chat-window',
  imports: [CommonModule, MessageComponent],
  templateUrl: './chat-window.component.html',
})
export class ChatWindowComponent {
  chat: Chat | null = null;
  messages: Message[] | null = null;
  userUID: string | undefined = undefined;

  constructor(private auth: Auth) {
    // userUID here is only for mocking
    user(auth).subscribe((user) => {
      this.userUID = user?.uid;
      this.mock('group');
    });
  }

  mock(type: 'group' | 'private') {
    const mockMembers: chatMember[] = [
      {
        name: 'Alice Johnson',
        nickname: 'Ally',
        UID: 'alice123',
      },
      {
        name: 'Bob Ramirez',
        nickname: 'Bobby',
        UID: 'bob456',
      },
      {
        name: 'Justin Cruz',
        nickname: 'JC',
        UID: 'justin001',
      },
    ];

    const groupChat = new Chat(
      'Group',
      Timestamp.fromDate(new Date('2025-07-10T08:00:00')),
      'UST Dev Team',
      'https://cdn-icons-png.flaticon.com/512/168/168734.png',
      '🔥',
      null,
      'Online',
      mockMembers
    );

    const privateChat = new Chat(
      'Private',
      Timestamp.fromDate(new Date('2025-07-12T10:30:00')),
      'Gwyne Justin',
      'https://i.pravatar.cc/150?img=2',
      '👍',
      '#1e1e2e',
      'Online',
      [mockMembers[0], mockMembers[2]]
    );

    const groupMessages: Message[] = [
      new Message(
        'Text',
        'justin001',
        'https://cdn-icons-png.flaticon.com/512/168/168734.png',
        'Justin Cruz',
        'JC',
        Timestamp.fromDate(new Date('2025-07-15T10:05:00')),
        'I pushed the latest commit to GitHub.',
        ''
      ),
      new Message(
        'Image',
        'bob456',
        'https://i.pravatar.cc/150?img=2',
        'Bob Ramirez',
        'Bobby',
        Timestamp.fromDate(new Date('2025-07-15T10:10:00')),
        '',
        'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjJaBgZphxyhiYS0rtFOKyl97A3EI4iHGIv3r4sAzKRUxlxof4dU5WCqxntc2tiYWHGGusYjuPseys1eaZOWj5cEz61yaxv9KPZzPAwj1ybgIi37hoBsx7kt7765U53d_kqClt-ERWBCIcPvLqia0MpTDXe_U0DXMfx0gRWwSRdtR95Q4qTt5VmhGnw6q9S/w400-h225/porsche_carrera_gt_update_00.jpg'
      ),
      new Message(
        'File',
        'alice123',
        'https://i.pravatar.cc/150?img=1',
        'Alice Johnson',
        'Ally',
        Timestamp.fromDate(new Date('2025-07-15T10:15:00')),
        '',
        'https://example.com/docs/project-proposal.pdf'
      ),
      new Message(
        'Text',
        this.userUID!,
        'https://cdn-icons-png.flaticon.com/512/168/168734.png',
        'Justin Cruz',
        'JC',
        Timestamp.fromDate(new Date('2025-07-15T10:20:00')),
        'cool car bro!',
        ''
      ),
    ];

    const privateMessages: Message[] = [
      new Message(
        'Text',
        'alice123',
        'https://i.pravatar.cc/150?img=1',
        'Alice Johnson',
        'Ally',
        Timestamp.fromDate(new Date('2025-07-12T10:35:00')),
        'Hey, are you free to talk?',
        ''
      ),
      new Message(
        'Text',
        this.userUID!,
        'https://cdn-icons-png.flaticon.com/512/168/168734.png',
        'Justin Cruz',
        'JC',
        Timestamp.fromDate(new Date('2025-07-12T10:40:00')),
        'Hello, sure what is it?',
        ''
      ),
    ];

    this.chat = type === 'private' ? privateChat : groupChat;
    this.messages = type === 'private' ? privateMessages : groupMessages;
  }
}
