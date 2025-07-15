import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NumberCounterComponent } from '../number-counter/number-counter.component'; // ajuste o caminho conforme necessário

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, NumberCounterComponent],
  templateUrl: './dashboard-card.component.html',
  styleUrls: ['./dashboard-card.component.scss']
})
export class DashboardCardComponent {
  @Input() icon = 'insert_chart';   // Ex: 'people', 'attach_money', etc.
  @Input() color = '#3498db';       // Pode ser hexadecimal, rgba, nome de cor, etc.
  @Input() end = 100;               // Valor final do contador
  @Input() duration = 1000;         // Duração da animação do contador (ms)
  @Input() label = 'Total';         // Texto abaixo do contador

  // Função simples para calcular contraste baseado na cor recebida
getContrastingBackground(color: string): string {
  const hex = color.replace('#', '');

  // Parse RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Contraste com branco ou preto (YIQ formula)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  // Se a cor for clara, usar um fundo mais escuro. Se for escura, usar mais claro
  return yiq >= 128
    ? `rgba(${r}, ${g}, ${b}, 0.15)` // Cor clara → fundo sutil com transparência
    : `rgba(${r + 40}, ${g + 40}, ${b + 40}, 0.2)`; // Cor escura → tom mais claro
}

}
