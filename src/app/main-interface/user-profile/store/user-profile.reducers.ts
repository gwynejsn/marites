import { createReducer, on } from '@ngrx/store';
import { UserProfile } from '../../../shared/model/user-profile.model';
import { removeUserProfile, setUserProfile } from './user-profile.actions';

export type userProfileState = {
  loading: boolean;
  error: string | null;
  userProfile: UserProfile | null;
};

export const userProfileInitialValues = {
  loading: false,
  error: null,
  userProfile: null,
};

export const userProfileReducer = createReducer<userProfileState>(
  userProfileInitialValues,
  on(setUserProfile, (state, { userProfile }) => ({
    ...state,
    userProfile: userProfile,
  })),

  on(removeUserProfile, (state) => userProfileInitialValues)
);
