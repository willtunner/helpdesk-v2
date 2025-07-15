import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dynamic-select',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule
  ],
  templateUrl: './dynamic-select.component.html',
  styleUrls: ['./dynamic-select.component.scss'],
})
export class DynamicSelectComponent {
  @Input() label = 'Selecionar';
  @Input() placeholder = '';
  @Input() model: any;
  @Output() onChange = new EventEmitter<any>();

  @Input() options: any[] = [];
  @Input() valueKey: string = '';  // Se os dados forem objetos, ex: "id"
  @Input() labelKey: string = '';  // Se os dados forem objetos, ex: "nome"
  @Input() disabled = false;
  @Input() errorMessage = '';

  @Input() cssClass = ''; // permite passar classes externas
  @Input() showDefaultOption = true;
  @Input() defaultOptionLabel = 'Selecione';

  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  getSizeClass(): string {
    switch (this.size) {
      case 'sm': return 'size-sm';
      case 'lg': return 'size-lg';
      default: return 'size-md';
    }
  }

  /*
    Exemplo de uso:
    sectors = ['Financeiro', 'Tecnologia', 'Comercial'];
    sectors = [
      { id: 'fin', nome: 'Financeiro' },
      { id: 'tec', nome: 'Tecnologia' }
    ];
  */
}
