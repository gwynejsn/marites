import { Pipe, PipeTransform } from '@angular/core';
import { MessagePreview } from '../model/message-preview';

@Pipe({
  name: 'previewsSortByDate',
})
export class PreviewsSortByDatePipe implements PipeTransform {
  transform(messages: { previewId: string; preview: MessagePreview }[]): {
    previewId: string;
    preview: MessagePreview;
  }[] {
    const sorted = messages.sort(
      (a, b) =>
        b.preview.lastMessage.timestamp.toMillis() -
        a.preview.lastMessage.timestamp.toMillis()
    );
    return sorted;
  }
}
