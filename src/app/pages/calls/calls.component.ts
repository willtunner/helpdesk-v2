import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

// Componentes customizados
import { DynamicSelectComponent } from '../../shared/components/dynamic-select/dynamic-select.component';
import { CustomInputComponent } from '../../shared/components/custom-input/custom-input.component';
import { RichTextEditorComponent } from '../../shared/components/rich-text/rich-text.component';
import { TagsComponent } from '../../shared/components/tags/tags.component';
import { DynamicButtonComponent } from '../../shared/components/action-button/action-button.component';
import { CallsListComponent } from './calls-list/calls-list.component';

// Serviços e modelos
import { CallService } from '../../services/call.service';
import { CompanyService } from '../../services/company.service';
import { ClientService } from '../../services/client.service';
import { SessionService } from '../../services/session.service';
import { SendNotificationService } from '../../services/send-notification.service';
import { Call, Company, User } from '../../models/models';
import { NotificationType } from '../../enums/notificationType.enum';

@Component({
  selector: 'app-calls',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    
    // Componentes customizados
    DynamicSelectComponent,
    CustomInputComponent,
    RichTextEditorComponent,
    TagsComponent,
    DynamicButtonComponent,
    CallsListComponent
  ],
  templateUrl: './calls.component.html',
  styleUrls: ['./calls.component.scss']
})

export class CallsComponent implements OnInit {
  
  // Propriedades do componente
  form!: FormGroup;
  companies: Company[] = [];
  clients: User[] = [];
  operator!: User;
  selectedCall: Call | null = null;
  loading = false;
  isNarrow = false;
  isSaveOrEditSuccess = false;
  saveSuccess = false;
  deleteSuccess = false;

  constructor(
    private fb: FormBuilder,
    private callServ: CallService,
    private companyServ: CompanyService,
    private snackBar: MatSnackBar,
    private clientServ: ClientService,
    private sessionService: SessionService,
    private messageService: SendNotificationService,
    private route: ActivatedRoute
  ) {
    this.initializeForm();
    this.loadOperator();
  }

  ngOnInit(): void {
    this.onResize();
    this.loadCompanies();
    this.setupRouteListener();
  }

  // Métodos privados
  private initializeForm(): void {
    this.form = this.fb.group({
      operatorId: [''],
      companyId: [null, Validators.required],
      clientId: [null, Validators.required],
      connection: [''],
      title: ['', Validators.required],
      description: ['', Validators.required],
      resolution: ['', Validators.required],
      tags: [[], Validators.required],
      closed: [false],
      helpDeskCompanyId: [ null]
    });
  }

  private loadOperator(): void {
    const user = this.sessionService.getSession();
    if (user?.roles.includes('OPERATOR')) {
      this.operator = user;
      this.form.patchValue({ operatorId: this.operator.id });
    }
  }

  private setupRouteListener(): void {
    this.route.params.pipe(
      switchMap(params => {
        const callId = params['id'];
        if (callId) {
          this.loading = true;
          return this.callServ.getCallById(callId).pipe(
            catchError(err => {
              console.error('Erro ao buscar chamado:', err);
              this.loading = false;
              this.messageService.customNotification(
                NotificationType.ERROR,
                'Erro ao carregar chamado'
              );
              return of(null);
            })
          );
        }
        return of(null);
      })
    ).subscribe(call => {
      if (call) {
        this.selectedCall = call;
        // Garante que as empresas estão carregadas antes de preencher o form
        if (this.companies.length > 0) {
          this.patchFormWithCallData();
        } else {
          this.loadCompanies().then(() => this.patchFormWithCallData());
        }
      }
      this.loading = false;
    });
  }

