import { Component } from '@angular/core';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { ListOfMessagesComponent } from './list-of-messages/list-of-messages.component';

@Component({
  selector: 'app-chat-area',
  imports: [ListOfMessagesComponent, ChatWindowComponent],
  templateUrl: './chat-area.component.html',
})
export class ChatAreaComponent {}
