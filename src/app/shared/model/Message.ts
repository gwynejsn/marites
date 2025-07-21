import { Timestamp } from 'firebase/firestore';
import { messageType } from '../types';

export class Message {
  constructor(
    public type: messageType,
    public senderUID: string,
    public senderProfilePicture: string,
    public senderName: string,
    public timestamp: Timestamp,
    public text: string,
    public mediaUrl: string,
    public empty: boolean
  ) {}

  static fromJSON(json: any): Message {
    return new Message(
      json.type as messageType,
      json.senderUID,
      json.senderProfilePicture,
      json.senderName,
      json.timestamp instanceof Timestamp
        ? json.timestamp
        : Timestamp.fromMillis(json.timestamp?.seconds * 1000 || 0),
      json.text || '',
      json.mediaUrl || '',
      json.empty
    );
  }

  toFirestore(): object {
    return {
      type: this.type,
      senderUID: this.senderUID,
      senderProfilePicture: this.senderProfilePicture,
      senderName: this.senderName,
      timestamp: this.timestamp,
      text: this.text,
      mediaUrl: this.mediaUrl,
      empty: this.empty,
    };
  }
}
