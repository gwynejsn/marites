import { createAction, props } from '@ngrx/store';
import { UserProfile } from '../../../shared/model/user-profile.model';

export const fetchStart = createAction(
  '[Shared] Fetch Start',
  props<{ target: 'friends' | 'requests' | 'addable' }>()
);

export const fetchSuccess = createAction(
  '[Shared] Fetch Success',
  props<{ target: 'friends' | 'requests' | 'addable'; users: UserProfile[] }>()
);

export const fetchError = createAction(
  '[Shared] Fetch Error',
  props<{ target: 'friends' | 'requests' | 'addable'; error: string }>()
);
