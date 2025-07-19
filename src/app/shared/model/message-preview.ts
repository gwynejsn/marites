import { Timestamp } from 'firebase/firestore';
import { Message } from './message';

export class MessagePreview {
  constructor(
    public chatName: string,
    public lastMessage: Message,
    public chatPhoto: string,
    public read: boolean
  ) {}

  toFirestore(): object {
    return {
      chatName: this.chatName,
      lastMessage: this.lastMessage.toFirestore(),
      chatPhoto: this.chatPhoto,
      read: this.read,
    };
  }

  static fromJSON(json: any): MessagePreview {
    return new MessagePreview(
      json.chatName,
      Message.fromJSON(json.lastMessage),
      json.chatPhoto,
      json.read
    );
  }

  static init(chatName: string, chatPhoto: string) {
    return new MessagePreview(
      chatName,
      new Message('Text', '', '', '', '', Timestamp.now(), '', '', true),
      chatPhoto,
      false
    );
  }
}
