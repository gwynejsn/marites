import { Injectable } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, collection, onSnapshot } from '@angular/fire/firestore';
import { Observable, switchMap, throwError } from 'rxjs';
import { Friend } from '../../shared/model/friend.model';

@Injectable({ providedIn: 'root' })
export class FriendsService {
  constructor(private auth: Auth, private firestore: Firestore) {}

  getFriends(): Observable<{ id: string; friend: Friend }[]> {
    return authState(this.auth).pipe(
      switchMap((user) => {
        if (!user) return throwError(() => new Error('User not authenticated'));

        const ref = collection(this.firestore, `users/${user.uid}/friends`);

        return new Observable<{ id: string; friend: Friend }[]>(
          (subscriber) => {
            const unsubscribe = onSnapshot(
              ref,
              (snapshot) => {
                const friends = snapshot.docs.map((request) => ({
                  id: request.id,
                  friend: Friend.fromJSON(request.data()),
                }));
                subscriber.next(friends);
              },
              (error) => subscriber.error(error)
            );

            // cleanup/teardown function
            return unsubscribe;
          }
        );
      })
    );
  }
}
