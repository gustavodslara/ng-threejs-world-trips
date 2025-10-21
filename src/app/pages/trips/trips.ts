import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpaceBackgroundComponent } from '../../components/space-background/space-background';
import { LanguageSelectorComponent } from '../../components/language-selector/language-selector';
import { EarthViewerComponent } from '../../components/earth-viewer/earth-viewer';
import { TripGalleryModalComponent } from '../../components/trip-gallery-modal/trip-gallery-modal.component';
import { LightboxComponent } from '../../components/lightbox/lightbox.component';
import { AddTripModalComponent } from '../../components/add-trip-modal/add-trip-modal.component';
import { I18nService } from '../../core/services/i18n';

@Component({
  selector: 'app-trips',
  imports: [
    CommonModule,
    SpaceBackgroundComponent,
    LanguageSelectorComponent,
    EarthViewerComponent,
    TripGalleryModalComponent,
    LightboxComponent,
    AddTripModalComponent
  ],
  templateUrl: './trips.html',
  styleUrl: './trips.css'
})
export class Trips {
  // Modal state
  selectedTrip: any = null;
  lightboxImages: string[] = [];
  lightboxIndex = 0;
  addTripCoords: {lat: number, lon: number} | null = null;

  constructor(public i18n: I18nService) {}

  // Event handlers
  onTripClicked(trip: any) {
    console.log('Trip clicked:', trip);
    this.selectedTrip = trip;
  }

  closeTripModal() {
    this.selectedTrip = null;
  }

  openLightbox(index: number) {
    if (this.selectedTrip) {
      this.lightboxImages = this.selectedTrip.images;
      this.lightboxIndex = index;
    }
  }

  closeLightbox() {
    this.lightboxImages = [];
  }

  onRightClick(coords: {lat: number, lon: number}) {
    console.log('Right click at coords:', coords);
    this.addTripCoords = coords;
  }

  closeAddTripModal() {
    this.addTripCoords = null;
  }

  onSaveTrip(tripData: any) {
    console.log('Save trip:', tripData);
    // TODO: Implement trip saving logic (save to trips.json or backend)
    alert('Trip saving functionality coming soon! Data: ' + JSON.stringify(tripData));
    this.closeAddTripModal();
  }
}
