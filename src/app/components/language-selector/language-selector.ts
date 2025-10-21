import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { I18nService, SupportedLanguage } from '../../core/services/i18n';

@Component({
  selector: 'app-language-selector',
  imports: [CommonModule, FormsModule],
  templateUrl: './language-selector.html',
  styleUrl: './language-selector.css'
})
export class LanguageSelectorComponent {
  selectedLanguage: SupportedLanguage;

  constructor(public i18n: I18nService) {
    this.selectedLanguage = this.i18n.currentLang();
  }

  onLanguageChange(): void {
    this.i18n.setLanguage(this.selectedLanguage);
  }

  onWheel(event: Event): void {
    event.stopPropagation();
  }
}
