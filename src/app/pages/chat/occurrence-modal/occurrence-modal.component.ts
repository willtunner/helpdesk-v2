import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-occurrence-modal',
  templateUrl: './occurrence-modal.component.html',
  styleUrls: ['./occurrence-modal.component.scss'],
  standalone: true, // Torna o componente standalone
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    CommonModule
  ],
})
export class OccurrenceModalComponent {
  occurrenceForm: FormGroup;
  reasons: string[] = [
    'TEF', 'NÃO IMPRIME', 'SPED', 'AUTOMAÇÃO', 'SISTEMA',
    'ABASTECIMENTO NÃO CAI', 'INSTALAR PDV', 'INSTALAR SERVIDOR',
    'NÃO ENVIA EMAIL', 'PROBLEMAS COM NOTAS', 'FINANCEIRO', 'OUTROS'
  ];

  constructor(
    private dialogRef: MatDialogRef<OccurrenceModalComponent>,
    private fb: FormBuilder
  ) {
    this.occurrenceForm = this.fb.group({
      reason: ['', Validators.required]
    });
  }

  submit(): void {
    if (this.occurrenceForm.valid) {
      this.dialogRef.close(this.occurrenceForm.value.reason);
    }
  }

  close(): void {
    this.dialogRef.close(null);
  }
}
