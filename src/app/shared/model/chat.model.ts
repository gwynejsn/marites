import { Timestamp } from 'firebase/firestore';
import { chatMemberMap, chatNameMap, chatType } from '../types';

export class Chat {
  constructor(
    public type: chatType,
    public createdAt: Timestamp,
    public chatName: chatNameMap,
    public chatPhoto: string,
    public quickReaction: string,
    public backgroundColor: string | null,
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
      members: this.members,
    };
  }

  static fromJSON(json: any): Chat {
    return new Chat(
      json.type as chatType,
      json.createdAt instanceof Timestamp
        ? json.createdAt
        : Timestamp.fromMillis(json.createdAt?.seconds * 1000 || 0),
      json.chatName || '',
      json.chatPhoto || '',
      json.quickReaction || '',
      json.backgroundColor ?? null,
      json.members as chatMemberMap
    );
  }
}
