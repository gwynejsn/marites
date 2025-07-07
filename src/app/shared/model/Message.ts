import { Timestamp } from 'firebase/firestore';
import { messageType } from '../types';

export class Message {
  constructor(
    public type: messageType,
    public senderUID: string,
    public timestamp: Timestamp,
    public seenBy: string[],
    // if messageType is text
    public text: string,
    // if messageType is file or image
    public mediaUrl: string
  ) {}
}
