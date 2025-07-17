import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { MessagePreview } from '../../../../shared/model/message-preview';

@Component({
  selector: 'app-message-preview',
  imports: [CommonModule],
  templateUrl: './message-preview.component.html',
})
export class MessagePreviewComponent {
  @Input() messagePreview!: MessagePreview;
  read!: boolean;

  constructor(private auth: Auth) {
    const currUserUID = this.auth.currentUser?.uid;
    if (currUserUID && this.messagePreview) {
      this.read = this.messagePreview.readBy.includes(currUserUID);
    }
  }
}
