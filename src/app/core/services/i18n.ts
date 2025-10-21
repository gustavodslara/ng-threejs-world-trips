import { Injectable, signal, computed } from '@angular/core';
import { TRANSLATIONS } from '../constants/translations';

export type SupportedLanguage = 'en-US' | 'pt-BR' | 'es-ES';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLanguage = signal<SupportedLanguage>(this.detectSystemLanguage());
  
  currentLang = computed(() => this.currentLanguage());
  translations = computed(() => TRANSLATIONS[this.currentLanguage()]);

  constructor() {
    const saved = localStorage.getItem('language') as SupportedLanguage;
    if (saved && TRANSLATIONS[saved]) {
      this.currentLanguage.set(saved);
    }
  }

  private detectSystemLanguage(): SupportedLanguage {
    const browserLang = navigator.language || (navigator as any).userLanguage;
    
    if (TRANSLATIONS[browserLang as SupportedLanguage]) {
      return browserLang as SupportedLanguage;
    }
    
    const langCode = browserLang.split('-')[0].toLowerCase();
    const availableLanguages = Object.keys(TRANSLATIONS) as SupportedLanguage[];
    
    for (const lang of availableLanguages) {
      if (lang.toLowerCase().startsWith(langCode)) {
        return lang;
      }
    }
    
    return 'en-US';
  }

  t(key: string): string {
    const translations = this.translations() as Record<string, string>;
    const fallback = TRANSLATIONS['en-US'] as Record<string, string>;
    return translations[key] || fallback[key] || key;
  }

  setLanguage(lang: SupportedLanguage): void {
    if (TRANSLATIONS[lang]) {
      this.currentLanguage.set(lang);
      localStorage.setItem('language', lang);
    }
  }

  getMonthName(monthIndex: number): string {
    const months = [
      'month.january', 'month.february', 'month.march', 'month.april',
      'month.may', 'month.june', 'month.july', 'month.august',
      'month.september', 'month.october', 'month.november', 'month.december'
    ];
    return this.t(months[monthIndex]);
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const monthName = this.getMonthName(date.getMonth());
        return `${monthName} ${date.getFullYear()}`;
      }
      return dateString;
    } catch {
      return dateString;
    }
  }
}
