import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { UserProfile } from 'firebase/auth';
import { FriendsService } from '../friends.service';

@Component({
  selector: 'app-friends-available',
  imports: [CommonModule],
  templateUrl: './friends-available.component.html',
  styleUrl: './friends-available.component.css',
})
export class FriendsAvailableComponent {
  addableUsers: {
    id: string;
    profile: UserProfile;
  }[] = [];
  constructor(private friendsService: FriendsService) {
    this.loadAddableUsers();
  }
  loadAddableUsers() {
    // this.friendsService.getAddableUsers().subscribe((addableUsers) => {
    //   this.addableUsers = addableUsers;
    // });
  }
  addFriend(userUID: string) {
    console.log('adding user uid: ', userUID);
    this.friendsService.addFriend(userUID).then(() => {
      this.loadAddableUsers(); // 👈 refresh after sending request
    });
  }
}
