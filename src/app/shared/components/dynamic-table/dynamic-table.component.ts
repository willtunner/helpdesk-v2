import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { EmailValidationService } from '../../../services/email-validation.service';
import { SendNotificationService } from '../../../services/send-notification.service';
import { NotificationType } from '../../../enums/notificationType.enum';
import { TranslateService } from '../../../services/translate.service';

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
    MatTooltipModule,
    MatSnackBarModule
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

  editingRow: any = null;
  editingData: any = {};
  originalRowData: any = {};
  savingRowId: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private emailValidationService: EmailValidationService,
    private notificationService: SendNotificationService,
    private translate: TranslateService
  ) {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  @Input() set data(value: any[]) {
    this.dataSource.data = value;
  }

  get displayedColumns(): string[] {
    return [...this.headers.map(h => h.key), 'actions'];
  }

  startEdit(row: any) {
    this.editingRow = row;
    this.editingData = { ...row };
    this.originalRowData = { ...row };
  }

  // 🚀 Verifica email antes de salvar
  async saveEdit() {
    if (this.editingRow) {
      this.savingRowId = this.editingRow.id;

      try {
        if (this.editingData.email) {
          const emailExists = await this.emailValidationService.checkEmailExistsInCollections(
            this.editingData.email,
            ['users', 'clients'] 
          );

          if (emailExists) {
            this.notificationService.customNotification(
              NotificationType.ERROR,
              this.translate.instant('erros.email_exist')
            );
            this.savingRowId = null;
            return;
          }
        }

        Object.assign(this.editingRow, this.editingData);
        await this.save.emit(this.editingRow);

        // this.notificationService.customNotification(
        //   NotificationType.SUCCESS,
        //   '✅ Registro salvo com sucesso!'
        // );

        this.cancelEdit(false);
      } catch (error) {
        this.notificationService.customNotification(
          NotificationType.ERROR,
          '❌ Erro ao salvar registro!'
        );
        console.error('Erro ao salvar:', error);
      } finally {
        this.savingRowId = null;
      }
    }
  }

  cancelEdit(restore: boolean = true) {
    if (this.editingRow && restore) {
      Object.assign(this.editingRow, this.originalRowData);
    }
    this.editingRow = null;
    this.editingData = {};
    this.originalRowData = {};
    this.savingRowId = null;
  }

  isEditing(row: any): boolean {
    return this.editingRow === row;
  }

  isSaving(row: any): boolean {
    return this.savingRowId === row.id;
  }

  emit(action: string, row: any) {
    if (this.isSaving(row)) return;

    switch (action) {
      case 'edit':
        if (this.isEditing(row)) {
          this.saveEdit();
        } else {
          this.startEdit(row);
        }
        break;
      case 'delete':
        this.delete.emit(row);
        // this.notificationService.customNotification(
        //   NotificationType.UPDATE,
        //   'ℹ️ Registro excluído!'
        // );
        break;
      case 'load': this.load.emit(row); break;
      case 'print': this.print.emit(row); break;
      case 'view': this.view.emit(row); break;
    }
  }
}
