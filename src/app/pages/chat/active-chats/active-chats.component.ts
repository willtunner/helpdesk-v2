import { Component, Input } from '@angular/core';
import { ChatRoom } from '../../../models/models';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-active-chats',
  standalone: true,
  imports: [MatCardModule, CommonModule],
  templateUrl: './active-chats.component.html',
  styleUrl: './active-chats.component.scss'
})
export class ActiveChatsComponent {
  @Input() activeChats: ChatRoom[] = [];

  constructor() {
    
  }
}
