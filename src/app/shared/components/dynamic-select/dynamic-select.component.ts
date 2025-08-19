import { Component, Input, Output, EventEmitter, forwardRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './dynamic-select.component.html',
  styleUrls: ['./dynamic-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectComponent),
      multi: true
    }
  ]
})
export class DynamicSelectComponent implements ControlValueAccessor {

  @Input() label = 'Selecionar';
  @Input() placeholder = '';
  @Input() model: any;
  @Input() formControl: FormControl = new FormControl();
  @Output() modelChange = new EventEmitter<any>();
  @Output() onChange = new EventEmitter<any>();
  @Output() openModal = new EventEmitter<void>();

  @Input() options: any[] = [];
  @Input() valueKey: string = 'id';
  @Input() labelKey: string = 'nome';
  @Input() disabled = false;
  @Input() errorMessage = '';
  @Input() showDefaultOption = true;
  @Input() defaultOptionLabel = 'Selecione';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showButton: boolean = true; // Controla se o botão é exibido

  constructor(private cdr: ChangeDetectorRef) {}
  
  getSizeClass(): string {
    switch (this.size) {
      case 'sm': return 'size-sm';
      case 'lg': return 'size-lg';
      default: return 'size-md';
    }
  }


  onSelectionChange(value: any) {
    this.model = value;
    this.modelChange.emit(value);
    this.onChange.emit(value);
    this.onChangeFn(value);
    this.cdr.detectChanges(); // Força a detecção de mudanças
  }


  // ControlValueAccessor implementation
  onChangeFn: (value: any) => void = () => {};
  onTouchedFn: () => void = () => {};

  writeValue(value: any): void {
    this.model = value;
  }

  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  get isRequired(): boolean {
    return this.formControl?.hasValidator(Validators.required) ?? false;
  }
}