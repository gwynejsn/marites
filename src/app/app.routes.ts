import { Routes } from '@angular/router';
import { AuthenticationComponent } from './authentication/authentication.component';
import { LoginComponent } from './authentication/login/login.component';
import { SignUpComponent } from './authentication/sign-up/sign-up.component';
import { HomeComponent } from './home/home.component';
import { ChatAreaComponent } from './main-interface/chat-area/chat-area.component';
import { FriendsComponent } from './main-interface/friends/friends.component';
import { UserProfileComponent } from './main-interface/user-profile/user-profile.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { authenticationGuard } from './shared/guards/authentication.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'chat-area',
    component: ChatAreaComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'friends',
    component: FriendsComponent,
    canActivate: [authenticationGuard],
  },

  {
    path: 'user-profile',
    component: UserProfileComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'authentication',
    component: AuthenticationComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'sign-up',
        component: SignUpComponent,
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];
