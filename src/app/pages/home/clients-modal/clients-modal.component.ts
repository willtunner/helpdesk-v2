import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DynamicButtonComponent } from '../../../shared/components/action-button/action-button.component';
import { CustomInputComponent } from '../../../shared/components/custom-input/custom-input.component';

@Component({
  selector: 'app-clients-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule, 
    DynamicButtonComponent, CustomInputComponent],
  templateUrl: './clients-modal.component.html',
  styleUrl: './clients-modal.component.scss'
})
export class ClientsModalComponent {
  public clients: any[] = [];
  searchControl = new FormControl('');

  constructor(
    public dialogRef: MatDialogRef<ClientsModalComponent>,
    @Inject(MAT_DIALOG_DATA) clients: any[]
  ) {
    this.clients = clients ?? []; // Garante que não será undefined
  }

  close(): void {
    this.dialogRef.close();
  }

  onSearchClients() {
    const term = this.searchControl.value?.toLowerCase() || '';
    // Aqui você pode fazer um filtro em `clients`, ou emitir para o parent, etc.
    console.log('Buscar cliente:', term);
  }

  
}
