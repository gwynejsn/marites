import { createSelector } from '@ngrx/store';
import { storeStructure } from '../../app.config';

export const selectAuth = (state: storeStructure) => state.auth;
export const selectAuthLoading = createSelector(
  selectAuth,
  (auth) => auth.loading
);
export const selectAuthError = createSelector(selectAuth, (auth) => auth.error);

export const selectIsAuthenticated = createSelector(
  selectAuth,
  (auth) => auth.isAuthenticated
);
