import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), provideFirebaseApp(() => initializeApp({ projectId: "marites-277f8", appId: "1:639075396231:web:dec7e0aef8985c782b6622", storageBucket: "marites-277f8.firebasestorage.app", apiKey: "AIzaSyDEdyGIkyVHfGr6hKS2tk-RN2LBNH50uYY", authDomain: "marites-277f8.firebaseapp.com", messagingSenderId: "639075396231" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()),
  ],
};
