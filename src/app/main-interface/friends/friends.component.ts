import { Component } from '@angular/core';
import { FriendsAvailableComponent } from './friends-available/friends-available.component';
@Component({
  selector: 'app-friends',
  imports: [FriendsAvailableComponent],
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.css',
})
export class FriendsComponent {}
