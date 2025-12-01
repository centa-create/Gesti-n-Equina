import { Injectable } from '@angular/core';
import { Geolocation, GeolocationPosition } from '@capacitor/geolocation';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  constructor() { }

  /**
   * Obtiene la ubicación actual del dispositivo
   * @returns Promise con la ubicación actual
   */
  async getCurrentPosition(): Promise<LocationData> {
    try {
      const position: GeolocationPosition = await Geolocation.getCurrentPosition();

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy || undefined,
        altitude: position.coords.altitude || undefined,
        altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
        heading: position.coords.heading || undefined,
        speed: position.coords.speed || undefined,
        timestamp: position.timestamp
      };
    } catch (error) {
      console.error('Error obteniendo geolocalización:', error);
      throw error;
    }
  }

  /**
   * Monitorea cambios de ubicación en tiempo real
   * @param callback Función callback que se ejecuta cuando la ubicación cambia
   * @returns ID del observador para poder cancelarlo después
   */
  async watchPosition(
    callback: (location: LocationData) => void,
    onError?: (error: any) => void
  ): Promise<string> {
    try {
      const id = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        },
        (position: GeolocationPosition | null) => {
          if (position) {
            callback({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy || undefined,
              altitude: position.coords.altitude || undefined,
              altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
              heading: position.coords.heading || undefined,
              speed: position.coords.speed || undefined,
              timestamp: position.timestamp
            });
          }
        }
      );

      return id;
    } catch (error) {
      console.error('Error configurando watchPosition:', error);
      throw error;
    }
  }

  /**
   * Detiene el monitoreo de ubicación
   * @param id ID del observador retornado por watchPosition
   */
  async clearWatch(id: string): Promise<void> {
    try {
      await Geolocation.clearWatch({ id });
    } catch (error) {
      console.error('Error limpiando watchPosition:', error);
      throw error;
    }
  }

  /**
   * Calcula la distancia en kilómetros entre dos puntos geográficos
   * Usa la fórmula de Haversine
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }

  /**
   * Convierte coordenadas a URL de Google Maps
   */
  getGoogleMapsUrl(latitude: number, longitude: number): string {
    return `https://maps.google.com/?q=${latitude},${longitude}`;
  }

  /**
   * Convierte coordenadas a URL de OpenStreetMap
   */
  getOpenStreetMapUrl(latitude: number, longitude: number): string {
    return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`;
  }
}
