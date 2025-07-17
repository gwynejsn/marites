import { Timestamp } from 'firebase/firestore';
import { gender, status } from '../types';

export class UserProfile {
  constructor(
    public firstName: string,
    public lastName: string,
    public age: number,
    public gender: gender,
    public email: string,
    public profilePicture: string,
    public status: status,
    public lastSeen: Timestamp,
    public friendSuggestionsBlacklist: string[]
  ) {}

  static fromJSON(json: any): UserProfile {
    let lastSeen: Timestamp;

    if (json.lastSeen?.seconds) {
      // Case: plain object from localStorage
      lastSeen = Timestamp.fromMillis(json.lastSeen.seconds * 1000);
    } else if (json.lastSeen?.toMillis) {
      // Case: already a Timestamp instance
      lastSeen = json.lastSeen;
    } else {
      // Fallback: current timestamp or null-safe
      lastSeen = Timestamp.now();
    }

    return new UserProfile(
      json.firstName,
      json.lastName,
      json.age,
      json.gender,
      json.email,
      json.profilePicture,
      json.status,
      lastSeen,
      json.friendSuggestionsBlacklist
    );
  }
}
