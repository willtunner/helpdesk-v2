// src/app/services/theme.service.ts
import { Injectable, computed, effect, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Signal que armazena o tema atual ("dark" ou "light")
  private themeSignal = signal<'dark' | 'light'>(this.getSavedTheme() || 'dark');

  // Computed para saber se o tema atual é escuro
  isDarkTheme = computed(() => this.themeSignal() === 'dark');

  constructor() {
    // Aplica o tema no body quando a signal mudar
    effect(() => {
      const theme = this.themeSignal();
      document.body.classList.toggle('dark-theme', theme === 'dark');
      localStorage.setItem('user-theme', theme);
    });
  }

  /** Troca para o tema oposto */
  toggleTheme() {
    const newTheme = this.themeSignal() === 'dark' ? 'light' : 'dark';
    this.themeSignal.set(newTheme);
  }

  /** Força a definição de um tema */
  setTheme(theme: 'dark' | 'light') {
    this.themeSignal.set(theme);
  }

  /** Retorna o tema atual como signal */
  getTheme = () => this.themeSignal;

  /** Pega o tema salvo no localStorage */
  private getSavedTheme(): 'dark' | 'light' | null {
    const saved = localStorage.getItem('user-theme');
    return saved === 'dark' || saved === 'light' ? saved : null;
  }
}
