import { createReducer, on } from '@ngrx/store';
import { UserProfile } from '../../../shared/model/user-profile.model';
import {
  autoLoadFromLocalStorage,
  loginFailure,
  loginStart,
  loginSuccess,
  logout,
  resetLoadingError,
  signUpFailure,
  signUpStart,
  signUpSuccess,
} from './user-profile.actions';

export type userProfileState = {
  loading: boolean;
  error: string | null;
  userProfile: UserProfile | null;
};

export const reducerInitialValues = {
  loading: false,
  error: null,
  userProfile: null,
};

export const userProfileReducer = createReducer<userProfileState>(
  reducerInitialValues,
  on(signUpStart, (state) => ({ ...state, loading: true })), // loading and error are still initial value when started
  on(signUpSuccess, (state, { userProfile }) => ({
    ...state,
    userProfile: userProfile,
    loading: false,
  })),
  on(signUpFailure, (state, { error }) => ({
    ...state,
    error: error,
    loading: false,
  })),

  on(loginStart, (state) => ({ ...state, loading: true })),
  on(loginSuccess, (state, { userProfile }) => ({
    ...state,
    userProfile: userProfile,
    loading: false,
  })),
  on(loginFailure, (state, { error }) => ({
    ...state,
    error: error,
    loading: false,
  })),

  on(resetLoadingError, (state) => ({
    ...state,
    error: null,
    loading: false,
  })),

  on(autoLoadFromLocalStorage, (state) => {
    const userProfileJSON = localStorage.getItem('userProfile');
    let userProfile = null;

    if (userProfileJSON)
      userProfile = UserProfile.fromJSON(JSON.parse(userProfileJSON));

    return {
      userProfile: userProfile,
      error: null,
      loading: false,
    };
  }),

  on(logout, (state) => ({
    userProfile: null,
    error: null,
    loading: false,
  }))
);
