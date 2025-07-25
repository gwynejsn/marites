import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Timestamp } from 'firebase/firestore';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { FriendRequest } from '../../../shared/model/friend-request.model';
import { FriendRequestsService } from './friend-requests.service';

@Component({
  selector: 'app-friend-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './friend-requests.component.html',
})
export class FriendRequestsComponent implements OnDestroy {
  friendRequests: {
    id: string;
    friendRequest: FriendRequest;
  }[] = [];
  loading = true;
  error: string | null = null;

  friendRequestsSub!: Subscription;

  constructor(private friendRequestsService: FriendRequestsService) {
    this.loadFriendRequests();
    // this.mock();
  }

  ngOnDestroy(): void {
    this.friendRequestsSub.unsubscribe();
  }

  loadFriendRequests() {
    this.loading = true;
    this.friendRequestsSub = this.friendRequestsService
      .getFriendRequests()
      .subscribe({
        next: (friendRequests) => {
          this.friendRequests = friendRequests;
          this.loading = false;
        },
        error: (err) => {
          this.error = err;
          this.loading = false;
        },
      });
  }

  acceptRequest(UID: string, name: string, profilePicture: string) {
    this.friendRequestsService
      .acceptRequest(UID, name, profilePicture)
      .then(() => {
        this.loadFriendRequests();
        // reload friends
        // this.reloadFriends.emit();
      });
  }

  rejectRequest(UID: string) {
    this.friendRequestsService
      .rejectRequest(UID)
      .then(() => this.loadFriendRequests());
  }

  mock() {
    this.loading = false;
    this.friendRequests = [
      {
        id: 'req_001',
        friendRequest: new FriendRequest(
          'uid_001',
          'Justin Santos',
          environment.defaultProfilePicture,
          'pending',
          Timestamp.now()
        ),
      },
      {
        id: 'req_002',
        friendRequest: new FriendRequest(
          'uid_002',
          'Marianne Cruz',
          environment.defaultProfilePicture,
          'pending',
          Timestamp.now()
        ),
      },
      {
        id: 'req_003',
        friendRequest: new FriendRequest(
          'uid_003',
          'Brian Lim',
          environment.defaultProfilePicture,
          'pending',
          Timestamp.now()
        ),
      },
      {
        id: 'req_004',
        friendRequest: new FriendRequest(
          'uid_004',
          'Carla Reyes',
          environment.defaultProfilePicture,
          'pending',
          Timestamp.now()
        ),
      },
    ];
  }
}
