import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
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
}
