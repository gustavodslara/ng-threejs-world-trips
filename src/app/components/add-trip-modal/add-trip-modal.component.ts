import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { I18nService } from '../../core/services/i18n';
import { Coordinates } from '../../core/models/trip.model';

interface NominatimResponse {
  address: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

@Component({
  selector: 'app-add-trip-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-trip-modal.component.html',
  styleUrl: './add-trip-modal.component.css'
})
export class AddTripModalComponent implements OnInit {
  private http = inject(HttpClient);

  @Input() coordinates: Coordinates | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveTrip = new EventEmitter<any>();

  location = '';
  date = '';
  lat = 0;
  lon = 0;
  selectedFiles: File[] = [];
  isLoadingLocation = false;

  constructor(public i18n: I18nService) {}

  ngOnInit() {
    if (this.coordinates) {
      this.lat = this.coordinates.lat;
      this.lon = this.coordinates.lon;
      this.fetchLocationName();
    }
  }

  async fetchLocationName() {
    this.isLoadingLocation = true;
    try {
      const response = await this.http.get<NominatimResponse>(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${this.lat}&lon=${this.lon}&zoom=10`
      ).toPromise();

      if (response?.address) {
        const addr = response.address;
        this.location = addr.city || addr.town || addr.village ||
                       addr.county || addr.state || addr.country || '';
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    } finally {
      this.isLoadingLocation = false;
    }
  }

  onFileChange(event: any) {
    const files = event.target.files;
    if (files && files.length >= 3) {
      this.selectedFiles = Array.from(files);
    }
  }

  onSubmit() {
    if (!this.location || !this.date || this.selectedFiles.length < 3) {
      alert(this.i18n.t('addTrip.validation'));
      return;
    }

    // Create trip object
    const tripData = {
      location: this.location,
      date: this.date,
      coordinates: {
        lat: this.lat,
        lon: this.lon
      },
      files: this.selectedFiles
    };

    this.saveTrip.emit(tripData);
    this.onClose();
  }

  onClose() {
    this.closeModal.emit();
  }

  onOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
