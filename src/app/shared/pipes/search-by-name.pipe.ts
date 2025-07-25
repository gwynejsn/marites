import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchByName',
})
export class SearchByNamePipe implements PipeTransform {
  transform(messages: any[], searchTerm: string): any[] {
    if (!searchTerm) return messages;

    const lowerSearch = searchTerm.toLowerCase();

    return messages.filter((m) => {
      if (m.preview?.chatName) {
        return m.preview.chatName.toLowerCase().includes(lowerSearch);
      } else if (m.friend?.name) {
        return m.friend.name.toLowerCase().includes(lowerSearch);
      }

      return false;
    });
  }
}
