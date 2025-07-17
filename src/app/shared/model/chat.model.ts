import { Timestamp } from 'firebase/firestore';
import { chatMemberMap, chatType, status } from '../types';

export class Chat {
  constructor(
    public type: chatType,
    public createdAt: Timestamp,
    public chatName: string,
    public chatPhoto: string,
    public quickReaction: string,
    public backgroundColor: string | null,
    public status: status,
    public members: chatMemberMap
  ) {}

  toJSON() {
    return {
      type: this.type,
      createdAt: this.createdAt,
      chatName: this.chatName,
      chatPhoto: this.chatPhoto,
      quickReaction: this.quickReaction,
      backgroundColor: this.backgroundColor,
      status: this.status,
      members: this.members,
    };
  }
}
