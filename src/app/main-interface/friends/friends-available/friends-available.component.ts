import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Timestamp } from 'firebase/firestore';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { UserProfile } from '../../../shared/model/user-profile.model';
import { FriendsAvailableService } from './friends-available.service';

@Component({
  selector: 'app-friends-available',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './friends-available.component.html',
})
export class FriendsAvailableComponent implements OnDestroy {
  addableUsers: {
    id: string;
    profile: UserProfile;
  }[] = [];

  loading = true;
  error: string | null = null;

  friendsAvailableSub!: Subscription;

  constructor(private friendsAvailableService: FriendsAvailableService) {
    this.loadAddableUsers();
    // this.mock();
  }

  ngOnDestroy(): void {
    this.friendsAvailableSub.unsubscribe();
  }

  loadAddableUsers() {
    this.loading = true;
    this.friendsAvailableSub = this.friendsAvailableService
      .getAddableUsers()
      .subscribe({
        next: (addableUsers) => {
          this.addableUsers = addableUsers;
          this.loading = false;
        },
        error: (err) => {
          this.error = err;
          this.loading = false;
        },
      });
  }

  addFriend(userUID: string) {
    console.log('adding user uid: ', userUID);
    this.friendsAvailableService.addFriend(userUID).then(() => {
      this.loadAddableUsers();
    });
  }

  mock() {
    this.loading = false;
    this.addableUsers = [
      {
        id: 'uid_101',
        profile: new UserProfile(
          'Justin',
          'Gomez',
          21,
          'Male',
          'email',
          environment.defaultProfilePicture,
          'Online',
          Timestamp.now(),
          []
        ),
      },
      {
        id: 'uid_102',
        profile: new UserProfile(
          'Marianne',
          'Lim',
          20,
          'Female',
          'email',
          environment.defaultProfilePicture,
          'Offline',
          Timestamp.now(),
          []
        ),
      },
      {
        id: 'uid_103',
        profile: new UserProfile(
          'Kevin',
          'Yu',
          22,
          'Male',
          'email',
          environment.defaultProfilePicture,
          'Online',
          Timestamp.now(),
          []
        ),
      },
      {
        id: 'uid_104',
        profile: new UserProfile(
          'Isabelle',
          'Tan',
          23,
          'Female',
          'email',
          environment.defaultProfilePicture,
          'Offline',
          Timestamp.now(),
          []
        ),
      },
    ];
  }
}
