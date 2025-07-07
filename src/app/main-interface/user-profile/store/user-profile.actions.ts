import { createAction, props } from '@ngrx/store';
import { UserProfile } from '../../../shared/model/user-profile.model';
import { gender } from '../../../shared/types';

type signUpForm = {
  firstName: string;
  lastName: string;
  age: number;
  gender: gender;
  email: string;
  password: string;
  profilePicture: File | null;
};

export const signUpStart = createAction(
  '[user-profile] sign up start',
  props<{ form: signUpForm }>()
);

export const signUpSuccess = createAction(
  '[user-profile] sign up success',
  props<{ userProfile: UserProfile }>()
);

export const signUpFailure = createAction(
  '[user-profile] sign up failure',
  props<{ error: string }>()
);

export const loginStart = createAction(
  '[user-profile] login start',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[user-profile] login success',
  props<{ userProfile: UserProfile }>()
);

export const loginFailure = createAction(
  '[user-profile] login failure',
  props<{ error: string }>()
);

export const resetLoadingError = createAction(
  '[user-profile] reset loading error'
);

export const autoLoadFromLocalStorage = createAction(
  '[user-profile] auto load from local storage'
);

export const logout = createAction('[user-profile] logout');
