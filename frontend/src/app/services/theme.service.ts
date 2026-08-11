import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  currentTheme = signal<Theme>('light');

  constructor() {
    const saved = localStorage.getItem('theme') as Theme;
    if (saved === 'dark' || saved === 'light') {
      this.currentTheme.set(saved);
    } else {
      this.currentTheme.set('light');
    }

    effect(() => {
      this.applyTheme(this.currentTheme());
    });
  }

  setTheme(theme: Theme) {
    this.currentTheme.set(theme);
    localStorage.setItem('theme', theme);
  }

  toggleTheme() {
    const next = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(next);
  }

  private applyTheme(theme: Theme) {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
  }
}
