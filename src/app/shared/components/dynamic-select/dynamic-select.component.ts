import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
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
  @Input() formControl!: FormControl;
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

  // client | company | sector
  @Input() type: 'client' | 'company' | 'sector' = 'client';

  getSizeClass(): string {
    switch (this.size) {
      case 'sm': return 'size-sm';
      case 'lg': return 'size-lg';
      default: return 'size-md';
    }
  }

  getButtonColor(): 'primary' | 'warn' {
    return this.model ? 'warn' : 'primary';
  }

  getButtonIcon(): string {
    return this.model ? 'deselect' : 'open_in_new';
  }

  onSelectionChange(value: any) {
    this.model = value;
    this.modelChange.emit(value);
    this.onChange.emit(value);
    this.onChangeFn(value); // importante!
  }

  handleButtonClick() {
    if (this.model) {
      this.model = null;
      this.modelChange.emit(null);
    } else {
      this.openModal.emit();
    }
  }

  onChangeFn: any = () => { };
  onTouchedFn: any = () => { };

  writeValue(value: any): void {
    this.model = value;
    this.onChangeFn(value); // <== importante para notificar Angular
  }

  get isRequired(): boolean {
    return this.formControl?.hasValidator?.(Validators.required) ?? false;
  }

  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedFn = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }


  /*
    1. Setores (sem botão)
html
Copiar
Editar
<app-dynamic-select
  [label]="'Setor'"
  [options]="sectors"
  [valueKey]="'id'"
  [labelKey]="'nome'"
  [(model)]="selectedSector"
  [type]="'sector'">
</app-dynamic-select>
ts
Copiar
Editar
sectors = [
  { id: 'fin', nome: 'Financeiro' },
  { id: 'tec', nome: 'Tecnologia' },
  { id: 'com', nome: 'Comercial' },
];
2. Clientes
html
Copiar
Editar
<app-dynamic-select
  [label]="'Cliente'"
  [options]="clients"
  [valueKey]="'id'"
  [labelKey]="'nome'"
  [(model)]="selectedClient"
  [type]="'client'"
  (openModal)="abrirModalCliente()">
</app-dynamic-select>
ts
Copiar
Editar
clients = [
  { id: 1, nome: 'João Silva' },
  { id: 2, nome: 'Maria Souza' }
];
3. Empresas
html
Copiar
Editar
<app-dynamic-select
  [label]="'Empresa'"
  [options]="companies"
  [valueKey]="'id'"
  [labelKey]="'nome'"
  [(model)]="selectedCompany"
  [type]="'company'"
  (openModal)="abrirModalEmpresa()">
</app-dynamic-select>
ts
Copiar
Editar
companies = [
  { id: 100, nome: 'Tech Solutions' },
  { id: 101, nome: 'Build Inc.' }
];
  */
}
