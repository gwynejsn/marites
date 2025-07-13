import { Timestamp } from 'firebase/firestore';

export class FriendRequest {
  constructor(
    public fromUID: string,
    public fromName: string,
    public fromProfilePicture: string,
    public status: 'pending' | 'accepted' | 'declined',
    public timestamp: Timestamp
  ) {}

  static fromJSON(json: any): FriendRequest {
    return new FriendRequest(
      json.fromUID,
      json.fromName,
      json.fromProfilePicture,
      json.status,
      json.timestamp?.seconds
        ? Timestamp.fromMillis(json.timestamp.seconds * 1000)
        : Timestamp.now()
    );
  }
}
