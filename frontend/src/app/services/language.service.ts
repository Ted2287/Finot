import { Injectable, signal } from '@angular/core';
import amTranslations from '../../assets/i18n/am.json';
import enTranslations from '../../assets/i18n/en.json';

export type SupportedLanguage = 'en' | 'am';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  currentLang = signal<SupportedLanguage>('am');

  readonly dictionary: Record<SupportedLanguage, Record<string, string>> = {
    am: amTranslations as Record<string, string>,
    en: enTranslations as Record<string, string>
  };

  constructor() {
    const saved = localStorage.getItem('app_lang') as SupportedLanguage;
    if (saved && (saved === 'en' || saved === 'am')) {
      this.currentLang.set(saved);
    }
  }

  setLanguage(lang: SupportedLanguage) {
    this.currentLang.set(lang);
    localStorage.setItem('app_lang', lang);
  }

  toggleLanguage() {
    const next = this.currentLang() === 'am' ? 'en' : 'am';
    this.setLanguage(next);
  }

  t(key: string): string {
    const lang = this.currentLang();
    const langDict = this.dictionary[lang];
    const fallbackDict = this.dictionary['en'];
    return (langDict && langDict[key]) || (fallbackDict && fallbackDict[key]) || key;
  }
}