  private async patchFormWithCallData(): Promise<void> {
    if (!this.selectedCall) return;

    // Primeiro preenche os valores básicos
    this.form.patchValue({
      companyId: this.selectedCall.companyId,
      clientId: this.selectedCall.clientId,
      connection: this.selectedCall.connection || '',
      title: this.selectedCall.title || '',
      description: this.selectedCall.description || '',
      resolution: this.selectedCall.resolution || '',
      tags: this.selectedCall.tags || [],
      closed: this.selectedCall.closed || false,
      operatorId: this.selectedCall.operatorId || this.operator?.id,
    });

    // Carrega os clientes se houver companyId
    if (this.selectedCall.companyId) {
      try {
        this.clients = await this.clientServ.getClientsByCompanyId(this.selectedCall.companyId);
        
        // Força a atualização do select de clientes
        this.form.get('clientId')?.setValue(this.selectedCall.clientId);
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
      }
    }

    // Força a detecção de mudanças nos controles
    this.form.updateValueAndValidity();
  }

  private async loadClientsForCompany(companyId: string): Promise<void> {
    try {
      this.clients = await this.clientServ.getClientsByCompanyId(companyId);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  }

  // Métodos públicos
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isNarrow = window.innerWidth <= 840;
  }

  async onCompanyChange(companyId: string): Promise<void> {
    this.form.patchValue({ companyId, clientId: null });
    await this.loadClientsForCompany(companyId);
  }

  onClientChange(clientId: string): void {
    this.form.patchValue({ clientId });
  }

  onClientSelected(clientId: string): void {
    this.onClientChange(clientId);
  }

  getControl(controlName: string): FormControl {
    return this.form.get(controlName) as FormControl;
  }

  onTagsChanged(tags: string[]): void {
    this.form.patchValue({ tags });
  }

  handleSaveOrEdit(event: Event): void {
    if (this.form.invalid) return;
    
    this.selectedCall ? this.updateCall() : this.onSubmit();
    this.isSaveOrEditSuccess = true;
    setTimeout(() => this.isSaveOrEditSuccess = false, 2000);
  }

  updateCall(): void {
    if (this.form.invalid) return;
    
    const formData = { ...this.form.value, id: this.selectedCall?.id };
    console.log('Atualizar chamado:', formData);
    // Implementar lógica de atualização
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Preencha todos os campos obrigatórios.', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.loading = true;
    this.form.get('helpDeskCompanyId')?.setValue(this.operator?.helpDeskCompanyId);
    this.callServ.saveCallWithGeneratedId(this.form.value)
      .then((savedCall) => {
        console.log('Chamado salvo com sucesso:', savedCall);
        this.saveSuccess = true;
        this.onClear();
        
        // Emite o evento para atualizar a lista
        const callsList = this.getCallsListComponent();
        if (callsList) {
          callsList.calls.unshift(savedCall); // Adiciona no início do array
        }
      })
      .catch(error => {
        console.error('Erro ao salvar chamado:', error);
        this.messageService.customNotification(
          NotificationType.ERROR,
          'Erro ao salvar chamado'
        );
      })
      .finally(() => {
        this.loading = false;
        setTimeout(() => this.saveSuccess = false, 2000);
      });
  }

  private getCallsListComponent(): CallsListComponent | null {
    // Se você estiver usando ViewChild:
    // return this.callsList;
    
    // Alternativa se o componente estiver no template:
    const element = document.querySelector('app-calls-list');
    return element ? (element as any).componentInstance as CallsListComponent : null;
  }

  onClear(): void {
    this.selectedCall = null;
    this.form.reset({ operatorId: this.operator?.id });
  }

  private loadCompanies(): Promise<void> {
    return new Promise((resolve) => {
      this.companyServ.getCompanyByFirebase().subscribe({
        next: (companies) => {
          this.companies = companies;
          resolve();
        },
        error: (error) => {
          this.handleCompaniesError(error);
          resolve();
        }
      });
    });
  }


  private handleCompaniesError(error: any): void {
    console.error('Erro ao carregar empresas:', error);
    this.snackBar.open('Erro ao carregar empresas.', 'Fechar', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }

  handleSelectedCall(call: Call): void {
    this.selectedCall = call;
    this.patchFormWithCallData();
    // Opcional: rolar para o topo do formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Métodos vazios (para implementação futura)
  openCompanyModal(): void {}
  abrirModalCliente(): void {}
  onEdit(): void {}
  onDelete(): void {}
  onPrint(): void {}
  submit(): void {}
}