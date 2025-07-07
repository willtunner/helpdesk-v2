import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { DateTimeFormatPipe } from '../../../pipes/dateTimeFormatTimeStamp.pipe';

@Component({
  selector: 'app-call-details-modal',
  templateUrl: './call-details-modal.component.html',
  styleUrls: ['./call-details-modal.component.css'],
  standalone: true,
  imports: [
    MatDialogModule, 
    ReactiveFormsModule, 
    MatFormFieldModule,   
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    CommonModule, 
    MatIconModule,
    DateTimeFormatPipe],
})
export class CallDetailsModalComponent {
  callForm!: FormGroup;
  isEditing = false;

  constructor(private fb: FormBuilder,
    public dialogRef: MatDialogRef<CallDetailsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.createForm();
    this.setFormValues();
  }

  private createForm(): void {
    this.callForm = this.fb.group({
      id: [{ value: '', disabled: true }],
      title: [{ value: '', disabled: true }],
      description: [{ value: '', disabled: true }],
      resolution: [{ value: '', disabled: true }],
      tags: [{ value: '', disabled: true }],
      connection: [{ value: '', disabled: true }],
      companyId: [{ value: '', disabled: true }],
      companyName: [{ value: '', disabled: true }],
      clientId: [{ value: '', disabled: true }],
      clientName: [{ value: '', disabled: true }],
      operatorId: [{ value: '', disabled: true }],
      operatorName: [{ value: '', disabled: true }],
      created: [{ value: '', disabled: true }],
      updated: [{ value: '', disabled: true }],
      finalized: [{ value: '', disabled: true }],
      closed: [{ value: '', disabled: true }]
    });
  }

  private setFormValues(): void {
    this.callForm.patchValue({
      id: this.data.id,
      title: this.data.title,
      description: this.data.description,
      resolution: this.data.resolution,
      tags: this.data.tags,
      connection: this.data.connection,
      companyId: this.data.companyId,
      companyName: this.data.company?.name || '',
      clientId: this.data.clientId,
      clientName: this.data.client?.name || '',
      employeeId: this.data.employeeId || '',
      employeeName: this.data.employee?.name || '',
      created: this.data.created,
      updated: this.data.updated,
      finalized: this.data.finalized,
      closed: this.data.closed ? 'Fechado' : 'Aberto',
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  enableEditing(): void {
    this.isEditing = true;
    this.callForm.enable(); // Habilita todos os campos do formulário para edição
  }

  saveChanges(): void {
    if (this.callForm.invalid) {
      return;
    }
    // Fechar o diálogo após salvar
    this.dialogRef.close();
  }

  cancelEditing(): void {
    if (this.isEditing) {
      this.isEditing = false;
      this.callForm.disable(); // Desabilita todos os campos do formulário após cancelar
      this.setFormValues(); // Reverte as alterações feitas
    } else {
      this.dialogRef.close(); // Fechar o diálogo sem editar
    }
  }
}
