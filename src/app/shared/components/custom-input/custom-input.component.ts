import { Component, EventEmitter, Input, OnInit, Output  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-custom-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgxMaskDirective,
    NgxMaskPipe,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss']
})
export class CustomInputComponent implements OnInit {
  @Input() label = '';
  @Input() control!: FormControl;
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() cssClass: string = '';
  @Input() size: 'pequeno' | 'medio' | 'grande' | 'full-width' = 'medio';

  @Output() onSearch = new EventEmitter<void>();

  mask: string | null = null;
  inputType = 'text';
  isSearchable = false;
  @Input() loading: boolean = false;
  @Input() customError: string | null = null;

  ngOnInit() {
    if (!this.control || !(this.control instanceof FormControl)) {
      throw new Error('O parâmetro "control" deve ser uma instância de FormControl.');
    }

    // Define máscara e tipo de input com base no "type"
    switch (this.type) {
      case 'telefone':
        this.mask = '(00) 00000-0000';
        this.placeholder = this.placeholder || '(00) 00000-0000';
        this.inputType = 'text';
        break;
      case 'cep':
        this.mask = '00000-000';
        this.placeholder = this.placeholder || '00000-000';
        this.inputType = 'text';
        this.isSearchable = true;
        break;
      case 'cpf':
        this.mask = '000.000.000-00';
        this.placeholder = this.placeholder || '000.000.000-00';
        this.inputType = 'text';
        break;
      case 'cnpj':
        this.mask = '00.000.000/0000-00';
        this.placeholder = this.placeholder || '00.000.000/0000-00';
        this.inputType = 'text';
        this.isSearchable = true;
        break;
      default:
        this.inputType = this.type;
        this.mask = null;
        break;
    }
  }

  getSizeClass(): string {
    switch (this.size) {
      case 'pequeno': return 'input-small';
      case 'medio': return 'input-medium';
      case 'grande': return 'input-large';
      case 'full-width': return 'input-full';
      default: return '';
    }
  }

  search() {
    this.loading = true;
    this.onSearch.emit();
  }

  get showError(): boolean {
    return this.control && this.control.invalid && this.control.touched;
  }
}
