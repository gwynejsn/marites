import { gender } from '../types';

export class UserProfile {
  constructor(
    public firstName: string,
    public lastName: string,
    public age: number,
    public gender: gender,
    public email: string,
    public profilePicture: string,
    public friendSuggestionsBlacklist: string[]
  ) {}

  get fullName() {
    return this.firstName + ' ' + this.lastName;
  }
  static fromJSON(json: any): UserProfile {
    return new UserProfile(
      json.firstName,
      json.lastName,
      json.age,
      json.gender,
      json.email,
      json.profilePicture,
      json.friendSuggestionsBlacklist
    );
  }
}
