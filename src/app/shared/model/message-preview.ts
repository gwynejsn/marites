import { userStatus } from '../types';
import { Message } from './message';

export class MessagePreview {
  constructor(
    public chatUID: string,
    public chatName: string,
    public lastMessage: Message,
    public profilePicture: string,
    public status: userStatus,
    public read: boolean
  ) {}
}
