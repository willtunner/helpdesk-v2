import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CustomInputComponent } from '../../custom-input/custom-input.component';

@Component({
  selector: 'app-calendar-event-modal',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    CustomInputComponent
  ],
  templateUrl: './calendar-event-modal.component.html',
  styleUrls: ['./calendar-event-modal.component.scss']
})
export class CalendarEventModalComponent {
  dialogRef = inject(MatDialogRef<CalendarEventModalComponent>);

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      form: FormGroup;
      isEditing: boolean;
      date: Date;
    }
  ) {
    if (!this.data.form) {
      const fb = inject(FormBuilder);
      this.data.form = fb.group({
        title: ['', Validators.required],
        description: ['', Validators.required]
      });
    }
  }

  onSave(): void {
    if (this.data.form.valid) {
      this.dialogRef.close(true);
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}