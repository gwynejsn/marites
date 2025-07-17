import { Pipe, PipeTransform } from '@angular/core';
import { Message } from '../model/message';

@Pipe({
  name: 'messagesSortByDate',
})
export class MessagesSortByDatePipe implements PipeTransform {
  transform(messages: { id: string; message: Message }[]): {
    id: string;
    message: Message;
  }[] {
    const sorted = messages.sort(
      (a, b) => a.message.timestamp.toMillis() - b.message.timestamp.toMillis()
    );
    return sorted;
  }
}
