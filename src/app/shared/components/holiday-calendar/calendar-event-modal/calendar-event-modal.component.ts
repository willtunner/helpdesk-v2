import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-calendar-event-modal',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './calendar-event-modal.component.html',
  styleUrl: './calendar-event-modal.component.scss'
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
  ) {}

  onSave(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
