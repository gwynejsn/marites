import { Injectable } from '@angular/core';
import { collection, Firestore, onSnapshot } from '@angular/fire/firestore';
import { select, Store } from '@ngrx/store';
import { Observable, switchMap, throwError } from 'rxjs';
import { storeStructure } from '../../app.config';
import { selectCurrUserUID } from '../../authentication/store/authentication.selectors';
import { Friend } from '../../shared/model/friend.model';

@Injectable({ providedIn: 'root' })
export class FriendsService {
  constructor(
    private firestore: Firestore,
    private store$: Store<storeStructure>
  ) {}

  getFriends(): Observable<{ id: string; friend: Friend }[]> {
    return this.store$.pipe(
      select(selectCurrUserUID),
      switchMap((userUID) => {
        if (!userUID)
          return throwError(() => new Error('User not authenticated'));

        const ref = collection(this.firestore, `users/${userUID}/friends`);

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
