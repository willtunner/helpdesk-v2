import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule],
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.scss']
})
export class DynamicTableComponent {
  
  @Input() headers: { 
    key: string; 
    label: string; 
    formatter?: (row: any) => string 
  }[] = [];

  @Input() set data(value: any[]) {
    this.rows.set(value);
  }

  @Input() actions: string[] = [];

  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() load = new EventEmitter<any>();
  @Output() print = new EventEmitter<any>();
  @Output() view = new EventEmitter<any>();

  rows = signal<any[]>([]);

  get displayedColumns(): string[] {
    return [...this.headers.map(h => h.key), 'actions'];
  }

  emit(action: string, row: any) {
    switch (action) {
      case 'edit': this.edit.emit(row); break;
      case 'delete': this.delete.emit(row); break;
      case 'load': this.load.emit(row); break;
      case 'print': this.print.emit(row); break;
      case 'view': this.view.emit(row); break;
    }
  }

}
