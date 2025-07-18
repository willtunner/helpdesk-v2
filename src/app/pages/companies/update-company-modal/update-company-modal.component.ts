import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Company } from '../../../models/models';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { CustomInputComponent } from '../../../shared/components/custom-input/custom-input.component';
import { DynamicButtonComponent } from '../../../shared/components/action-button/action-button.component';

@Component({
  selector: 'app-update-company-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    CustomInputComponent,
    DynamicButtonComponent
  ],
  templateUrl: './update-company-modal.component.html',
  styleUrls: ['./update-company-modal.component.scss']
})
export class UpdateCompanyModalComponent {

  form: FormGroup;
  saveSuccess = false;

  constructor(
    public dialogRef: MatDialogRef<UpdateCompanyModalComponent>,
    @Inject(MAT_DIALOG_DATA) public company: Company,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      name: [company.name],
      cnpj: [company.cnpj],
      email: [company.email],
      phone: [company.phone],
      state: [company.state],
      city: [company.city],
      address: [company.address],
      zipcode: [company.zipcode]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    console.log('Updated Company:', this.form.value);
    this.dialogRef.close(this.form.value);
  }

  getInputType(fieldKey: string): string {
    switch (fieldKey.toLowerCase()) {
      case 'email': return 'email';
      case 'telefone': return 'telefone';
      case 'cpf': return 'cpf';
      case 'cnpj': return 'cnpj';
      case 'cep': return 'cep';
      case 'nascimento': return 'date';
      default: return 'text';
    }
  }
}
