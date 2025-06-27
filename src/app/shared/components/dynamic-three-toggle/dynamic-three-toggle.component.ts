import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dynamic-three-toggle',
  standalone: true,
  templateUrl: './dynamic-three-toggle.component.html',
  styleUrls: ['./dynamic-three-toggle.component.scss'],
  imports: [MatButtonToggleModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicThreeToggleComponent {
  @Input() title: string = 'Selecione uma opção';
  @Input() btn1!: { label: string; value: string };
  @Input() btn2!: { label: string; value: string };
  @Input() btn3!: { label: string; value: string };
  @Input() selectedValue: string = '';

  @Output() onToggleSelect = new EventEmitter<string>();

  onToggle(value: string) {
    this.selectedValue = value;
    this.onToggleSelect.emit(value);
  }
}
