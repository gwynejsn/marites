export class Friend {
  constructor(
    public uid: string,
    public name: string,
    public profilePicture: string
  ) {}

  static fromJSON(json: any): Friend {
    return new Friend(json.uid, json.name, json.profilePicture);
  }
}
