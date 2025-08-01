import { Component, forwardRef, HostListener, Input, OnInit } from '@angular/core';
import { DynamicSelectComponent } from '../../shared/components/dynamic-select/dynamic-select.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomInputComponent } from '../../shared/components/custom-input/custom-input.component';
import { RichTextEditorComponent } from '../../shared/components/rich-text/rich-text.component';
import { TagsComponent } from '../../shared/components/tags/tags.component';
import { MatRadioModule } from '@angular/material/radio';
import { Call, Company, User } from '../../models/models';
import { CallService } from '../../services/call.service';
import { DynamicButtonComponent } from '../../shared/components/action-button/action-button.component';
import { CompanyService } from '../../services/company.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-calls',
  standalone: true,
  imports: [
    DynamicSelectComponent, 
    CommonModule, 
    CustomInputComponent, 
    RichTextEditorComponent, 
    ReactiveFormsModule, 
    TagsComponent,
    MatRadioModule,
    DynamicButtonComponent
  ],
  templateUrl: './calls.component.html',
  styleUrl: './calls.component.scss',
  providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => RichTextEditorComponent),
        multi: true
      }
    ]
})
export class CallsComponent implements OnInit {
  // companies = [{ id: 1, name: 'Acme Corp' }, { id: 2, name: 'Globex' }];
  clients = [{ id: 'c1', name: 'Fulano' }, { id: 'c2', name: 'Beltrano' }];
  selectedCompany: string | null = null;
  selectedClient: string | null = null;
  form!: FormGroup;
  isSaveOrEditSuccess = false;
  saveSuccess = false;
  deleteSuccess = false;
  companies: Company[] = [];
  operator!: User;
  @Input() selectedCall: Call | null = null;

  constructor(
    private fb: FormBuilder, 
    private callServ: CallService,
    private companyServ: CompanyService,
    private snackBar: MatSnackBar,
    private sessionService: SessionService, // Assuming you have a session service to get the user session
  ) {
    const user = this.sessionService.getSession();
    if (user) {
      if (user?.roles.includes('OPERATOR')) {
        this.operator = user;
      }
    }

    this.form = this.fb.group({
      companyId: [null, Validators.required],
      clientId: [null, Validators.required],
      connection: [''],
      title: ['', Validators.required],
      description: ['', Validators.required],
      resolution: ['', Validators.required],
      tags: ['', Validators.required],
      closed: [false],
      operatorId: [this.operator?.id],
    });
  }

  isNarrow = false;

@HostListener('window:resize', ['$event'])
onResize() {
  this.isNarrow = window.innerWidth < 970;
}

  ngOnInit(): void {
    this.onResize();
    if (this.selectedCall) {
      this.form.patchValue({
        companyId: this.selectedCall.companyId,
        clientId: this.selectedCall.clientId,
        connection: this.selectedCall.connection,
        title: this.selectedCall.title,
        description: this.selectedCall.description,
        resolution: this.selectedCall.resolution,
        tags: this.selectedCall.tags,
        closed: this.selectedCall.closed,
        operatorId: this.selectedCall.operatorId,
      });
    }
    this.loadCompanies();
  }


  onCompanyChange(companyId: string) {
    this.form.patchValue({ companyId: companyId });
  }

  onClientChange(clientId: string) {
    this.form.patchValue({ clientId: clientId });
  }

  openCompanyModal() {
    // Lógica da empresa
  }

  abrirModalCliente() { }

  getControl(controlName: string): FormControl {
    return this.form.get(controlName) as FormControl;
  }

  submit() {
    console.log('Formulário enviado:', this.form.value);
    if (this.form.valid) {
      console.log('Formulário enviado:', this.form.value);
      // Mostrar o conteúdo HTML no console
      console.log('Conteúdo da descrição (HTML):', this.form.get('descricao')?.value);
      console.log('Termos aceitos (HTML):', this.form.get('termos')?.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  onTagsChanged(tags: string): void {
    const tagArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    this.form.patchValue({
      tags: tagArray
    });
  }

  handleSaveOrEdit(event: Event): void {
    if (this.form.invalid) {
      return;
    }
    if (this.selectedCall) {
      this.updateCall();
    } else {
      this.onSubmit();
    }
    this.isSaveOrEditSuccess = true;
    setTimeout(() => this.isSaveOrEditSuccess = false, 2000); // Reseta após 2 segundos
  }

  updateCall() {
    if (this.form.invalid) {
      return;
    }

    const formData = this.form.value;
    formData.id = this.selectedCall?.id;

    console.log('Atualizar', this.selectedCall);
  }

  onSubmit() {

    if (this.form.valid) {
      console.log('Formulário enviado:', this.form.value);
    } else {
      this.form.markAllAsTouched();
      this.snackBar.open('Preencha todos os campos obrigatórios.', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
    // if (this.form.invalid) {
    //   return;
    // }

    // const formData = this.form.value;

    // this.callServ
    //   .saveCallWithGeneratedId(formData)
    //   .then((res: any) => {
    //     this.onClear();
    //   })
    //   .catch((error) => {
    //     console.error('Erro ao salvar a call:', error);
    //   });
  }

  onClear() {
    this.selectedCall = null;
    this.form.reset();
    window.location.reload();
  }

  onEdit(){}
  onDelete(){}
  onPrint(){}

  loadCompanies(): void {
    this.companyServ.getCompanyByFirebase().subscribe((companies: Company[]) => {
      this.companies = companies;

      // Reaplica a lógica de filtragem ao carregar as empresas
      const companyId = this.form.get('companyId')?.value;
      if (companyId) {
        this.onCompanyChange(companyId);
      }
    }, error => {
      console.error('Erro ao carregar empresas:', error);
      this.snackBar.open('Erro ao carregar empresas.', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    });
  }

}
