import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CustomInputComponent } from '../../shared/components/custom-input/custom-input.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'app-new-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CustomInputComponent,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './new-account.component.html',
  styleUrl: './new-account.component.scss'
})

export class NewAccountComponent {
  form!: FormGroup;

  loadingCep = false;
  loadingCnpj = false;

  constructor(private fb: FormBuilder, private router: Router, private utilService: UtilService) {
    this.form = this.fb.group(
      {
        name: ['', Validators.required],
        cnpj: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        address: ['', Validators.required],
        neighborhood: ['', Validators.required],
        zipcode: ['', Validators.required],
        phone: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: [this.passwordMatchValidator] }
    );
  }

  getControl(name: string): FormControl {
    return this.form.get(name) as FormControl;
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPasswordControl = group.get('confirmPassword');
  
    if (!confirmPasswordControl) return null;
  
    if (password !== confirmPasswordControl.value) {
      confirmPasswordControl.setErrors({ passwordsMismatch: true });
      return { passwordsMismatch: true };
    } else {
      // Se o erro atual for apenas `passwordsMismatch`, limpa o erro
      if (confirmPasswordControl.hasError('passwordsMismatch')) {
        confirmPasswordControl.setErrors(null);
      }
      return null;
    }
  }
  

  buscarCep() {
    const cep = this.getControl('zipcode').value;
    if (cep) {
      this.loadingCep = true;
      this.utilService.consultarCep(cep).subscribe(data => {
        this.form.patchValue({
          address: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.estado || ''
        });
        this.loadingCep = false;
      }, () => this.loadingCep = false); // em caso de erro
    }
  }

  buscarCnpj() {
    const cnpj = this.getControl('cnpj').value;
    if (cnpj) {
      this.loadingCnpj = true;
      this.utilService.consultarCnpj(cnpj).subscribe(data => {
        this.form.patchValue({
          name: data.nome || '',
          email: data.email || '',
          phone: data.telefone || '',
          address: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.municipio || '',
          state: data.uf || '',
          zipcode: data.cep || ''
        });
        this.loadingCnpj = false;
      }, () => this.loadingCnpj = false);
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formData = this.form.value;
      console.log('Criando conta com os dados:', formData);
      //this.router.navigate(['/login']);
    } else {
      this.form.markAllAsTouched();
    }
  }

  voltar(): void {
    this.router.navigate(['/login']);
  }

  finalizarLoading() {
    // Resetar flags do input
    const cepControl = this.getControl('zipcode');
    const cnpjControl = this.getControl('cnpj');

    // Acione algo via ViewChild ou Output se desejar
  }

  get showPasswordMismatchError(): boolean {
    return this.form.hasError('passwordsMismatch') && this.getControl('confirmPassword').touched;
  }

}
