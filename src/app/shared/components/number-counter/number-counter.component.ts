import { Component, Input, OnInit } from '@angular/core';
import { interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-number-counter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './number-counter.component.html',
  styleUrl: './number-counter.component.scss'
})
export class NumberCounterComponent implements OnInit {
  @Input() end = 100;         // Valor final
  @Input() duration = 1000;   // Duração total da animação em ms

  currentValue = 0;

  ngOnInit() {
    const steps = this.end; // Para subir de 1 em 1
    const timePerStep = this.duration / steps;

    interval(timePerStep)
      .pipe(takeWhile(() => this.currentValue < this.end))
      .subscribe(() => {
        this.currentValue++;
      });
  }
}
