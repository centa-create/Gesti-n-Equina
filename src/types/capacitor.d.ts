declare module '@capacitor/geolocation' {
  export interface GeolocationPosition {
    coords: {
      latitude: number;
      longitude: number;
      accuracy: number;
      altitude?: number;
      altitudeAccuracy?: number;
      heading?: number;
      speed?: number;
    };
    timestamp: number;
  }

  export interface GeolocationOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
  }

  export class Geolocation {
    static getCurrentPosition(options?: GeolocationOptions): Promise<GeolocationPosition>;
    static watchPosition(options: GeolocationOptions, callback: (position: GeolocationPosition, err?: any) => void): Promise<string>;
    static clearWatch(options: { id: string }): Promise<void>;
  }
}