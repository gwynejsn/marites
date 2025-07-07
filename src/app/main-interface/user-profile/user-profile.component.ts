import { Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { storeStructure } from '../../app.config';
import { selectUserProfile } from './store/user-profile.selectors';

@Component({
  selector: 'app-user-profile',
  imports: [],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent {
  constructor(private store$: Store<storeStructure>) {
    store$.pipe(select(selectUserProfile)).subscribe((up) => {
      console.log(up.userProfile);
    });
  }
}
