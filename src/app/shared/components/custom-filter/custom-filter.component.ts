import { Component, EventEmitter, Input, Output, SimpleChanges, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CustomInputComponent } from '../custom-input/custom-input.component';
import { MatButtonModule } from '@angular/material/button';
import { DynamicButtonComponent } from '../action-button/action-button.component';
import { MatTooltipModule } from '@angular/material/tooltip';

interface FilterField {
  key: string;
  label: string;
  type: string;
  size: 'pequeno' | 'medio' | 'grande' | 'full-width';
}

@Component({
  selector: 'app-custom-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomInputComponent, 
    MatButtonModule, DynamicButtonComponent, MatTooltipModule],
  templateUrl: './custom-filter.component.html',
  styleUrls: ['./custom-filter.component.scss']
})
export class CustomFilterComponent implements OnInit, OnChanges {
  @Input() fields: FilterField[] = [];
  @Input() data: any[] = [];

  @Output() filteredData = new EventEmitter<any[]>();

  form: FormGroup;
  private originalData: any[] = [];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({});
  }

  ngOnInit() {
    this.fields.forEach(field => {
      this.form.addControl(field.key, this.fb.control(''));
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && Array.isArray(this.data)) {
      this.originalData = [...this.data];
    }
  }

  applyFilter() {
    const filters = this.form.value;

    const filtered = this.originalData.filter(item =>
      Object.keys(filters).every(key => {
        const filterValue = (filters[key] || '').toString().toLowerCase().trim();
        if (!filterValue) return true;
        
        const itemValue = this.getFilterValue(item, key);
        return itemValue.includes(filterValue);
      })
    );

    this.filteredData.emit(filtered);
  }

  resetFilter() {
    this.form.reset();
    this.filteredData.emit([...this.originalData]);
  }

  private getFilterValue(obj: any, key: string): string {
    // Mapeamento de campos específicos para objetos aninhados
    const fieldMappings: { [key: string]: string } = {
      'name': 'title', // Para calls, 'name' geralmente se refere ao título
      'operator': 'operator.name',
      'client': 'client.name',
      'company': 'company.name',
      'tag': 'tags'
    };

    const actualKey = fieldMappings[key] || key;
    
    if (actualKey === 'tags') {
      // Lida com array de tags
      const tags = this.getNestedValue(obj, actualKey) || [];
      return Array.isArray(tags) ? tags.join(' ').toLowerCase() : '';
    }
    
    const value = this.getNestedValue(obj, actualKey);
    return (value || '').toString().toLowerCase();
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => {
      if (acc == null) return null;
      return acc[part];
    }, obj);
  }
}