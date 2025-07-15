import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MessagePreview } from '../../../../shared/model/message-preview';

@Component({
  selector: 'app-message-preview',
  imports: [CommonModule],
  templateUrl: './message-preview.component.html',
})
export class MessagePreviewComponent {
  @Input() messagePreview!: MessagePreview;
}
