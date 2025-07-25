import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  EventEmitter,
  Input,
  Output,
  Signal,
  signal,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { storeStructure } from '../../../../../app.config';
import { selectCurrUserUID } from '../../../../../authentication/store/authentication.selectors';
import { Friend } from '../../../../../shared/model/friend.model';
import { FriendsService } from '../../../../friends/friends.service';

@Component({
  selector: 'app-friends-list',
  imports: [CommonModule],
  templateUrl: './friends-list.component.html',
})
export class FriendsListComponent {
  @Input() membersUIDs!: Signal<string[]>;
  @Output() close = new EventEmitter();
  @Output() addMember = new EventEmitter<{
    UID: string;
    name: string;
    profilePicture: string;
  }>();

  friends = signal<
    {
      id: string;
      friend: Friend;
    }[]
  >([]);

  availableFriends = computed(() => {
    return this.friends().filter((f) => !this.membersUIDs().includes(f.id));
  });

  currUserUID: string | null = null;

  loading = false;
  error = null;
  friendsSub!: Subscription;

  constructor(
    private friendsService: FriendsService,
    private store$: Store<storeStructure>
  ) {
    store$
      .pipe(select(selectCurrUserUID))
      .subscribe((uid) => (this.currUserUID = uid));
    this.loadFriends();
  }

  ngOnDestroy(): void {
    this.friendsSub.unsubscribe();
  }

  loadFriends() {
    this.loading = true;
    this.friendsSub = this.friendsService.getFriends().subscribe({
      next: (friends) => {
        console.log('update');

        this.friends.set(friends);
        this.loading = false;
      },
      error: (err) => {
        this.error = err;
        this.loading = false;
      },
    });
  }
}
