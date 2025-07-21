import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  EventEmitter,
  Output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { firstValueFrom, Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';
import { storeStructure } from '../../../../app.config';
import { selectCurrUserUID } from '../../../../authentication/store/authentication.selectors';
import { Friend } from '../../../../shared/model/friend.model';
import { chatMemberMap } from '../../../../shared/types';
import { FriendsService } from '../../../friends/friends.service';
import { selectUserProfile } from '../../../user-profile/store/user-profile.selectors';

@Component({
  selector: 'app-create-group-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-group-chat.component.html',
})
export class CreateGroupChatComponent {
  friends = signal<
    {
      id: string;
      friend: Friend;
    }[]
  >([]);
  availableFriends = computed(() => {
    const memberUIDs = Object.keys(this.chatMembers());
    return this.friends().filter((f) => !memberUIDs.includes(f.id));
  });

  loading = false;
  error = null;
  friendsSub!: Subscription;

  chatPhotoPreview: string | ArrayBuffer | null =
    environment.defaultProfilePicture;

  chatPhoto: File | null = null;
  chatMembers = signal<chatMemberMap>({});
  chatName = signal('');

  isValid = computed(
    () =>
      Object.keys(this.chatMembers()).length > 1 && this.chatName().length > 0
  );

  @Output() cancel = new EventEmitter();
  step = signal(1);

  currUserUID: string | null = null;

  constructor(
    private friendsService: FriendsService,
    private store$: Store<storeStructure>
  ) {
    store$
      .pipe(select(selectCurrUserUID))
      .subscribe((uid) => (this.currUserUID = uid));
    this.loadFriends();
    this.addSelfToMembers();
  }

  ngOnDestroy(): void {
    this.friendsSub.unsubscribe();
  }

  async addSelfToMembers() {
    const userProfile = (
      await firstValueFrom(this.store$.pipe(select(selectUserProfile)))
    ).userProfile;

    if (this.currUserUID && userProfile) {
      this.chatMembers.update((prev) => ({
        ...prev,
        [this.currUserUID!]: {
          name: userProfile.fullName,
          profilePicture: userProfile.profilePicture,
        },
      }));
    }
  }

  addMember(UID: string, name: string, profilePicture: string) {
    this.chatMembers.update((prev) => ({
      ...prev,
      [UID]: {
        name,
        profilePicture,
      },
    }));
  }

  removeMember(UID: string) {
    this.chatMembers.update((prev) => {
      const updated = { ...prev };
      delete updated[UID];
      return updated;
    });
  }

  loadFriends() {
    this.loading = true;
    this.friendsSub = this.friendsService.getFriends().subscribe({
      next: (friends) => {
        this.friends.set(friends);
        this.loading = false;
      },
      error: (err) => {
        this.error = err;
        this.loading = false;
      },
    });
  }

  changeProfileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.chatPhoto = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.chatPhotoPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  createChat() {}
}
