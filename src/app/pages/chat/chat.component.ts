import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { DynamicButtonComponent } from '../../shared/components/action-button/action-button.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [MatCardModule, MatTableModule, CommonModule, DynamicButtonComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  isOnline = false;
  operator = { name: 'willtunner', img: 'https://i.pravatar.cc/100' };
  waitingList = [
    { name: 'Alfredo', sector: 'FINANCEIRO', time: 'N/A' },
    { name: 'Teste', sector: 'FINANCEIRO', time: 'N/A' }
  ];
  onlineOperators = [
    { name: 'willtunner', sector: '...', atendimentos: 2 },
    { name: 'Guilherme', sector: '...', atendimentos: 0 }
  ];
  activeChats = ['Teste', 'Alfredo'];

  onLogin() { }
}
