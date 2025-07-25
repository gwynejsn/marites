import { Timestamp } from 'firebase/firestore';
import { chatType } from '../types';
import { Message } from './message';

export class MessagePreview {
  constructor(
    public chatName: string,
    public lastMessage: Message,
    public chatPhoto: string,
    public read: boolean,
    public memberUIDs: string[],
    public chatType: chatType
  ) {}

  toFirestore(): object {
    return {
      chatName: this.chatName,
      lastMessage: this.lastMessage.toFirestore(),
      chatPhoto: this.chatPhoto,
      read: this.read,
      memberUIDs: this.memberUIDs,
      chatType: this.chatType,
    };
  }

  static fromJSON(json: any): MessagePreview {
    return new MessagePreview(
      json.chatName,
      Message.fromJSON(json.lastMessage),
      json.chatPhoto,
      json.read,
      json.memberUIDs,
      json.chatType
    );
  }

  static init(
    chatName: string,
    chatPhoto: string,
    memberUIDs: string[],
    chatType: chatType
  ) {
    return new MessagePreview(
      chatName,
      new Message('Text', '', '', '', Timestamp.now(), '', '', true),
      chatPhoto,
      false,
      memberUIDs,
      chatType
    );
  }
}
