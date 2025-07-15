import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { storeStructure } from '../../app.config';
import { UserProfile } from '../../shared/model/user-profile.model';
import { selectUserProfile } from './store/user-profile.selectors';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
})
export class UserProfileComponent {
  userProfile$: Observable<UserProfile | null>;

  constructor(private store$: Store<storeStructure>) {
    this.userProfile$ = store$
      .pipe(select(selectUserProfile))
      .pipe(map((p) => p.userProfile));
  }
}
