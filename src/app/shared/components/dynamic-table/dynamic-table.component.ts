import { Component, EventEmitter, HostListener, inject, Input, Output, signal, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateService as NgxTranslateService, TranslateModule } from '@ngx-translate/core';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatIconModule, 
    MatButtonModule,
    MatSortModule,
    MatPaginator,
    TranslateModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatTooltipModule 
  ],
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.scss']
})
export class DynamicTableComponent {
  @Input() headers: { key: string; label: string; formatter?: (row: any) => string }[] = [];
  @Input() actions: string[] = [];

  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() load = new EventEmitter<any>();
  @Output() print = new EventEmitter<any>();
  @Output() view = new EventEmitter<any>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() save = new EventEmitter<any>();

  dataSource = new MatTableDataSource<any>([]);

  editingRow: any = null;        // referência da linha em edição
  editingData: any = {};         // dados editáveis
  originalRowData: any = {};     // backup p/ cancelar
  savingRowId: string | null = null; // ID da linha que está salvando

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  @Input() set data(value: any[]) {
    this.dataSource.data = value;
  }

  get displayedColumns(): string[] {
    return [...this.headers.map(h => h.key), 'actions'];
  }

  // Inicia edição
  startEdit(row: any) {
    this.editingRow = row;                // mantém a referência
    this.editingData = { ...row };        // cria objeto editável
    this.originalRowData = { ...row };    // backup
  }

  // Salva alterações
  async saveEdit() {
    if (this.editingRow) {
      this.savingRowId = this.editingRow.id; // Marca a linha como salvando
      
      try {
        Object.assign(this.editingRow, this.editingData); // aplica mudanças
        await this.save.emit(this.editingRow); // Aguarda a emissão do evento
        this.cancelEdit(false); // encerra edição sem restaurar
      } catch (error) {
        console.error('Erro ao salvar:', error);
        // Em caso de erro, mantém a edição para o usuário corrigir
      } finally {
        this.savingRowId = null; // Remove o estado de salvando
      }
    }
  }

  // Cancela edição (restaura dados originais)
  cancelEdit(restore: boolean = true) {
    if (this.editingRow && restore) {
      Object.assign(this.editingRow, this.originalRowData);
    }
    this.editingRow = null;
    this.editingData = {};
    this.originalRowData = {};
    this.savingRowId = null;
  }

  // Verifica se linha está em edição
  isEditing(row: any): boolean {
    return this.editingRow === row;
  }

  // Verifica se linha está salvando
  isSaving(row: any): boolean {
    return this.savingRowId === row.id;
  }

  emit(action: string, row: any) {
    if (this.isSaving(row)) return; // Impede ações durante o salvamento

    switch (action) {
      case 'edit':
        if (this.isEditing(row)) {
          this.saveEdit();
        } else {
          this.startEdit(row);
        }
        break;
      case 'delete': this.delete.emit(row); break;
      case 'load': this.load.emit(row); break;
      case 'print': this.print.emit(row); break;
      case 'view': this.view.emit(row); break;
    }
  }
}

