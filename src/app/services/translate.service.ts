import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { TranslateService as NgxTranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  private readonly STORAGE_KEY = 'selectedLanguage';
  private readonly DEFAULT_LANG = { lang: 'pt', flag: '/assets/br.png' };
  private ngxTranslate = inject(NgxTranslateService);

  selectedLanguage: WritableSignal<{ lang: string; flag: string }> = signal(this.loadLanguage());
  translations: WritableSignal<{ [key: string]: string }> = signal({});

  constructor() {
    const savedLang = this.selectedLanguage();
    const langCode = this.getLanguageCode(savedLang.lang);
    this.ngxTranslate.use(langCode);
  }

  private loadLanguage(): { lang: string; flag: string } {
    const savedLang = localStorage.getItem(this.STORAGE_KEY);
    return savedLang ? JSON.parse(savedLang) : this.DEFAULT_LANG;
  }

  changeLanguage(lang: string, flag: string): void {
    const languageCode = this.getLanguageCode(lang);
    this.ngxTranslate.use(languageCode);
    const newLang = { lang, flag };
    this.selectedLanguage.set(newLang);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newLang));
  }

  private getLanguageCode(lang: string): string {
    switch (lang) {
      case 'BRL': return 'pt';
      case 'ESP': return 'es';
      case 'USA': return 'en';
      default: return 'pt';
    }
  }

  /**
   * Carrega várias traduções de forma reativa e atualiza o signal.
   */
  load(keys: string[]): void {
    this.ngxTranslate.get(keys).subscribe(result => {
      this.translations.set(result);
    });
  }

  /**
   * Retorna a tradução instantânea de uma chave.
   */
  instant(key: string): string {
    return this.ngxTranslate.instant(key);
  }
}
