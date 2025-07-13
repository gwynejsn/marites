export type gender = 'Male' | 'Female' | 'Other';
export type userStatus = 'Online' | 'Offline';
export type messageType = 'File' | 'Text' | 'Image';
export type chatType = 'Group' | 'Private';
export type userProfileStatus = 'uploading' | 'fetching' | 'fetched' | 'init';
export type chatMember = {
  name: string;
  nickname: string;
  UID: string;
};
export type signUpForm = {
  firstName: string;
  lastName: string;
  age: number;
  gender: gender;
  email: string;
  password: string;
  profilePicture: File | null;
};
