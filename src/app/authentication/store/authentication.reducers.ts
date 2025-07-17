import { createReducer, on } from '@ngrx/store';
import {
  loginFailure,
  loginStart,
  loginSuccess,
  logoutFailure,
  logoutSuccess,
  signUpFailure,
  signUpStart,
  signUpSuccess,
} from './authentication.actions';

export type authState = {
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  currUserUID: string | null;
};

export const authInitialValues: authState = {
  loading: false,
  error: null,
  isAuthenticated: false,
  currUserUID: null,
};

export const authReducer = createReducer(
  authInitialValues,
  // sign up
  on(signUpStart, (state) => ({ ...state, loading: true })),
  on(signUpSuccess, (state, { uid }) => ({
    ...state,
    isAuthenticated: true,
    loading: false,
    currUserUID: uid,
  })),
  on(signUpFailure, (state, { error }) => ({
    ...state,
    error: error,
    loading: false,
  })),

  // login
  on(loginStart, (state) => ({ ...state, loading: true })),
  on(loginSuccess, (state, { uid }) => ({
    ...state,
    isAuthenticated: true,
    loading: false,
    currUserUID: uid,
  })),
  on(loginFailure, (state, { error }) => ({
    ...state,
    error: error,
    loading: false,
  })),

  // logout
  on(logoutSuccess, (state) => ({
    ...state,
    isAuthenticated: false,
    loading: false,
    currUserUID: null,
  })),
  on(logoutFailure, (state, { error }) => ({
    ...state,
    error: error,
    loading: false,
  }))
);
