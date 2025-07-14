import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Friend } from '../../shared/model/friend.model';
import { FriendRequestsComponent } from './friend-requests/friend-requests.component';
import { FriendsAvailableComponent } from './friends-available/friends-available.component';
import { FriendsService } from './friends.service';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [FriendRequestsComponent, FriendsAvailableComponent, CommonModule],
  templateUrl: './friends.component.html',
})
export class FriendsComponent {
  friends: {
    id: string;
    friend: Friend;
  }[] = [];

  loading = true;
  error: string | null = null;

  constructor(private friendsService: FriendsService) {
    this.loadFriends();
    // this.mock();
  }

  loadFriends() {
    this.loading = true;
    this.friendsService.getFriends().subscribe({
      next: (friends) => {
        this.friends = friends;
        this.loading = false;
      },
      error: (err) => {
        this.error = err;
        this.loading = false;
      },
    });
  }

  mock() {
    this.loading = false;
    this.friends = [
      {
        id: 'friend_01',
        friend: new Friend(
          'uid_01',
          'Alice Santos',
          environment.defaultProfilePicture
        ),
      },
      {
        id: 'friend_02',
        friend: new Friend(
          'uid_02',
          'Brian Cruz',
          environment.defaultProfilePicture
        ),
      },
      {
        id: 'friend_03',
        friend: new Friend(
          'uid_03',
          'Carla Reyes',
          environment.defaultProfilePicture
        ),
      },
      {
        id: 'friend_04',
        friend: new Friend(
          'uid_04',
          'David Tan',
          environment.defaultProfilePicture
        ),
      },
      {
        id: 'friend_05',
        friend: new Friend(
          'uid_05',
          'Ella Navarro',
          environment.defaultProfilePicture
        ),
      },
    ];
  }
}
