import { createSelector } from '@ngrx/store';
import { storeStructure } from '../../../app.config';

export const selectUserProfile = (state: storeStructure) => state.userProfile;
export const selectUserProfileLoading = createSelector(
  selectUserProfile,
  (userProfile) => userProfile.loading
);
export const selectUserProfileError = createSelector(
  selectUserProfile,
  (userProfile) => userProfile.error
);
