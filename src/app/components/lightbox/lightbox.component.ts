import { Component, Input, Output, EventEmitter, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../core/services/i18n';

@Component({
  selector: 'app-lightbox',
  imports: [CommonModule],
  templateUrl: './lightbox.component.html',
  styleUrl: './lightbox.component.css'
})
export class LightboxComponent implements OnInit {
  @Input() images: string[] = [];
  @Input() initialIndex = 0;
  @Output() closeModal = new EventEmitter<void>();

  currentIndex = 0;
  currentImage = '';
  imageOpacity = 1;

  constructor(public i18n: I18nService) {}

  ngOnInit() {
    this.currentIndex = this.initialIndex;
    this.updateImage();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch(event.key) {
      case 'Escape':
        this.onClose();
        break;
      case 'ArrowLeft':
        this.previousImage();
        break;
      case 'ArrowRight':
        this.nextImage();
        break;
    }
  }

  updateImage() {
    // Fade out
    this.imageOpacity = 0;

    // Wait for fade, then update image and fade in
    setTimeout(() => {
      this.currentImage = this.images[this.currentIndex];
      this.imageOpacity = 1;
    }, 150);
  }

  nextImage() {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
      this.updateImage();
    }
  }

  previousImage() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateImage();
    }
  }

  onClose() {
    this.closeModal.emit();
  }

  onOverlayClick(event: MouseEvent) {
    // Close lightbox when clicking overlay (not image)
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  get counter(): string {
    return `${this.currentIndex + 1} / ${this.images.length}`;
  }

  get canGoPrevious(): boolean {
    return this.currentIndex > 0;
  }

  get canGoNext(): boolean {
    return this.currentIndex < this.images.length - 1;
  }
}
