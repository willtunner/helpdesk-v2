import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Call } from '../../../models/models';
import { CustomInputComponent } from '../../../shared/components/custom-input/custom-input.component';
import { DynamicButtonComponent } from '../../../shared/components/action-button/action-button.component';

@Component({
  selector: 'app-call-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    CustomInputComponent,
    DynamicButtonComponent,
  ],
  templateUrl: './call-modal.component.html',
  styleUrl: './call-modal.component.scss',
})
export class CallModalComponent {
  public calls: Call[] = [];
  searchControl = new FormControl('');

  constructor(
    public dialogRef: MatDialogRef<CallModalComponent>,
    @Inject(MAT_DIALOG_DATA) calls: Call[]
  ) {
    this.calls = calls ?? [];
  }

  close(): void {
    this.dialogRef.close();
  }

  onSearchCalls(): void {
    const term = this.searchControl.value?.toLowerCase() || '';
    console.log('Buscar chamados com:', term);
  }

  get hasCalls(): boolean {
    return Array.isArray(this.calls) && this.calls.length > 0;
  }
}
