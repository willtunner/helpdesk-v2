import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DynamicButtonComponent } from '../../../shared/components/action-button/action-button.component';
import { CustomInputComponent } from '../../../shared/components/custom-input/custom-input.component';
import { Company, User } from '../../../models/models';
import { CompanyService } from '../../../services/company.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { UtilService } from '../../../services/util.service';

@Component({
  selector: 'app-company-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicButtonComponent,
    CustomInputComponent
  ],
  templateUrl: './company-modal.component.html',
  styleUrls: ['./company-modal.component.scss']
})
export class CompanyModalComponent implements OnInit {
  companyForm: FormGroup;
  loading = false;
  user!: User;
  loadingCep = false;
  loadingCnpj = false;

  constructor(
    public dialogRef: MatDialogRef<CompanyModalComponent>,
    private fb: FormBuilder,
    private companyService: CompanyService,
    private snackBar: MatSnackBar,
    private auth: AuthService,
    private utilService: UtilService
  ) {
    const session = this.auth.currentUser();
    if (session) {
      this.user = session;
    }


    this.companyForm = this.fb.group({
      cnpj: ['', [Validators.required]],
      name: ['', [Validators.required]],
      zipcode: ['', [Validators.required]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      connectionServ: [''],
      versionServ: ['']
    });
  }

  ngOnInit(): void {
    
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  // No CompanyModalComponent
async onSave(): Promise<void> {
  if (this.companyForm.valid) {
    this.loading = true;
    
    try {
      const formData = this.companyForm.value;
      
      // Adiciona campos necessários
      const companyData: Partial<Company> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        cnpj: formData.cnpj,
        zipcode: formData.zipcode,
        city: formData.city,
        state: formData.state,
        address: formData.address,
        helpDeskCompanyId: this.user.helpDeskCompanyId,
        versionServ: formData.versionServ,
        connectionServ: formData.connectionServ,
        keywords: this.utilService.generateKeywordsFromName(formData.name),
      };

      const savedCompany = await this.companyService.createCompany(companyData);
      
      this.loading = false;
      this.dialogRef.close(savedCompany);
      
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      this.loading = false;
      // Mostrar mensagem de erro para o usuário
      this.snackBar.open('Erro ao salvar empresa', 'Fechar', {
        duration: 3000,
      });
    }
  } else {
    // Marca todos os campos como touched para mostrar erros de validação
    this.companyForm.markAllAsTouched();
  }
}

  searchCep(): void {
    // Implementar busca de CEP aqui
    console.log('Buscando CEP...');
  }

  searchCnpj(): void {
    const cnpj = this.getControl('cnpj').value;
    if (cnpj) {
      this.loadingCnpj = true;
      this.utilService.consultarCnpj(cnpj).subscribe(data => {
        this.companyForm.patchValue({
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

  getControl(name: string): FormControl {
      return this.companyForm.get(name) as FormControl;
    }
}