import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chat } from '../../../../shared/model/chat.model';
import { ChatService } from '../../chat.service';
@Component({
  selector: 'app-chat-info',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-info.component.html',
})
export class ChatInfoComponent implements OnInit {
  @Input() chat!: Chat;
  @Input() chatUID!: string;
  @Input() chatName!: string;
  @Output() closeChatInfo = new EventEmitter();

  chatColor: string = '#6c5ce7';
  quickReaction: string = '';

  selectQuickReaction = false;
  reactions = QUICK_REACTIONS;

  members!: {
    name: string;
    nickname: string;
  }[];

  constructor(
    public cdr: ChangeDetectorRef,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.members = Object.values(this.chat.members);

    if (this.chat?.backgroundColor) this.chatColor = this.chat.backgroundColor;
    this.quickReaction = this.chat.quickReaction;
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
    this.selectQuickReaction = true;
    this.cdr.detectChanges();
  }

  closeChooseQuickReaction() {
    this.selectQuickReaction = false;
    this.cdr.detectChanges();
  }

  setQuickReaction(r: string) {
    this.quickReaction = r;
    this.updateQuickReaction();
    this.selectQuickReaction = false;
    this.cdr.detectChanges();
  }

  changeGroupPhoto(event: Event) {
    const photo = (event.target as HTMLInputElement).files?.[0];
    if (photo) {
      this.chatService.updateGroupPhoto(
        this.chatUID,
        photo,
        Object.keys(this.chat.members)
      );
    }
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
