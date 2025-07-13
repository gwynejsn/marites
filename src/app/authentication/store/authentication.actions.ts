import { createAction, props } from '@ngrx/store';

export const signUpStart = createAction('[auth] sign up start');

export const signUpSuccess = createAction('[auth] sign up success');

export const signUpFailure = createAction(
  '[auth] sign up failure',
  props<{ error: string }>()
);

export const loginStart = createAction(
  '[auth] login start',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction('[auth] login success');

export const loginFailure = createAction(
  '[auth] login failure',
  props<{ error: string }>()
);

export const logoutSuccess = createAction('[auth] logout success');

export const logoutFailure = createAction(
  '[auth] logout failure',
  props<{ error: string }>()
);
