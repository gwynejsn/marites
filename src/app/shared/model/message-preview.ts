import { Timestamp } from 'firebase/firestore';
import { status } from '../types';
import { Message } from './message';

export class MessagePreview {
  constructor(
    public chatName: string,
    public lastMessage: Message,
    public chatPhoto: string,
    public status: status,
    public readBy: string[]
  ) {}

  toFirestore(): object {
    return {
      chatName: this.chatName,
      lastMessage: this.lastMessage.toFirestore(),
      chatPhoto: this.chatPhoto,
      status: this.status,
      readBy: this.readBy,
    };
  }

  static fromJSON(json: any): MessagePreview {
    return new MessagePreview(
      json.chatName,
      Message.fromJSON(json.lastMessage),
      json.chatPhoto,
      json.status,
      Array.isArray(json.readBy) ? json.readBy : [] // fallback to empty array
    );
  }

  static init(chatName: string, chatPhoto: string) {
    return new MessagePreview(
      chatName,
      new Message('Text', '', '', '', '', Timestamp.now(), '', '', true),
      chatPhoto,
      'Online',
      []
    );
  }
}
