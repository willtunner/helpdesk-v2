import { Component, inject, Input, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateService } from '../../../services/translate.service';

@Component({
  selector: 'app-floating-language-selector',
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatIconModule, MatButtonModule],
  templateUrl: './floating-language-selector.component.html',
  styleUrls: ['./floating-language-selector.component.scss']
})
export class FloatingLanguageSelectorComponent implements OnInit {
  translateService = inject(TranslateService);
  @Input() visible = true;

  languages = [
    { code: 'BRL', flag: 'assets/br.png', label: 'BR' },
    { code: 'ESP', flag: 'assets/es.png', label: 'ES' },
    { code: 'USA', flag: 'assets/us.png', label: 'EN' },
  ];

  // Acesso reativo ao idioma atual
  selectedLanguage = this.translateService.selectedLanguage;

  ngOnInit(): void {
    const saved = this.translateService.selectedLanguage();
    this.translateService.changeLanguage(saved.lang, saved.flag);
  }

  changeLanguage(lang: { code: string; flag: string }) {
    this.translateService.changeLanguage(lang.code, lang.flag);
  }
}
