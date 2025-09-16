import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HelpDeskCompany, User } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { HelpCompanyService } from '../../services/help-company.service';
import { SendNotificationService } from '../../services/send-notification.service';
import { NotificationType } from '../../enums/notificationType.enum';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DynamicTableComponent } from '../../shared/components/dynamic-table/dynamic-table.component';
import { MatDialog } from '@angular/material/dialog';
import { AddOperatorDialogComponent } from './add-operator-dialog/add-operator-dialog.component';

@Component({
    selector: 'app-profile-settings',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatCardModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        DynamicTableComponent
    ],
    templateUrl: './profile-settings.component.html',
    styleUrl: './profile-settings.component.scss'
})
export class ProfileSettingsComponent implements OnInit {
  userForm!: FormGroup;
  companyForm!: FormGroup;
  user!: User;
  userHelpDeskCompany: User[] = [];
  helpCompany!: HelpDeskCompany | null;
  isLoading = true;
  userLoading = false;
  companyLoading = false;
  hasHelpCompany = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private helpCompanyService: HelpCompanyService,
    private messageService: SendNotificationService,
    private dialog: MatDialog

  ) {}

  headers = [
    { key: 'name', label: 'table.name' },
    { key: 'email', label: 'table.email' },
    { key: 'isLoggedIn', label: 'table.isLoggedIn' },
    { key: 'created', label: 'table.created' },
    { key: 'phone', label: 'table.phone' },
    { key: 'connection', label: 'table.connection' }
  ];

  async ngOnInit() {
    await this.loadUserData();
    this.initForms();
    this.isLoading = false;
  }

  private async loadUserData() {
    try {
      const session = this.authService.currentUser();
      if (!session) {
        this.messageService.customNotification(NotificationType.ERROR, 'Sessão inválida');
        return;
      }

      // Busca usuário com a empresa vinculada
      const user = await this.userService.getUserWithHelpDeskCompany(session.id);
      if (user) {
        console.log('Usuário carregado:', user);
        this.user = user;
        this.userHelpDeskCompany = await this.userService.getUsersByHelpDeskCompanyIdOrdered(this.user.helpDeskCompanyId!);

        console.log('Usuários da empresa:', this.userHelpDeskCompany);
        
        // Busca dados da empresa se existir helpDeskCompanyId
        if (this.user.helpDeskCompanyId) {
          this.helpCompany = await this.helpCompanyService.getHelpCompanyById(this.user.helpDeskCompanyId);
          this.hasHelpCompany = !!this.helpCompany;
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados do usuário:', err);
      this.messageService.customNotification(NotificationType.ERROR, 'Erro ao carregar dados do perfil');
    }
  }

  private initForms() {
    // Formulário do usuário
    this.userForm = this.fb.group({
      name: [this.user?.name || '', Validators.required],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      phone: [this.user?.phone || '', Validators.required],
      username: [this.user?.username || '', Validators.required],
      password: ['', [Validators.minLength(6)]],
      confirmPassword: [''],
      imageUrl: [this.user?.imageUrl || '']
    }, { validators: this.passwordMatchValidator() });

    // Formulário da empresa (apenas se existir)
    if (this.hasHelpCompany) {
      this.companyForm = this.fb.group({
        name: [this.helpCompany?.name || '', Validators.required],
        cnpj: [this.helpCompany?.cnpj || '', Validators.required],
        city: [this.helpCompany?.city || '', Validators.required],
        state: [this.helpCompany?.state || '', Validators.required],
        address: [this.helpCompany?.address || '', Validators.required],
        neighborhood: [this.helpCompany?.neighborhood || '', Validators.required],
        zipcode: [this.helpCompany?.zipcode || '', Validators.required],
        phone: [this.helpCompany?.phone || '', Validators.required],
        email: [this.helpCompany?.email || '', [Validators.required, Validators.email]]
      });
    }

    // Atualiza a validação do confirmPassword quando a senha muda
    this.userForm.get('password')?.valueChanges.subscribe(() => {
      this.userForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  async saveUser() {
    try {
      if (this.userForm.invalid) {
        this.markFormGroupTouched(this.userForm);
        
        if (this.userForm.hasError('passwordMismatch')) {
          this.messageService.customNotification(NotificationType.ERROR, 'As senhas não coincidem');
        } else {
          this.messageService.customNotification(NotificationType.ERROR, 'Preencha todos os campos obrigatórios');
        }
        return;
      }

      const password = this.userForm.value.password;
      const confirmPassword = this.userForm.value.confirmPassword;
      
      if (password && password !== confirmPassword) {
        this.messageService.customNotification(NotificationType.ERROR, 'As senhas não coincidem');
        return;
      }

      this.userLoading = true;

      // Preparar dados do usuário
      const userData: Partial<User> = {
        name: this.userForm.value.name,
        email: this.userForm.value.email,
        phone: this.userForm.value.phone,
        username: this.userForm.value.username,
        updated: new Date()
      };

      // Apenas atualiza a senha se foi informada e válida
      if (password && password.length >= 6) {
        userData.password = password;
      }

      // Apenas atualiza a imagem se foi alterada
      if (this.userForm.value.imageUrl !== this.user?.imageUrl) {
        userData.imageUrl = this.userForm.value.imageUrl;
      }

      // Atualizar usuário
      await this.userService.updateUser(this.user.id, userData);

      this.messageService.customNotification(NotificationType.SUCCESS, 'Dados pessoais atualizados com sucesso!');
      
      // Recarrega os dados do usuário
      await this.loadUserData();
      
      // Reseta os campos de senha após salvar
      this.userForm.patchValue({
        password: '',
        confirmPassword: ''
      });

    } catch (err) {
      console.error('Erro ao atualizar dados do usuário:', err);
      this.messageService.customNotification(NotificationType.ERROR, 'Erro ao atualizar dados pessoais');
    } finally {
      this.userLoading = false;
    }
  }

  async saveCompany() {
    try {
      if (!this.hasHelpCompany || !this.helpCompany || this.companyForm.invalid) {
        this.markFormGroupTouched(this.companyForm);
        this.messageService.customNotification(NotificationType.ERROR, 'Preencha todos os campos obrigatórios');
        return;
      }

      this.companyLoading = true;

      const companyData: Partial<HelpDeskCompany> = {
        name: this.companyForm.value.name,
        cnpj: this.companyForm.value.cnpj,
        city: this.companyForm.value.city,
        state: this.companyForm.value.state,
        address: this.companyForm.value.address,
        neighborhood: this.companyForm.value.neighborhood,
        zipcode: this.companyForm.value.zipcode,
        phone: this.companyForm.value.phone,
        email: this.companyForm.value.email,
        updated: new Date()
      };

      await this.helpCompanyService.updateHelpCompany(this.helpCompany.id, companyData);

      this.messageService.customNotification(NotificationType.SUCCESS, 'Dados da empresa atualizados com sucesso!');
      
      // Recarrega os dados da empresa
      await this.loadUserData();

    } catch (err) {
      console.error('Erro ao atualizar dados da empresa:', err);
      this.messageService.customNotification(NotificationType.ERROR, 'Erro ao atualizar dados da empresa');
    } finally {
      this.companyLoading = false;
    }
  }

  resetUserForm() {
    this.userForm.reset({
      name: this.user?.name || '',
      email: this.user?.email || '',
      phone: this.user?.phone || '',
      username: this.user?.username || '',
      password: '',
      confirmPassword: '',
      imageUrl: this.user?.imageUrl || ''
    });
  }

  resetCompanyForm() {
    if (this.hasHelpCompany && this.companyForm) {
      this.companyForm.reset({
        name: this.helpCompany?.name || '',
        cnpj: this.helpCompany?.cnpj || '',
        city: this.helpCompany?.city || '',
        state: this.helpCompany?.state || '',
        address: this.helpCompany?.address || '',
        neighborhood: this.helpCompany?.neighborhood || '',
        zipcode: this.helpCompany?.zipcode || '',
        phone: this.helpCompany?.phone || '',
        email: this.helpCompany?.email || ''
      });
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userForm.patchValue({
          imageUrl: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password');
      const confirmPassword = control.get('confirmPassword');
  
      if (!password || !confirmPassword) {
        return null;
      }
  
      return password.value === confirmPassword.value ? null : { passwordMismatch: true };
    };
  }

  updateDocument(index: any) {}
  deleteDocument(index: any) {}

  openAddOperatorModal(): void {
    const dialogRef = this.dialog.open(AddOperatorDialogComponent, {
      width: '500px',
      data:  this.user.helpDeskCompanyId 
    });

    dialogRef.afterClosed().subscribe(async (result: Partial<User>) => {
      if (result) {
        try {
          const savedUser = await this.userService.saveOperator(result);
          console.log('Novo operador salvo:', savedUser);
  
          // Atualiza a lista de operadores
          this.userHelpDeskCompany = await this.userService.getUsersByHelpDeskCompanyIdOrdered(this.user.helpDeskCompanyId!);
  
        } catch (err) {
          console.error('Erro ao salvar operador:', err);
        }
      }
    });
  }

}