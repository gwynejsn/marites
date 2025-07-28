import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Signal,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { storeStructure } from '../../../../app.config';
import { selectCurrUserUID } from '../../../../authentication/store/authentication.selectors';
import { ConfirmDialogComponent } from '../../../../generic/confirm-dialog/confirm-dialog.component';
import { InputBoxComponent } from '../../../../generic/input-box/input-box.component';
import { Chat } from '../../../../shared/model/chat.model';
import { ChatService } from '../../chat.service';
import { FriendsListComponent } from './friends-list/friends-list.component';
@Component({
  selector: 'app-chat-info',
  imports: [
    CommonModule,
    FormsModule,
    InputBoxComponent,
    ConfirmDialogComponent,
    FriendsListComponent,
  ],
  templateUrl: './chat-info.component.html',
})
export class ChatInfoComponent implements OnInit {
  @Input() chat!: Signal<Chat | null>;
  @Input() chatUID!: string;
  @Input() chatName!: string;
  @Input() chatPhoto!: string;
  @Output() closeChatInfo = new EventEmitter();

  currUserUID!: string | null;

  chatColor: string = '#6c5ce7';
  quickReaction: string = '';

  reactions = QUICK_REACTIONS;

  members: Signal<
    {
      name: string;
      profilePicture: string;
      uid: string;
    }[]
  > = computed(() => {
    const chat = this.chat();
    return Object.entries(chat?.members || {}).map(([key, val]) => ({
      name: val.name,
      profilePicture: val.profilePicture,
      uid: key,
    }));
  });

  membersUIDs = computed(() => Object.keys(this.chat()?.members!));

  removeMemberUID = signal<string | null>(null);

  // toggles / selectors
  selectQuickReaction = signal(false);
  toggleChangeGroupName = signal(false);
  toggleRemoveMember = signal(false);
  toggleAddMember = signal(false);
  confirmLeaveChat = signal(false);
  confirmDeleteChat = signal(false);

  isMobile = false;

  constructor(
    public chatService: ChatService,
    private store$: Store<storeStructure>
  ) {
    store$
      .pipe(select(selectCurrUserUID))
      .subscribe((u) => (this.currUserUID = u));
  }

  ngOnInit(): void {
    this.chatColor = this.chat()?.backgroundColor || '#6c5ce7';
    this.quickReaction = this.chat()?.quickReaction!;
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768; // md breakpoint
  }

  async updateChatColor() {
    await this.chatService.updateChat(this.chatUID, {
      backgroundColor: this.chatColor,
    });
  }

  async resetChatColor() {
    this.chatColor = '#6c5ce7';
    await this.chatService.updateChat(this.chatUID, {
      backgroundColor: null,
    });
  }

  async updateQuickReaction() {
    await this.chatService.updateChat(this.chatUID, {
      quickReaction: this.quickReaction,
    });
  }

  chooseQuickReaction() {
    this.selectQuickReaction.set(true);
  }

  closeChooseQuickReaction() {
    this.selectQuickReaction.set(false);
  }

  setQuickReaction(r: string) {
    this.quickReaction = r;
    this.updateQuickReaction();
    this.closeChooseQuickReaction();
  }

  async changeGroupPhoto(event: Event) {
    const photo = (event.target as HTMLInputElement).files?.[0];
    if (photo && this.chat()?.members) {
      await this.chatService.updateGroupPhoto(
        this.chatUID,
        photo,
        Object.keys(this.chat()?.members!)
      );
    } else throw new Error('chat members not found!');
  }

  async changeGroupChatName(newName: string) {
    if (!this.chat()?.members) throw new Error('chat members not found!');
    await this.chatService.updateGroupName(
      this.chatUID,
      newName,
      Object.keys(this.chat()?.members!)
    );
  }
}

export interface QuickReaction {
  emoji: string;
  label: string;
}

export const QUICK_REACTIONS: QuickReaction[] = [
  { emoji: '👍', label: 'Like' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '😂', label: 'Funny' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '👏', label: 'Clap' },
  { emoji: '🙌', label: 'Celebrate' },
  { emoji: '😍', label: 'Adore' },
  { emoji: '🤔', label: 'Thinking' },
  { emoji: '🙈', label: 'Oops' },
  { emoji: '👌', label: 'Ok' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '🤯', label: 'Mind blown' },
  { emoji: '🥺', label: 'Please' },
  { emoji: '😳', label: 'Shocked' },
  { emoji: '😆', label: 'LOL' },
  { emoji: '🙃', label: 'Silly' },
  { emoji: '🥰', label: 'Sweet' },
  { emoji: '😤', label: 'Frustrated' },
];
