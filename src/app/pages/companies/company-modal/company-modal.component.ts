import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DynamicButtonComponent } from '../../../shared/components/action-button/action-button.component';
import { CustomInputComponent } from '../../../shared/components/custom-input/custom-input.component';
import { Company } from '../../../models/models';

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

  constructor(
    public dialogRef: MatDialogRef<CompanyModalComponent>,
    private fb: FormBuilder
  ) {
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

  onSave(): void {
    if (this.companyForm.valid) {
      this.loading = true;
      // Simula uma requisição assíncrona
      setTimeout(() => {
        this.loading = false;
        this.dialogRef.close(this.companyForm.value);
      }, 1000);
    }
  }

  searchCep(): void {
    // Implementar busca de CEP aqui
    console.log('Buscando CEP...');
  }

  searchCnpj(): void {
    // Implementar busca de CNPJ aqui
    console.log('Buscando CNPJ...');
  }
}