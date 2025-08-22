import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicButtonComponent } from '../../../../shared/components/action-button/action-button.component';
import { CustomInputComponent } from '../../../../shared/components/custom-input/custom-input.component';
import { Company, User } from '../../../../models/models';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CompanyService } from '../../../../services/company.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClientService } from '../../../../services/client.service';
import { emailExistsValidator } from '../../../../services/email-exists.validator';
import { EmailValidationService } from '../../../../services/email-validation.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-create-cliente-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicButtonComponent,
    CustomInputComponent,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './create-cliente-modal.component.html',
  styleUrl: './create-cliente-modal.component.scss'
})
export class CreateClienteModalComponent {
  clientForm: FormGroup;
  loading = false;
  showPassword = false;
  formSubmitted = false;
  companyName: string = '';

  constructor(
    public dialogRef: MatDialogRef<CreateClienteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      client?: User, 
      companyId?: string,
      companyName?: string 
    },
    private fb: FormBuilder,
    private companyService: CompanyService,
    private clientService: ClientService,
    private emailValidator: EmailValidationService
  ) {
    this.clientForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email], [emailExistsValidator(this.emailValidator, ['helpCompanies', 'users', 'clients'])]],
      password: ['', data?.client ? [] : [Validators.required, Validators.minLength(6)]],
      connection: [''],
      companyId: [this.data.companyId || ''],
      roles: [['CLIENT']]
    });
  
    // Carrega o nome da empresa se apenas o ID foi fornecido
    if (data.companyId && !data.companyName) {
      this.loadCompanyName(data.companyId);
    } else if (data.companyName) {
      this.companyName = data.companyName;
    }
  }
  

  ngOnInit(): void {
    if (this.data?.client) {
      const { password, ...clientData } = this.data.client;
      this.clientForm.patchValue(clientData);
      this.clientForm.get('password')?.clearValidators();
      this.clientForm.get('password')?.updateValueAndValidity();
    }
  }

  private async loadCompanyName(companyId: string): Promise<void> {
    try {
      const company = await this.companyService.getCompanyById(companyId);
      this.companyName = company?.name || 'Empresa desconhecida';
    } catch (error) {
      console.error('Erro ao carregar nome da empresa:', error);
      this.companyName = 'Empresa desconhecida';
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  async onSave(): Promise<void> {
    this.formSubmitted = true;
    this.clientForm.updateValueAndValidity({ emitEvent: true });
  
    // Aguarda os validadores assíncronos finalizarem
    await Promise.resolve();
  
    console.group('💡 Debug Form');
    Object.keys(this.clientForm.controls).forEach(key => {
      const control = this.clientForm.get(key);
      if (control) {
        console.log(`Control: ${key}`);
        console.log('  Status:', control.status);
        console.log('  Value:', control.value);
        console.log('  Valid:', control.valid);
        console.log('  Errors:', control.errors);
      }
    });
    console.log('Form Status:', this.clientForm.status);
    console.groupEnd();
  
    if (this.clientForm.valid) {
      this.loading = true;
      try {
        const formValue = this.clientForm.value;
  
        const savedClient: User = await this.clientService.createClient({
          ...formValue,
          created: new Date(),
          roles: ['CLIENT'],
        });
  
        this.dialogRef.close(savedClient);
      } catch (error) {
        console.error('Erro ao salvar cliente:', error);
      } finally {
        this.loading = false;
      }
    } else {
      console.warn('Form inválido, veja o log acima para detalhes.');
    }
  }
  
  
  
  

  private addRequiredValidators(): void {
    const requiredFields = ['username', 'name', 'phone', 'email'];
    
    if (!this.data?.client) {
      requiredFields.push('password');
    }

    requiredFields.forEach(field => {
      const control = this.clientForm.get(field);
      if (control) {
        control.setValidators([Validators.required, ...(control.validator ? [control.validator] : [])]);
        control.updateValueAndValidity();
      }
    });
  }

  private markAllAsTouched(): void {
    Object.values(this.clientForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    const passwordField = this.clientForm.get('password');
    if (passwordField) {
      passwordField.setValue(passwordField.value);
    }
  }

  // Método para verificar se deve mostrar erro (só após submit)
  shouldShowError(controlName: string): boolean {
    const control = this.clientForm.get(controlName);
    return !!control && control.invalid && (control.touched || this.formSubmitted);
  }

  getInvalidControls(): { [key: string]: any } {
    const invalid: { [key: string]: any } = {};
    Object.keys(this.clientForm.controls).forEach(key => {
      const control = this.clientForm.get(key);
      if (control && control.invalid) {
        invalid[key] = control.errors;
      }
    });
    return invalid;
  }
  
}