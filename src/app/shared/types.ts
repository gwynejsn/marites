export type gender = 'Male' | 'Female' | 'Other';
export type status = 'Online' | 'Offline';
export type messageType = 'File' | 'Text' | 'Image';
export type chatType = 'Group' | 'Private';
export type userProfileStatus = 'uploading' | 'fetching' | 'fetched' | 'init';

export type chatNameGroup = {
  type: 'group';
  name: string;
};

export type chatNamePrivate = {
  type: 'private';
  names: {
    [uid: string]: string;
  };
};

export type chatNameMap = chatNameGroup | chatNamePrivate;

export type chatMemberMap = {
  [uid: string]: {
    name: string;
    nickname: string;
  };
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
