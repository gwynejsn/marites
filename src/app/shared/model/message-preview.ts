import { status } from '../types';
import { Message } from './message';

export class MessagePreview {
  constructor(
    public chatUID: string,
    public chatName: string,
    public lastMessage: Message,
    public chatPhoto: string,
    public status: status,
    public readBy: string[]
  ) {}

  toFirestore(): object {
    return {
      chatUID: this.chatUID,
      chatName: this.chatName,
      lastMessage: this.lastMessage.toFirestore(),
      chatPhoto: this.chatPhoto,
      status: this.status,
      readBy: this.readBy,
    };
  }

  static fromJSON(json: any): MessagePreview {
    return new MessagePreview(
      json.chatUID,
      json.chatName,
      Message.fromJSON(json.lastMessage),
      json.chatPhoto,
      json.status,
      Array.isArray(json.readBy) ? json.readBy : [] // fallback to empty array
    );
  }
}
