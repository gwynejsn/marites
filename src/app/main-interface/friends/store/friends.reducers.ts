import { createReducer } from '@ngrx/store';
import { UserProfile } from '../../../shared/model/user-profile.model';

// addable users
export type addableUsersState = {
  loading: boolean;
  error: string | null;
  addableUsers: UserProfile[];
};

export const addableUsersInitialValues = {
  loading: false,
  error: null,
  addableUsers: [],
};

export const addableUsersReducer = createReducer<addableUsersState>(
  addableUsersInitialValues
);

// friends
export type friendsState = {
  loading: boolean;
  error: string | null;
  friends: UserProfile[];
};

export const friendsInitialValues: friendsState = {
  loading: false,
  error: null,
  friends: [],
};

export const friendsReducer = createReducer<friendsState>(friendsInitialValues);

// friend requests
export type friendRequestsState = {
  loading: boolean;
  error: string | null;
  friendRequests: UserProfile[];
};

export const friendRequestsInitialValues: friendRequestsState = {
  loading: false,
  error: null,
  friendRequests: [],
};

export const friendRequestsReducer = createReducer<friendRequestsState>(
  friendRequestsInitialValues
);
