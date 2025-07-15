import { Timestamp } from 'firebase/firestore';
import { chatMember, chatType, userStatus } from '../types';

export class Chat {
  constructor(
    public type: chatType,
    public createdAt: Timestamp,
    public chatName: string | null,
    public chatPhoto: string | null,
    public quickReaction: string,
    public backgroundColor: string | null,
    public status: userStatus,
    public members: chatMember[]
  ) {}
}
