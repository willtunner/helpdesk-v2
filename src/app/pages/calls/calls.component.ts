import { Component, forwardRef, Input } from '@angular/core';
import { DynamicSelectComponent } from '../../shared/components/dynamic-select/dynamic-select.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomInputComponent } from '../../shared/components/custom-input/custom-input.component';
import { RichTextEditorComponent } from '../../shared/components/rich-text/rich-text.component';
import { TagsComponent } from '../../shared/components/tags/tags.component';
import { MatRadioModule } from '@angular/material/radio';
import { Call } from '../../models/models';
import { CallService } from '../../services/call.service';
import { DynamicButtonComponent } from '../../shared/components/action-button/action-button.component';

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
export class CallsComponent {
  companies = [{ id: 1, name: 'Acme Corp' }, { id: 2, name: 'Globex' }];
  clients = [{ id: 'c1', name: 'Fulano' }, { id: 'c2', name: 'Beltrano' }];
  selectedCompany: string | null = null;
  selectedClient: string | null = null;
  form!: FormGroup;
  isSaveOrEditSuccess = false;
  saveSuccess = false;
  deleteSuccess = false;
  @Input() selectedCall: Call | null = null;

  constructor(private fb: FormBuilder, private callServ: CallService) {
    this.form = this.fb.group({
      companyId: [null, Validators.required],
      clientId: [null, Validators.required],
      connection: [''],
      title: ['', Validators.required],
      description: ['', Validators.required],
      resolution: ['', Validators.required],
      tags: ['', Validators.required],
      closed: [false],
      // operatorId: [this.operator?.id],
    });
  }

  onCompanyChange(companyId: string) {
    // Lógica da empresa
  }

  onClientChange(clientId: string) {
    // Lógica do cliente
  }

  openCompanyModal() {
    // Lógica da empresa
  }

  abrirModalCliente() { }

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

    if (this.form.invalid) {
      return;
    }

    const formData = this.form.value;

    this.callServ
      .saveCallWithGeneratedId(formData)
      .then((res: any) => {
        this.onClear();
      })
      .catch((error) => {
        console.error('Erro ao salvar a call:', error);
      });
  }

  onClear() {
    this.selectedCall = null;
    this.form.reset();
    window.location.reload();
  }

  onEdit(){}
  onDelete(){}
  onPrint(){}

}
