import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { ListOfMessagesComponent } from './list-of-messages/list-of-messages.component';

@Component({
  selector: 'app-chat-area',
  imports: [ListOfMessagesComponent, ChatWindowComponent, CommonModule],
  templateUrl: './chat-area.component.html',
})
export class ChatAreaComponent {
  isMobile = false;
  chatSelected = false;
  showListOfMessages = true;
  showChatWindow = true;

  ngOnInit() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768; // md breakpoint
  }
}
