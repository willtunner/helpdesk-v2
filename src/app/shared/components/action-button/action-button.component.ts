import { Component, EventEmitter, Input, Output, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

type ButtonType = 'save' | 'edit' | 'delete' | 'clear' | 'print' | 'find' | 'add' | 'pdf' | 'cancel' | 'login';


@Component({
  selector: 'app-dynamic-button',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslateModule],
  templateUrl: './action-button.component.html',
  styleUrls: ['./action-button.component.scss']
})
export class DynamicButtonComponent implements OnDestroy {
  @Input() type: ButtonType = 'save';
  @Input() success: boolean = false;
  @Input() label?: string;
  @Input() disabled: boolean = false;

  @Output() clicked = new EventEmitter<void>();

  private langChangeSub: Subscription;

  constructor(
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    // Atualiza o componente quando o idioma muda
    this.langChangeSub = this.translateService.onLangChange.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.langChangeSub.unsubscribe();
  }

  emit() {
    if (!this.disabled) this.clicked.emit();
  }

  get config() {
    const map: Record<ButtonType, { labelKey: string; icon: string; cssClass: string }> = {
      save: { labelKey: 'BUTTON.SAVE', icon: 'save', cssClass: 'save' },
      edit: { labelKey: 'BUTTON.EDIT', icon: 'edit', cssClass: 'edit' },
      delete: { labelKey: 'BUTTON.DELETE', icon: 'delete_forever', cssClass: 'delete' },
      clear: { labelKey: 'BUTTON.CLEAR', icon: 'clear', cssClass: 'clear' },
      print: { labelKey: 'BUTTON.PRINT', icon: 'print', cssClass: 'print' },
      add: { labelKey: 'BUTTON.ADD', icon: 'add_ad', cssClass: 'add' },
      find: { labelKey: 'BUTTON.FIND', icon: 'search', cssClass: 'find' },
      pdf: { labelKey: 'BUTTON.PDF', icon: 'picture_as_pdf', cssClass: 'pdf' },
      cancel: { labelKey: 'BUTTON.CANCEL', icon: 'cancel', cssClass: 'cancel' },
      login: { labelKey: 'BUTTON.LOGIN', icon: 'chat', cssClass: 'login' },
    };

    return map[this.type] ?? map['save'];
  }

  get cssClass() {
    return `button ${this.config.cssClass} ${this.success ? 'success' : ''}`;
  }

  get iconName() {
    return this.config.icon;
  }
}
