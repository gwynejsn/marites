import { CommonModule } from '@angular/common';
import { Component, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Friend } from '../../shared/model/friend.model';
import { SearchByNamePipe } from '../../shared/pipes/search-by-name.pipe';
import { FriendRequestsComponent } from './friend-requests/friend-requests.component';
import { FriendsAvailableComponent } from './friends-available/friends-available.component';
import { FriendsService } from './friends.service';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [
    FriendRequestsComponent,
    FriendsAvailableComponent,
    CommonModule,
    FormsModule,
    SearchByNamePipe,
  ],
  templateUrl: './friends.component.html',
})
export class FriendsComponent implements OnDestroy {
  friends: {
    id: string;
    friend: Friend;
  }[] = [];

  loading = true;
  error: string | null = null;
  friendsSub!: Subscription;

  toggleSearchBar = signal(false);
  searchTerm = '';

  constructor(private friendsService: FriendsService) {
    this.loadFriends();
    // this.mock();
  }

  ngOnDestroy(): void {
    this.friendsSub.unsubscribe();
  }

  loadFriends() {
    this.loading = true;
    this.friendsSub = this.friendsService.getFriends().subscribe({
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
