import { Routes } from '@angular/router';
import { ChatAreaComponent } from './main-interface/chat-area/chat-area.component';
import { FriendRequestsComponent } from './main-interface/friend-requests/friend-requests.component';
import { SettingsComponent } from './main-interface/settings/settings.component';
import { UserProfileComponent } from './main-interface/user-profile/user-profile.component';

export const routes: Routes = [
  {
    path: 'chat-area',
    component: ChatAreaComponent,
  },
  {
    path: 'friend-requests',
    component: FriendRequestsComponent,
  },
  {
    path: 'settings',
    component: SettingsComponent,
  },
  {
    path: 'user-profile',
    component: UserProfileComponent,
  },
];
