import { Component, forwardRef, Signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomInputComponent } from '../../shared/components/custom-input/custom-input.component';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { DynamicTableComponent } from '../../shared/components/dynamic-table/dynamic-table.component';
import { DynamicButtonComponent } from '../../shared/components/action-button/action-button.component';
import { MatIconModule } from '@angular/material/icon';
import { DynamicThreeToggleComponent } from '../../shared/components/dynamic-three-toggle/dynamic-three-toggle.component';
import { RichTextEditorComponent } from '../../shared/components/rich-text/rich-text.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomInputComponent, MatButtonModule,
    DynamicTableComponent, DynamicButtonComponent, MatIconModule, DynamicThreeToggleComponent,
    RichTextEditorComponent, MatInputModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true
    }
  ]
})

export class HomeComponent {
  form: FormGroup;
  form2: FormGroup;
  saveSuccess = false;
  deleteSuccess = false;
  user: any = null;

  // Estados de sucesso para os botões
  isSaveOrEditSuccess = false;
  isDeleteSuccess = false;
  isClearSuccess = false;
  isPrintSuccess = false;
  theme!: Signal<'dark' | 'light'>;

  selectedToggle = 'mes';

  toggleOptions = {
    btn1: { label: 'Mês', value: 'mes' },
    btn2: { label: 'Semestre', value: 'semestre' },
    btn3: { label: 'Ano Atual', value: 'ano' }
  };

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router,
    private themeService: ThemeService) {
    this.theme = this.themeService.getTheme();

    const session = this.auth.currentUser();
    if (session) {
      this.user = session;
      console.log('Sessão carregada:', this.user);
    }

    this.form = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      cpf: ['', [Validators.required]],
      cep: ['', [Validators.required]],
      cnpj: ['', [Validators.required]],
      descricao: ['']
    });

    this.form2 = this.fb.group({
      title: ['', Validators.required],
      content: ['<p>Conteúdo inicial</p>', Validators.required],
      description: ['', Validators.required]
    });
  }

  onToggleChanged(value: string) {
    console.log('Selecionado:', value);
    // Chame a função apropriada
    if (value === 'mes') this.handleMes();
    else if (value === 'semestre') this.handleSemestre();
    else if (value === 'ano') this.handleAno();
  }

  handleMes() {
    console.log('🔁 Mês selecionado');
  }

  handleSemestre() {
    console.log('🔁 Semestre selecionado');
  }

  handleAno() {
    console.log('🔁 Ano selecionado');
  }



  getControl(controlName: string): FormControl {
    return this.form.get(controlName) as FormControl;
  }
  
  submit() {
    if (this.form.valid) {
      console.log('Formulário enviado:', this.form.value);
      // Mostrar o conteúdo HTML no console
      console.log('Conteúdo da descrição (HTML):', this.form.get('descricao')?.value);
      console.log('Termos aceitos (HTML):', this.form.get('termos')?.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  onSubmit() {
    if (this.form.valid) {
      console.log('Formulário enviado:', this.form.value);
      // O conteúdo HTML estará em this.form.value.content
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  headers = [
    { key: 'data', label: 'Data de Criação' },
    { key: 'nome', label: 'Nome' },
    { key: 'cnpj', label: 'CNPJ' },
    { key: 'cidade', label: 'Cidade' },
    { key: 'estado', label: 'Estado' },
    { key: 'telefone', label: 'Telefone' },
    { key: 'email', label: 'Email' },
    { key: 'versao', label: 'Versão do Sistema' }
  ];

  dados = [
    {
      data: '23/04/2025 10:06',
      nome: 'Auto Posto Modelo',
      cnpj: '53.540.348/0001-38',
      cidade: 'BOTUCATU',
      estado: 'SP',
      telefone: '(14) 3354-9003',
      email: 'admpostodantop@gmail.com',
      versao: '206'
    },
    {
      data: '23/04/2025 10:08',
      nome: 'Connect',
      cnpj: '',
      cidade: 'SP',
      estado: 'SP',
      telefone: '',
      email: '',
      versao: '206'
    },
    {
      data: '23/04/2025 10:10',
      nome: 'Contrumaker',
      cnpj: '3123',
      cidade: '123123',
      estado: '123',
      telefone: '1231',
      email: '123123@reer.com',
      versao: '103'
    },
    {
      data: '23/04/2025 10:01',
      nome: 'Gadernall',
      cnpj: '47.614.052/0001-11',
      cidade: 'Santa Maria da Serra',
      estado: 'SP',
      telefone: '',
      email: '',
      versao: '404'
    },
    {
      data: '23/04/2025 10:01',
      nome: 'Gadernall',
      cnpj: '47.614.052/0001-11',
      cidade: 'Santa Maria da Serra',
      estado: 'SP',
      telefone: '',
      email: '',
      versao: '404'
    },
    {
      data: '23/04/2025 10:01',
      nome: 'Gadernall',
      cnpj: '47.614.052/0001-11',
      cidade: 'Santa Maria da Serra',
      estado: 'SP',
      telefone: '',
      email: '',
      versao: '404'
    },
    {
      data: '23/04/2025 10:01',
      nome: 'Gadernall',
      cnpj: '47.614.052/0001-11',
      cidade: 'Santa Maria da Serra',
      estado: 'SP',
      telefone: '',
      email: '',
      versao: '404'
    },
    {
      data: '23/04/2025 10:01',
      nome: 'Gadernall',
      cnpj: '47.614.052/0001-11',
      cidade: 'Santa Maria da Serra',
      estado: 'SP',
      telefone: '',
      email: '',
      versao: '404'
    }
  ];

  onSave() {
    console.log('Salvar clicado');
    this.saveSuccess = true;
    setTimeout(() => this.saveSuccess = false, 2000);
  }

  onEdit() {
    console.log('Editar clicado');
  }

  onDelete() {
    console.log('Deletar clicado');
    this.deleteSuccess = true;
    setTimeout(() => this.deleteSuccess = false, 2000);
  }

  onCancel() {
    console.log('Cancelar clicado');
  }

  onPrint() {
    console.log('Imprimir clicado');
  }

  onPDF() {
    console.log('PDF clicado');
  }

  handleSaveOrEdit(event: Event): void {

  }

  handleDelete(event: Event): void {

  }

  handleClear(event: Event): void {

  }

  handlePrint(event: Event) { }

  onClear() { }
  deleteCall() { }
  onFind() { }

  handleToggle(value: string) {
    console.log('Selecionado:', value);
    this.selectedToggle = value;

    if (value === 'mes') this.handleMes();
    else if (value === 'semestre') this.handleSemestre();
    else this.handleAno();
  }


}

