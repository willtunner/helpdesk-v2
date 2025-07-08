import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dynamic-three-toggle',
  standalone: true,
  templateUrl: './dynamic-three-toggle.component.html',
  styleUrls: ['./dynamic-three-toggle.component.scss'],
  imports: [MatButtonToggleModule, CommonModule, 
    MatButtonToggleModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DynamicThreeToggleComponent {
  @Input() title: string = 'Selecione uma opção';
  @Input() btn1!: { label: string; value: string };
  @Input() btn2!: { label: string; value: string };
  @Input() btn3!: { label: string; value: string };
  @Input() selectedValue: string = '';

  @Output() onToggleSelect = new EventEmitter<string>();

  onGroupClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const button = target.closest('mat-button-toggle');
  
    if (button) {
      const value = button.getAttribute('value') ?? '';
      this.selectedValue = value;
      this.onToggleSelect.emit(this.selectedValue);
    }
  }

  handleChange(value: string) {
    this.onToggleSelect.emit(value);
  }
  
}
