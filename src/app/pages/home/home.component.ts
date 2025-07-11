import { Component, forwardRef, OnInit, Signal } from '@angular/core';
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
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { cnpjValidator, cpfValidator } from '../../shared/validators/validators';
import { ChartComponent } from '../../shared/components/line-chart/line-chart.component';
import { ChartType } from '../../enums/chart-types.enum';
import { PieChartComponent } from '../../shared/components/pie-chart/pie-chart.component';
import { DropdownVideosComponent } from '../../shared/components/dropdown-videos/dropdown-videos.component';
import { DropDownVideos } from '../../models/models';
import { Observable } from 'rxjs';
import { VideoService } from '../../services/videoService.service';
import { MtbDevComponent } from '../../shared/components/mtb-dev/mtb-dev.component';
import { NumberCounterComponent } from '../../shared/components/number-counter/number-counter.component';
import { UserService } from '../../services/user.service';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomInputComponent, MatButtonModule,
    DynamicTableComponent, DynamicButtonComponent, MatIconModule, DynamicThreeToggleComponent,
    RichTextEditorComponent, MatInputModule, ChartComponent, NumberCounterComponent,
    PieChartComponent, DropdownVideosComponent, MtbDevComponent
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

export class HomeComponent implements OnInit {
  form: FormGroup;
  form2: FormGroup;
  saveSuccess = false;
  deleteSuccess = false;
  user: any = null;
  ChartType = ChartType;
  

  // Usado para o ChartComponent
  chamadosMock = [
    { id: "1", data: "07/02/2025", companyId: "1", companyName: "GreenCode" },
    { id: "2", data: "06/07/2025", companyId: "1", companyName: "GreenCode" },
    { id: "3", data: "06/01/2025", companyId: "2", companyName: "Allyenados" },
    { id: "4", data: "04/01/2025", companyId: "2", companyName: "Allyenados" },
    { id: "5", data: "04/01/2025", companyId: "2", companyName: "Allyenados" },
    { id: "6", data: "04/01/2025", companyId: "2", companyName: "Allyenados" },
    { id: "7", data: "04/07/2025", companyId: "2", companyName: "Allyenados" },
    { id: "8", data: "04/07/2025", companyId: "2", companyName: "Allyenados" },
    { id: "9", data: "04/07/2025", companyId: "2", companyName: "Allyenados" },
    { id: "10", data: "01/01/2025", companyId: "3", companyName: "Pollution" },
    { id: "11", data: "01/02/2025", companyId: "3", companyName: "Pollution" },
    { id: "12", data: "01/07/2025", companyId: "3", companyName: "Pollution" },
    { id: "13", data: "01/06/2025", companyId: "3", companyName: "Pollution" },
    { id: "14", data: "12/01/2023", companyId: "1", companyName: "GreenCode" },
    { id: "15", data: "03/03/2023", companyId: "2", companyName: "Allyenados" },
    { id: "16", data: "10/10/2023", companyId: "1", companyName: "GreenCode" },
    { id: "17", data: "12/04/2025", companyId: "1", companyName: "GreenCode" },
    { id: "18", data: "12/02/2025", companyId: "1", companyName: "GreenCode" },
    { id: "19", data: "20/05/2025", companyId: "3", companyName: "Pollution" },
    { id: "20", data: "03/03/2025", companyId: "4", companyName: "Doom" },
    { id: "21", data: "10/10/2025", companyId: "4", companyName: "Doom" },
    { id: "22", data: "12/04/2023", companyId: "4", companyName: "Doom" },
    { id: "23", data: "12/02/2024", companyId: "4", companyName: "Doom" },
    { id: "24", data: "20/05/2024", companyId: "4", companyName: "Doom" },
  ];

  // Estados de sucesso para os botões
  isSaveOrEditSuccess = false;
  isDeleteSuccess = false;
  isClearSuccess = false;
  isPrintSuccess = false;
  theme!: Signal<'dark' | 'light'>;
  videos$!: Observable<DropDownVideos[]>;

  selectedToggle = 'mes';

  toggleOptions = {
    btn1: { label: 'Mês', value: 'mes' },
    btn2: { label: 'Semestre', value: 'semestre' },
    btn3: { label: 'Ano Atual', value: 'ano' }
  };

  constructor(
    private fb: FormBuilder, 
    private auth: AuthService, 
    private router: Router,
    private themeService: ThemeService,
    private videoTutorialService: VideoService,
    private userService: UserService,
  ) {
    this.theme = this.themeService.getTheme();

    const session = this.auth.currentUser();
    if (session) {
      this.user = session;
      console.log('Sessão carregada:', this.user);
    }

    this.form = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required]],
      cpf: ['', [Validators.required, cpfValidator()]],
      cep: ['', [Validators.required]],
      cnpj: ['', [Validators.required, cnpjValidator()]],
      startDate: ['', Validators.required],
      finalDate: ['', Validators.required],
      descricao: ['']
    });

    this.form2 = this.fb.group({
      title: ['', Validators.required],
      content: ['<p>Conteúdo inicial</p>', Validators.required],
      description: ['', Validators.required]
    });

    
  }


  ngOnInit(): void {
    this.loadVideoTutorials();

    // const user1: User = { ..., roles: ['admin', 'client'] };
    console.log(this.userService.getEffectiveUserRole(this.user)); // admin
  }

  loadVideoTutorials(): void {
    this.videoTutorialService.getSectionVideos().subscribe(videos => {
      console.log('Vídeos carregados:', videos);
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

