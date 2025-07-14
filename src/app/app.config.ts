import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideEffects } from '@ngrx/effects';
import { provideState, provideStore } from '@ngrx/store';

import { firebase } from '../environments/firebase';
import { routes } from './app.routes';
import {
  authReducer,
  authState,
} from './authentication/store/authentication.reducers';
import { UserProfileEffects } from './main-interface/user-profile/store/user-profile.effects';
import {
  userProfileReducer,
  userProfileState,
} from './main-interface/user-profile/store/user-profile.reducers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebase.config)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideEffects(UserProfileEffects),
    provideStore<storeStructure>(),
    provideState({ name: 'userProfile', reducer: userProfileReducer }),
    provideState({ name: 'auth', reducer: authReducer }),
  ],
};

// used in selectors
export interface storeStructure {
  userProfile: userProfileState;
  auth: authState;
}
