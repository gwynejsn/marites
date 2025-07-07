import { Timestamp } from 'firebase/firestore';
import { chatType } from '../types';
import { Message } from './Message';

export class Chat {
  constructor(
    public type: chatType,
    public membersUID: string[],
    public lastMessage: Message,
    public createdAt: Timestamp,
    // Only if chat type is group
    public groupName: string | null,
    public groupPhoto: string | null
  ) {}
}
