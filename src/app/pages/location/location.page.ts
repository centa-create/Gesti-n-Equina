import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { locationOutline, reloadOutline, stopCircleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { GeolocationService, LocationData } from '../../services/geolocation.service';

@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class LocationPage implements OnInit {
  // Icon bindings para la plantilla
  locationOutline = locationOutline;
  reloadOutline = reloadOutline;
  stopCircleOutline = stopCircleOutline;
  currentLocation: LocationData | null = null;
  locationHistory: LocationData[] = [];
  isLoading = false;
  isTracking = false;
  watchId: string | null = null;
  errorMessage = '';

  constructor(
    private geolocationService: GeolocationService,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ locationOutline, reloadOutline, stopCircleOutline });
  }

  ngOnInit(): void {
    this.loadLocationHistory();
  }

  async getCurrentLocation(): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      this.cdr.markForCheck();

      this.currentLocation = await this.geolocationService.getCurrentPosition();
      this.locationHistory.push(this.currentLocation);
      this.saveLocationHistory();

      this.cdr.markForCheck();
    } catch (error: any) {
      this.errorMessage = 'Error al obtener ubicación. Verifica los permisos de geolocalización.';
      console.error('Error:', error);
      this.cdr.markForCheck();
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  async startTracking(): Promise<void> {
    try {
      this.isTracking = true;
      this.errorMessage = '';
      this.cdr.markForCheck();

      this.watchId = await this.geolocationService.watchPosition(
        (location: LocationData) => {
          this.currentLocation = location;
          this.locationHistory.push(location);
          this.saveLocationHistory();
          this.cdr.markForCheck();
        },
        (error: any) => {
          console.error('Error tracking:', error);
          this.errorMessage = 'Error durante el seguimiento de ubicación.';
          this.cdr.markForCheck();
        }
      );

      this.cdr.markForCheck();
    } catch (error: any) {
      this.errorMessage = 'Error al iniciar el seguimiento de ubicación.';
      console.error('Error:', error);
      this.isTracking = false;
      this.cdr.markForCheck();
    }
  }

  async stopTracking(): Promise<void> {
    if (this.watchId) {
      try {
        await this.geolocationService.clearWatch(this.watchId);
        this.isTracking = false;
        this.watchId = null;
        this.cdr.markForCheck();
      } catch (error) {
        console.error('Error stopping tracking:', error);
      }
    }
  }

  openInMaps(): void {
    if (this.currentLocation) {
      const url = this.geolocationService.getGoogleMapsUrl(
        this.currentLocation.latitude,
        this.currentLocation.longitude
      );
      window.open(url, '_blank');
    }
  }

  openInOpenStreetMap(): void {
    if (this.currentLocation) {
      const url = this.geolocationService.getOpenStreetMapUrl(
        this.currentLocation.latitude,
        this.currentLocation.longitude
      );
      window.open(url, '_blank');
    }
  }

  clearHistory(): void {
    this.locationHistory = [];
    localStorage.removeItem('locationHistory');
    this.cdr.markForCheck();
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    return this.geolocationService.calculateDistance(lat1, lon1, lat2, lon2);
  }

  private saveLocationHistory(): void {
    localStorage.setItem('locationHistory', JSON.stringify(this.locationHistory));
  }

  private loadLocationHistory(): void {
    const saved = localStorage.getItem('locationHistory');
    if (saved) {
      try {
        this.locationHistory = JSON.parse(saved);
        if (this.locationHistory.length > 0) {
          this.currentLocation = this.locationHistory[this.locationHistory.length - 1];
        }
        this.cdr.markForCheck();
      } catch (error) {
        console.error('Error loading location history:', error);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.isTracking && this.watchId) {
      this.stopTracking();
    }
  }
}
