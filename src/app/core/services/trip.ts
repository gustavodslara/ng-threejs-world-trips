import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Trip } from '../models/trip.model';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private trips = signal<Trip[]>([]);
  
  trips$ = this.trips.asReadonly();

  constructor(private http: HttpClient) {}

  loadTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>('assets/images/photos/trips.json').pipe(
      tap(trips => this.trips.set(trips))
    );
  }

  addTrip(trip: Trip): void {
    this.trips.update(trips => [...trips, trip]);
  }

  getTripById(id: number): Trip | undefined {
    return this.trips().find(t => t.id === id);
  }

  getAllTrips(): Trip[] {
    return this.trips();
  }
}
