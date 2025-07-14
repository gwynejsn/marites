import { Injectable } from '@angular/core';
import { Auth, authState, User } from '@angular/fire/auth';
import { collection, Firestore, getDocs } from '@angular/fire/firestore';
import { Store } from '@ngrx/store';
import { from, map, Observable, switchMap, throwError } from 'rxjs';
import { storeStructure } from '../../app.config';
import { Friend } from '../../shared/model/friend.model';

@Injectable({ providedIn: 'root' })
export class FriendsService {
  private authState$: Observable<User | null>;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private store$: Store<storeStructure>
  ) {
    this.authState$ = authState(auth);
  }

  getFriends(): Observable<
    {
      id: string;
      friend: Friend;
    }[]
  > {
    return this.authState$.pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(() => new Error('User not authenticated'));
        }

        // fetch friends
        return from(
          getDocs(collection(this.firestore, `users/${user.uid}/friends`))
        ).pipe(
          map((snapshot) => {
            const friends = snapshot.docs.map((friend) => ({
              id: friend.id,
              friend: Friend.fromJSON(friend.data()),
            }));
            return friends;
          })
        );
      })
    );
  }
}
