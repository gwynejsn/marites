import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { Message } from '../../../../shared/model/message';
import { chatType } from '../../../../shared/types';

@Component({
  selector: 'app-message',
  imports: [CommonModule],
  templateUrl: './message.component.html',
})
export class MessageComponent {
  @Input() message!: Message;
  @Input() chatType!: chatType;
  isUser = false;

  constructor(private auth: Auth) {
    user(auth).subscribe((user) => {
      const userUID = user?.uid;
      if (userUID === this.message.senderUID) this.isUser = true;
      else this.isUser = false;
    });
  }

  getFormattedTimestamp(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString();
    }
  }
}
