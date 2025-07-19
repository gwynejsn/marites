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
import { InputBoxComponent } from '../../../../generic/input-box/input-box.component';
import { Chat } from '../../../../shared/model/chat.model';
@Component({
  selector: 'app-chat-info',
  imports: [CommonModule, FormsModule, InputBoxComponent],
  templateUrl: './chat-info.component.html',
})
export class ChatInfoComponent implements OnInit {
  @Input() chat!: Chat;
  @Input() chatName!: string;
  @Output() closeChatInfo = new EventEmitter();

  chatColor: string = '#6c5ce7';
  quickReaction: string = 'k';

  selectQuickReaction = false;
  reactions = QUICK_REACTIONS;
  members!: {
    name: string;
    nickname: string;
  }[];
  changeMemberNickname: string = '';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.members = Object.values(this.chat.members);
    if (this.chat?.backgroundColor) this.chatColor = this.chat.backgroundColor;
    this.quickReaction = this.chat.quickReaction;
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
    this.selectQuickReaction = false;
    this.cdr.detectChanges();
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
