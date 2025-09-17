import { CommonModule } from '@angular/common';
import { Component, Input, computed, effect } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { ChatService } from '../../../services/chat-service.service';

@Component({
    selector: 'app-operators-online',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatTableModule],
    templateUrl: './operators-online.component.html',
    styleUrl: './operators-online.component.scss'
})
export class OperatorsOnlineComponent {

  // ✅ Opção 1: receber a lista de fora
  @Input() data: any[] | null = null;

  // ✅ Opção 2: consumir direto do service
  operators = computed(() => this.chatService.operators());

  displayedColumns: string[] = ['name', 'sector', 'atendimentos'];

  constructor(private chatService: ChatService) {
    effect(() => {
      console.log('📌 Operators atualizados:', this.operators());
    });
  }
}
