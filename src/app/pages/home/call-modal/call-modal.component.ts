import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Call } from '../../../models/models';
import { CustomInputComponent } from '../../../shared/components/custom-input/custom-input.component';
import { DynamicButtonComponent } from '../../../shared/components/action-button/action-button.component';
import { TranslateModule } from '@ngx-translate/core';

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
    TranslateModule
  ],
  templateUrl: './call-modal.component.html',
  styleUrl: './call-modal.component.scss',
})
export class CallModalComponent {
  public calls: Call[] = [];
  searchControl = new FormControl('');
  public type: 'open' | 'closed' | 'all' = 'all';

  constructor(
    public dialogRef: MatDialogRef<CallModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tagName: string; count: number; calls: Call[] },
  ) {
    this.calls = data.calls ?? [];
    // this.type = data.type;
    console.log("calls Modal", data);
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

  getTitle(): string {
    switch (this.type) {
      case 'open':
        return 'titles-modals.call-list-open';
      case 'closed':
        return 'titles-modals.call-list-close';
      default:
        return 'titles-modals.call-list';
    }
  }

  generateColorFromString(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = input.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.floor(Math.abs(Math.sin(hash) * 16777215)).toString(16);
    return '#' + ('000000' + color).slice(-6);
  }

}
