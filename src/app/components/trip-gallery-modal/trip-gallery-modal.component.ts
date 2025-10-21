import { Component, Input, Output, EventEmitter, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Trip } from '../../core/models/trip.model';
import { I18nService } from '../../core/services/i18n';

@Component({
  selector: 'app-trip-gallery-modal',
  imports: [CommonModule],
  templateUrl: './trip-gallery-modal.component.html',
  styleUrl: './trip-gallery-modal.component.css'
})
export class TripGalleryModalComponent implements OnInit {
  @Input() trip: Trip | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() openImage = new EventEmitter<number>();

  isLoading = true;
  loadedImages: string[] = [];

  constructor(public i18n: I18nService) {
    // Lock body scroll when modal is visible
    effect(() => {
      if (this.trip) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  ngOnInit() {
    if (this.trip) {
      this.loadImages();
    }
  }

  async loadImages() {
    if (!this.trip) return;

    this.isLoading = true;
    try {
      // Load all images in parallel
      const imagePromises = this.trip.images.map(imgPath => {
        return new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(imgPath);
          img.onerror = () => reject(new Error(`Failed to load ${imgPath}`));
          img.src = imgPath;
        });
      });

      this.loadedImages = await Promise.all(imagePromises);
    } catch (error) {
      console.error('Error loading images:', error);
      alert(this.i18n.t('trip.errorLoading'));
    } finally {
      this.isLoading = false;
    }
  }

  onClose() {
    this.closeModal.emit();
  }

  onImageClick(index: number) {
    this.openImage.emit(index);
  }

  onOverlayClick(event: MouseEvent) {
    // Close modal when clicking overlay (not modal content)
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
