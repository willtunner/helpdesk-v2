import { Component, EventEmitter, Input, Output, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';

type ButtonType = 'save' | 'edit' | 'delete' | 'clear' | 'print' | 
'find' | 'add' | 'pdf' | 'cancel' | 'login' | 'close' | 'logout' | 'ok';

@Component({
  selector: 'app-dynamic-button',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslateModule, MatTooltipModule],
  templateUrl: './action-button.component.html',
  styleUrls: ['./action-button.component.scss']
})
export class DynamicButtonComponent implements OnDestroy {
  @Input() type: ButtonType = 'save';
  @Input() success: boolean = false;
  @Input() label?: string;
  @Input() disabled: boolean = false;
  @Input() isLoggedIn?: boolean; 
  @Output() clicked = new EventEmitter<void>();

  hovered: boolean = false;

  private langChangeSub: Subscription;

  constructor(
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    this.langChangeSub = this.translateService.onLangChange.subscribe(() => {
      this.cdr.markForCheck();
    });
    console.log('TIPO: ',this.type)
  }

  ngOnDestroy(): void {
    this.langChangeSub.unsubscribe();
  }

  emit() {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }

  onMouseEnter() {
    this.hovered = true;
  }

  onMouseLeave() {
    this.hovered = false;
  }

  get config() {
    if (this.type === 'login') {
      const isLoggedIn = !!this.isLoggedIn;
      const isHovering = this.hovered;

      return {
        labelKey: isLoggedIn ? 'BUTTON.LOGOUT' : 'BUTTON.LOGIN',
        icon: isLoggedIn ? 'speaker_notes_off' : 'speaker_notes',
        cssClass: isLoggedIn
          ? (isHovering ? 'login' : 'logout')
          : (isHovering ? 'logout' : 'login'),
      };
    }

    const map: Record<ButtonType, { labelKey: string; icon: string; cssClass: string }> = {
      save: { labelKey: 'BUTTON.SAVE', icon: 'save', cssClass: 'save' },
      edit: { labelKey: 'BUTTON.EDIT', icon: 'edit', cssClass: 'edit' },
      delete: { labelKey: 'BUTTON.DELETE', icon: 'delete_forever', cssClass: 'delete' },
      clear: { labelKey: 'BUTTON.CLEAR', icon: 'clear', cssClass: 'clear' },
      print: { labelKey: 'BUTTON.PRINT', icon: 'print', cssClass: 'print' },
      add: { labelKey: 'BUTTON.ADD', icon: 'add', cssClass: 'add' },
      find: { labelKey: 'BUTTON.FIND', icon: 'search', cssClass: 'find' },
      pdf: { labelKey: 'BUTTON.PDF', icon: 'picture_as_pdf', cssClass: 'pdf' },
      cancel: { labelKey: 'BUTTON.CANCEL', icon: 'cancel', cssClass: 'cancel' },
      login: { labelKey: 'BUTTON.LOGIN', icon: 'login', cssClass: 'login' },
      close: { labelKey: 'FECHAR', icon: 'close', cssClass: 'close' },
      logout: { labelKey: 'BUTTON.LOGOUT', icon: 'logout', cssClass: 'logout' },
      ok: { labelKey: 'BUTTON.OK', icon: 'check_circle', cssClass: 'ok' },
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

