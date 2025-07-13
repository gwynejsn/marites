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
};

export const authInitialValues: authState = {
  loading: false,
  error: null,
  isAuthenticated: false,
};

export const authReducer = createReducer(
  authInitialValues,
  // sign up
  on(signUpStart, (state) => ({ ...state, loading: true })),
  on(signUpSuccess, (state) => ({
    ...state,
    isAuthenticated: true,
    loading: false,
  })),
  on(signUpFailure, (state, { error }) => ({
    ...state,
    error: error,
    loading: false,
  })),

  // login
  on(loginStart, (state) => ({ ...state, loading: true })),
  on(loginSuccess, (state) => ({
    ...state,
    isAuthenticated: true,
    loading: false,
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
  })),
  on(logoutFailure, (state, { error }) => ({
    ...state,
    error: error,
    loading: false,
  }))
);
