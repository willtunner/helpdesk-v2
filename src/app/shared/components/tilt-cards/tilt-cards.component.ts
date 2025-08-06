import { Component, ElementRef, AfterViewInit } from '@angular/core';
import VanillaTilt from 'vanilla-tilt';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tilt-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tilt-cards.component.html',
  styleUrls: ['./tilt-cards.component.scss']
})
export class TiltCardsComponent implements AfterViewInit {
  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    const cards = this.el.nativeElement.querySelectorAll('.card');
    VanillaTilt.init(cards, {
      glare: true,
      reverse: true,
      'max-glare': 0.2,
    });
  }
}
