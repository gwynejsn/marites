import { createAction, props } from '@ngrx/store';
import { UserProfile } from '../../../shared/model/user-profile.model';

export const setUserProfile = createAction(
  '[user-profile] set user profile',
  props<{ userProfile: UserProfile }>()
);

export const removeUserProfile = createAction('[user-profile] remove');
