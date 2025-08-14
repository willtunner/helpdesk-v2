import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
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
      closed: [false]
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
          return this.callServ.getCallById(callId);
        }
        return of(null);
      })
    ).subscribe({
      next: (call) => this.handleCallResponse(call),
      error: (err) => this.handleCallError(err)
    });
  }

  private handleCallResponse(call: Call | null): void {
    if (call) {
      this.selectedCall = call;
      this.patchFormWithCallData();
    }
    this.loading = false;
  }

  private handleCallError(err: any): void {
    console.error('Erro ao carregar chamado:', err);
    this.loading = false;
    this.messageService.customNotification(
      NotificationType.ERROR,
      'Erro ao carregar chamado'
    );
  }

  private async patchFormWithCallData(): Promise<void> {
    if (!this.selectedCall) return;

    this.form.patchValue({
      companyId: this.selectedCall.companyId,
      clientId: this.selectedCall.clientId,
      connection: this.selectedCall.connection,
      title: this.selectedCall.title,
      description: this.selectedCall.description,
      resolution: this.selectedCall.resolution,
      tags: this.selectedCall.tags || [],
      closed: this.selectedCall.closed || false,
      operatorId: this.selectedCall.operatorId || this.operator?.id,
    });

    if (this.selectedCall.companyId) {
      await this.loadClientsForCompany(this.selectedCall.companyId);
      this.form.get('clientId')?.setValue(this.selectedCall.clientId);
    }
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

    this.callServ.saveCallWithGeneratedId(this.form.value)
      .then(() => this.onClear())
      .catch(error => console.error('Erro ao salvar chamado:', error));
  }

  onClear(): void {
    this.selectedCall = null;
    this.form.reset({ operatorId: this.operator?.id });
  }

  loadCompanies(): void {
    this.companyServ.getCompanyByFirebase().subscribe({
      next: (companies) => {
        this.companies = companies;
        const companyId = this.form.get('companyId')?.value;
        if (companyId) this.onCompanyChange(companyId);
      },
      error: (error) => this.handleCompaniesError(error)
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