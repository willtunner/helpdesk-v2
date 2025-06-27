import { Component, Input, signal } from '@angular/core';
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
  @Input() headers: { key: string; label: string }[] = [];

  @Input() set data(value: any[]) {
    this.rows.set(value);
  }

  rows = signal<any[]>([]);

  get displayedColumns(): string[] {
    return [...this.headers.map(h => h.key), 'actions'];
  }

  edit(row: any) {
    console.log('Editar:', row);
  }

  delete(row: any) {
    this.rows.update(rows => rows.filter(r => r !== row));
  }
}
