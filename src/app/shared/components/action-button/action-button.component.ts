import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

type ButtonType = 'save' | 'edit' | 'delete' | 'clear' | 'print' | 'find' | 'add' | 'pdf' | 'cancel';

@Component({
  selector: 'app-dynamic-button',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './action-button.component.html',
  styleUrls: ['./action-button.component.scss']
})
export class DynamicButtonComponent {
  @Input() type: ButtonType = 'save';
  @Input() success: boolean = false;
  @Input() label?: string;
  @Input() disabled: boolean = false;

  @Output() clicked = new EventEmitter<void>();

  emit() {
    if (!this.disabled) this.clicked.emit();
  }

  get config() {
    const map: Record<ButtonType, { label: string; icon: string; cssClass: string }> = {
      save:   { label: 'SALVAR',    icon: 'save',             cssClass: 'save' },
      edit:   { label: 'EDITAR',    icon: 'edit',             cssClass: 'edit' },
      delete: { label: 'EXCLUIR',   icon: 'delete_forever',   cssClass: 'delete' },
      clear:  { label: 'LIMPAR',    icon: 'clear',            cssClass: 'clear' },
      print:  { label: 'IMPRIMIR',  icon: 'print',            cssClass: 'print' },
      add:    { label: 'CADASTRAR', icon: 'add_ad',           cssClass: 'add' },
      find:   { label: 'BUSCAR',    icon: 'search',           cssClass: 'find' },
      pdf:    { label: 'PDF',       icon: 'picture_as_pdf',   cssClass: 'pdf' },
      cancel: { label: 'CANCELAR',  icon: 'cancel',           cssClass: 'cancel' }, 
    };

    return map[this.type] ?? map['save'];
  }

  get computedLabel() {
    return this.label || this.config.label;
  }

  get cssClass() {
    return `button ${this.config.cssClass} ${this.success ? 'success' : ''}`;
  }

  get iconName() {
    return this.config.icon;
  }
}
